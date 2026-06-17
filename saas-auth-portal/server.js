const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'saas_auth_super_secret_key_987654321'; // Store in environment variables in production

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(__dirname, 'saas_database.sqlite'), (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to saas_database.sqlite successfully.');
    initializeDatabaseSchema();
  }
});

// Create tables and seed standard pricing plan features
function initializeDatabaseSchema() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT,
      password TEXT NOT NULL,
      plan_id TEXT NOT NULL DEFAULT 'trial',
      trial_ends_at TEXT NOT NULL,
      terms_accepted INTEGER NOT NULL DEFAULT 1,
      terms_accepted_date TEXT NOT NULL
    )`);

    // 2. Plans Table
    db.run(`CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      description TEXT
    )`);

    // 3. Features Table
    db.run(`CREATE TABLE IF NOT EXISTS features (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )`);

    // 4. Plan-Features Relationship Table (Pivot Table)
    db.run(`CREATE TABLE IF NOT EXISTS plan_features (
      plan_id TEXT,
      feature_code TEXT,
      PRIMARY KEY (plan_id, feature_code),
      FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE CASCADE,
      FOREIGN KEY (feature_code) REFERENCES features (code) ON DELETE CASCADE
    )`);

    seedData();
  });
}

// Seed master features and initial pricing plans
function seedData() {
  // Check if plans already exist
  db.get("SELECT COUNT(*) as count FROM plans", (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding Master Plans & Features data...');
      
      // Seed Plans
      const plans = [
        ['trial', '7-Day Free Trial', '$0', 'Evaluation account with basic BI features.'],
        ['growth', 'Growth BI Pro', '$49/mo', 'Full predictive dashboard capabilities.'],
        ['enterprise', 'Enterprise Suite', '$199/mo', 'Unlimited access and PDF/Slides compiling studio.']
      ];
      plans.forEach(p => {
        db.run("INSERT INTO plans (id, name, price, description) VALUES (?, ?, ?, ?)", p);
      });

      // Seed Features
      const features = [
        ['csv-upload', 'CSV Data Cleaner Grid', 'Parse, cleanse, and structure raw spreadsheet records.'],
        ['plotly-charts', '16+ Plotly Visualizations', 'Dynamic drag-and-drop custom themed charts.'],
        ['predictive-forecasts', 'Predictive AI Forecasting', 'Trend regression and live factory sensor streaming.'],
        ['word-reports', 'Word & Slides Compiling Studio', 'Invoking the 21-Agent Orchestra to compile reports and slide decks.']
      ];
      features.forEach(f => {
        db.run("INSERT INTO features (code, name, description) VALUES (?, ?, ?)", f);
      });

      // Map Features to Plans (Initial Settings)
      const mappings = [
        // Trial gets basic parsing and Plotly
        ['trial', 'csv-upload'],
        ['trial', 'plotly-charts'],
        
        // Growth gets basic + Predictive
        ['growth', 'csv-upload'],
        ['growth', 'plotly-charts'],
        ['growth', 'predictive-forecasts'],
        
        // Enterprise gets absolutely everything
        ['enterprise', 'csv-upload'],
        ['enterprise', 'plotly-charts'],
        ['enterprise', 'predictive-forecasts'],
        ['enterprise', 'word-reports']
      ];
      mappings.forEach(m => {
        db.run("INSERT INTO plan_features (plan_id, feature_code) VALUES (?, ?)", m);
      });
      console.log('Database seeding finished successfully.');
    }
  });
}

// ================= MIDDLEWARE LAYERS =================

// Middleware A: Authenticate incoming JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access Denied. Session token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid.' });
    }
    req.user = user;
    next();
  });
};

// Middleware B: Validate Free Trial Expiration
const validateTrialLifecycle = (req, res, next) => {
  db.get("SELECT plan_id, trial_ends_at FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: 'Failed to evaluate account lifecycle.' });
    }

    if (user.plan_id === 'trial') {
      const trialEnds = new Date(user.trial_ends_at);
      const now = new Date();
      if (now > trialEnds) {
        return res.status(403).json({ 
          error: 'Your 7-Day Free Trial has expired!',
          code: 'TRIAL_EXPIRED'
        });
      }
    }
    next();
  });
};

// Middleware C: Granular Feature Gate Authorization
const hasFeatureAccess = (featureCode) => {
  return (req, res, next) => {
    const userId = req.user.id;
    
    const query = `
      SELECT pf.feature_code 
      from users u
      join plan_features pf on u.plan_id = pf.plan_id
      where u.id = ? and pf.feature_code = ?
    `;
    
    db.get(query, [userId, featureCode], (err, mapping) => {
      if (err) {
        return res.status(500).json({ error: 'Access check query failed.' });
      }
      
      if (!mapping) {
        return res.status(403).json({ 
          error: `Access Denied. The feature '${featureCode}' is restricted under your active plan.`,
          code: 'FEATURE_RESTRICTED'
        });
      }
      next();
    });
  };
};

// ================= AUTH API ENDPOINTS =================

// 1. REGISTER CUSTOM EMAIL API
app.post('/api/register', async (req, res) => {
  const { name, email, mobile, password, termsAccepted } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, Email, and Password are required.' });
  }

  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept the Terms and Conditions to register.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Calculate 7-Day Trial expiration timestamp
    const trialEndsDate = new Date();
    trialEndsDate.setDate(trialEndsDate.getDate() + 7);
    const trial_ends_at = trialEndsDate.toISOString();
    
    const terms_accepted_date = new Date().toISOString();

    const sql = `INSERT INTO users (name, email, mobile, password, plan_id, trial_ends_at, terms_accepted, terms_accepted_date) 
                 VALUES (?, ?, ?, ?, 'trial', ?, 1, ?)`;
                 
    db.run(sql, [name, email, mobile || null, hashedPassword, trial_ends_at, terms_accepted_date], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already registered.' });
        }
        return res.status(500).json({ error: 'Registration failed.' });
      }
      res.status(201).json({ message: 'Registration successful! 7-Day Trial activated.' });
    });
  } catch (e) {
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// 2. LOGIN CUSTOM EMAIL API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Account does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name }, 
      JWT_SECRET, 
      { expiresIn: '2h' }
    );

    res.status(200).json({
      token,
      email: user.email,
      name: user.name,
      plan_id: user.plan_id
    });
  });
});

// 3. MOCK SOCIAL LOGIN API (OAuth 2.0 Google / GitHub)
app.post('/api/oauth-login', (req, res) => {
  const { provider, oauthToken, name, email } = req.body;

  if (!provider || !email) {
    return res.status(400).json({ error: 'OAuth exchange parameters missing.' });
  }

  // Find or Create OAuth User in Database
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (user) {
      // Existing user sign in
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
      return res.status(200).json({ token, email: user.email, name: user.name, plan_id: user.plan_id });
    } else {
      // Create new user with dummy password and auto trial
      const dummyPassword = bcrypt.hashSync(Math.random().toString(36), 10);
      const trialEndsDate = new Date();
      trialEndsDate.setDate(trialEndsDate.getDate() + 7);
      const trial_ends_at = trialEndsDate.toISOString();
      const terms_accepted_date = new Date().toISOString();

      const sql = `INSERT INTO users (name, email, password, plan_id, trial_ends_at, terms_accepted, terms_accepted_date) 
                   VALUES (?, ?, ?, 'trial', ?, 1, ?)`;
      
      db.run(sql, [name || provider + ' User', email, dummyPassword, trial_ends_at, terms_accepted_date], function(err) {
        if (err) {
          return res.status(500).json({ error: 'OAuth user registration failed.' });
        }
        
        const token = jwt.sign({ id: this.lastID, email, name: name || provider + ' User' }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({ token, email, name: name || provider + ' User', plan_id: 'trial' });
      });
    }
  });
});

// ================= ACCOUNT RECOVERY ENDPOINTS =================

// 4. FORGOT PASSWORD (Generate Sim Token)
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  db.get("SELECT id FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'No user account matched to this email.' });
    }
    // Simulation: Generate reset token and display link directly in UI for demonstration
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
    res.status(200).json({
      message: 'Password reset link compiled successfully!',
      resetLink: `http://localhost:5000/reset-password.html?token=${resetToken}`
    });
  });
});

