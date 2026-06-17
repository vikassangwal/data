# DevForge Enterprise Platform Technical & User Manual

## 1. Authentication, Security, and User Management

### Google OAuth Integration
DevForge enforces secure authentication processes by configuring the Google Identity Provider with:
- `prompt: 'select_account'`: Ensures users are always prompted to choose their specific Google email address, preventing auto-login with cached browser sessions.
- `allowDangerousEmailAccountLinking: true`: Enables merging an existing credentials-based email/password account with a Google Sign-In profile using the same email.

### Dynamic Account Integration (Linking/Unlinking)
Users can manage third-party authentication links in their Profile dashboard `/profile`:
- **Linking**: Connects a credentials account to Google OAuth. Creates a record in the `Account` database table linked to the User.
- **Unlinking**: Severs the Google OAuth record. Safety checks prevent unlinking if no credentials password is set for the account, protecting the user from lockout.

### 6-Digit OTP Password Recovery Flow
Instead of raw email reset links, password recovery uses a secure 6-digit OTP verification:
- An OTP is generated (`Math.random` based 6-digit) and saved in the DB (`resetOtp` and `resetOtpExpires`).
- The OTP expires in 10 minutes.
- The user inputs the OTP on the verification form.
- Upon successful validation, the system issues a short-lived, signed JWT (`resetToken` containing `{email, otpVerified: true}`).
- The final password change action verifies this JWT before modifying the password hash.

---

## 2. Advanced Data Ingestion & Machine Learning Pipeline

### Dynamic Header Scanning & Text-To-Float Cast
Raw files uploaded to the platform (such as CSVs) are cleaned by `scripts/ml_pipeline.py` using a dynamic type-inference scanner:
1. **Dtype Assessment**: The system identifies text columns (dtype `object`).
2. **Numeric Scrubbing**: For non-empty text values, symbols like `$`, `€`, `£`, `%`, and commas (`,`) are removed.
3. **80% Cast Threshold**: If 80% or more of the non-null entries in an object column are successfully convertible to floating-point numbers, the column is cast to `float64` rather than processed as categorical.
4. **Categorical Correction**: This prevents numeric columns (such as currency values or formatted percentages) from being mapped to arbitrary integer categories like `"00"` by downstream label encoders.

### Auto-Configuring ML Engine
Depending on the target variable selected and dataset columns:
- **Classification**: Triggered when the target column is boolean, text, or has 10 or fewer unique values. Employs a `RandomForestClassifier`.
- **Regression**: Triggered when the target column is numeric with more than 10 unique values. Employs a `RandomForestRegressor`.
- **Clustering (Unsupervised)**: Triggered when no target column is provided or selected. Applies `KMeans` clustering and `PCA` dimensionality reduction.

---

## 3. Subscription Pricing & Feature Gates

### Gating Matrix & Direct Checkout Routing
All features are locked behind subscription tiers:
- **Trial**: Row upload limit of 10,000, 50 AI questions, features restricted to `csv-upload` and `plotly-charts`.
- **Pro**: Row upload limit of 100,000, 500 AI questions, features include `predictive-forecasts`.
- **Enterprise**: Unlimited rows, unlimited AI questions, includes `word-reports`.

Checkout actions record the transaction inside the `Transaction` table (marking status `SUCCESS`), and update the User's `planId` to the matching tier.
If a user is already on a paid plan, upgrade buttons are hidden.

---

## 4. Self-Healing & Hot-Fix Applicator

### Active Auto-Repair Configuration
The self-healing script at `self-healing.ts` actively monitors runtime server logs:
- When a compile error or crash is detected, the script parses AST nodes to identify code issues.
- Safe hot-fixes are applied directly using filesystem writes.
- Safeguards verify the code compiles successfully before proceeding.