// 5. RESET PASSWORD
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    db.run("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, decoded.email], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update credentials.' });
      }
      res.status(200).json({ message: 'Password updated successfully! You may now sign in.' });
    });
  } catch (e) {
    res.status(400).json({ error: 'Reset token is invalid or has expired.' });
  }
});

// 6. FORGOT LOGIN ID (Fetch Email by Mobile Number)
app.post('/api/recover-login-id', (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: 'Mobile number is required for recovery.' });
  }

  db.get("SELECT email, name FROM users WHERE mobile = ?", [mobile], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'No account matching this mobile number exists.' });
    }
    // Secure verification mask: e.g. a***b@domain.com
    const email = user.email;
    const atIdx = email.indexOf('@');
    const maskedEmail = email[0] + '***' + email[atIdx - 1] + email.substring(atIdx);
    
    res.status(200).json({
      message: `ID recovered successfully. Registered credentials:`,
      rawEmail: email, // Provided directly for ease of use in demo
      maskedEmail: maskedEmail
    });
  });
});

// ================= ADMIN PLAN BUILDER ROUTE ENDPOINTS =================

// 7. GET PLAN STRUCTURE MAPPINGS
app.get('/api/admin/plans', (req, res) => {
  db.all("SELECT * FROM plans", (err, plans) => {
    db.all("SELECT * FROM features", (err, features) => {
      db.all("SELECT * FROM plan_features", (err, mappings) => {
        res.status(200).json({ plans, features, mappings });
      });
    });
  });
});

// 8. UPDATE PLAN FEATURES DYNAMICALLY (DYNAMIC CHECKBOX SAVING)
app.post('/api/admin/plans/update-features', (req, res) => {
  const { plan_id, feature_codes } = req.body; // array of feature codes to set

  if (!plan_id || !Array.isArray(feature_codes)) {
    return res.status(400).json({ error: 'Plan ID and list of feature codes required.' });
  }

  db.serialize(() => {
    // Delete existing maps
    db.run("DELETE FROM plan_features WHERE plan_id = ?", [plan_id], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to reset plan mapping.' });

      // Insert new maps
      const stmt = db.prepare("INSERT INTO plan_features (plan_id, feature_code) VALUES (?, ?)");
      feature_codes.forEach(code => {
        stmt.run(plan_id, code);
      });
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'Failed to update feature gates.' });
        res.status(200).json({ message: `Successfully updated feature permissions for plan: ${plan_id}` });
      });
    });
  });
});

// 9. PROFILE DETAILS ENDPOINT
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get("SELECT id, name, email, mobile, plan_id, trial_ends_at FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User details not found.' });

    // Calculate days remaining on Trial
    const ends = new Date(user.trial_ends_at);
    const remaining = Math.max(0, ends.getTime() - Date.now());
    const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));

    res.status(200).json({
      user,
      trialDaysRemaining: user.plan_id === 'trial' ? daysLeft : null
    });
  });
});

// ================= FEATURE GATED ENDPOINTS =================

// Endpoint A: CSV Upload gated
app.get('/api/features/csv-upload', authenticateToken, validateTrialLifecycle, hasFeatureAccess('csv-upload'), (req, res) => {
  res.status(200).json({ data: "ACCESS GRANTED: CSV Cleaner Parser nodes unlocked." });
});

// Endpoint B: Plotly Charts gated
app.get('/api/features/plotly-charts', authenticateToken, validateTrialLifecycle, hasFeatureAccess('plotly-charts'), (req, res) => {
  res.status(200).json({ data: "ACCESS GRANTED: 16+ Plotly Visual Layout nodes unlocked." });
});

// Endpoint C: Predictive Forecasts gated
app.get('/api/features/predictive-forecasts', authenticateToken, validateTrialLifecycle, hasFeatureAccess('predictive-forecasts'), (req, res) => {
  res.status(200).json({ data: "ACCESS GRANTED: AI Predictive Regression nodes unlocked." });
});

// Endpoint D: Reports compiling studio gated
app.get('/api/features/word-reports', authenticateToken, validateTrialLifecycle, hasFeatureAccess('word-reports'), (req, res) => {
  res.status(200).json({ data: "ACCESS GRANTED: 21-Agent Orchestra Synthesis Compiler unlocked." });
});

// Fallback HTML router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SaaS Authentication Server running at http://localhost:${PORT}`);
});
