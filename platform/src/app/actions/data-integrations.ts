'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

// ─── Auth Helper ───
async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  return session;
}

// ─── Integration Providers Config ───
const PROVIDERS: Record<string, {
  name: string;
  icon: string;
  color: string;
  scopes: string;
  description: string;
  category: 'analytics' | 'ecommerce' | 'payments' | 'crm' | 'advertising' | 'social';
}> = {
  shopify: {
    name: 'Shopify',
    icon: '🛍️',
    color: '#96BF48',
    scopes: 'read_products,read_orders,read_customers,read_analytics',
    description: 'Sync your Shopify store products, orders, and customer data.',
    category: 'ecommerce',
  },
  google_analytics: {
    name: 'Google Analytics',
    icon: '📊',
    color: '#F9AB00',
    scopes: 'analytics.readonly',
    description: 'Import website traffic, user behavior, and conversion data.',
    category: 'analytics',
  },
  facebook_ads: {
    name: 'Facebook Ads',
    icon: '📣',
    color: '#1877F2',
    scopes: 'ads_management,ads_read,insights',
    description: 'Pull ad performance, spend analytics, and audience insights.',
    category: 'advertising',
  },
  stripe: {
    name: 'Stripe',
    icon: '💳',
    color: '#635BFF',
    scopes: 'read_only',
    description: 'Access payment history, subscriptions, and revenue metrics.',
    category: 'payments',
  },
  salesforce: {
    name: 'Salesforce',
    icon: '☁️',
    color: '#00A1E0',
    scopes: 'api,refresh_token,offline_access',
    description: 'Sync CRM contacts, opportunities, leads, and pipeline data.',
    category: 'crm',
  },
  hubspot: {
    name: 'HubSpot',
    icon: '🔶',
    color: '#FF7A59',
    scopes: 'contacts,deals,analytics',
    description: 'Connect marketing, sales, and customer service data.',
    category: 'crm',
  },
  google_ads: {
    name: 'Google Ads',
    icon: '🎯',
    color: '#4285F4',
    scopes: 'adwords.readonly',
    description: 'Import campaign performance, keywords, and ad spend data.',
    category: 'advertising',
  },
  instagram: {
    name: 'Instagram',
    icon: '📸',
    color: '#E4405F',
    scopes: 'instagram_basic,instagram_manage_insights',
    description: 'Analyze post engagement, follower growth, and story metrics.',
    category: 'social',
  },
  mailchimp: {
    name: 'Mailchimp',
    icon: '📧',
    color: '#FFE01B',
    scopes: 'lists,campaigns,reports',
    description: 'Sync email campaign performance and subscriber data.',
    category: 'advertising',
  },
  woocommerce: {
    name: 'WooCommerce',
    icon: '🛒',
    color: '#96588A',
    scopes: 'read_products,read_orders',
    description: 'Connect your WooCommerce store for order and product analytics.',
    category: 'ecommerce',
  },
};

// ─── 1. GET AVAILABLE PROVIDERS ───
export async function getIntegrationProviders() {
  await requireAuth();
  return {
    success: true,
    providers: Object.entries(PROVIDERS).map(([key, val]) => ({
      id: key,
      ...val,
    })),
  };
}

// ─── 2. GET USER'S CONNECTED INTEGRATIONS ───
export async function getUserDataIntegrations() {
  const session = await requireAuth();
  try {
    const integrations = await prisma.userIntegration.findMany({
      where: { userId: session.user!.id! },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, integrations };
  } catch {
    return { success: false, error: 'Failed to fetch integrations.' };
  }
}

// ─── 3. CONNECT AN INTEGRATION (Mock OAuth) ───
export async function connectDataIntegration(provider: string) {
  const session = await requireAuth();
  const config = PROVIDERS[provider];
  if (!config) return { success: false, error: 'Unknown integration provider.' };

  try {
    const mockAccessToken = `tok_${provider}_${Math.random().toString(36).substring(2, 15)}`;
    const mockRefreshToken = `ref_${provider}_${Math.random().toString(36).substring(2, 15)}`;
    const mockAccountId = `acct_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const integration = await prisma.userIntegration.upsert({
      where: {
        userId_provider: {
          userId: session.user!.id!,
          provider,
        },
      },
      update: {
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        providerAccountId: mockAccountId,
        scopes: config.scopes,
        status: 'active',
        lastSyncAt: new Date(),
        metadata: JSON.stringify({
          connectedAt: new Date().toISOString(),
          accountName: `${session.user!.name || 'User'}'s ${config.name}`,
        }),
      },
      create: {
        userId: session.user!.id!,
        provider,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        providerAccountId: mockAccountId,
        scopes: config.scopes,
        status: 'active',
        lastSyncAt: new Date(),
        metadata: JSON.stringify({
          connectedAt: new Date().toISOString(),
          accountName: `${session.user!.name || 'User'}'s ${config.name}`,
        }),
      },
    });

    return {
      success: true,
      message: `${config.name} connected successfully!`,
      integration,
    };
  } catch (error: any) {
    console.error('CONNECT_ERROR', error);
    return { success: false, error: `Failed to connect ${config.name}. ${error.message || ''}` };
  }
}

// ─── 4. DISCONNECT AN INTEGRATION ───
export async function disconnectDataIntegration(provider: string) {
  const session = await requireAuth();
  try {
    await prisma.userIntegration.delete({
      where: {
        userId_provider: {
          userId: session.user!.id!,
          provider,
        },
      },
    });
    return { success: true, message: `${PROVIDERS[provider]?.name || provider} disconnected.` };
  } catch {
    return { success: false, error: 'Integration not found or already disconnected.' };
  }
}

// ─── 5. TRIGGER DATA SYNC (Simulated) ───
export async function triggerDataSync(provider: string) {
  const session = await requireAuth();
  try {
    const integration = await prisma.userIntegration.findUnique({
      where: {
        userId_provider: {
          userId: session.user!.id!,
          provider,
        },
      },
    });

    if (!integration || integration.status !== 'active') {
      return { success: false, error: 'Integration is not active.' };
    }

    const syncMetrics = generateSyncMetrics(provider);

    await prisma.userIntegration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    });

    return {
      success: true,
      message: `Sync completed for ${PROVIDERS[provider]?.name || provider}.`,
      metrics: syncMetrics,
    };
  } catch {
    return { success: false, error: 'Data sync failed.' };
  }
}

// ─── 6. GET USER'S ENTERPRISE DATABASES ───
export async function getUserEnterpriseDbs() {
  const session = await requireAuth();
  try {
    const databases = await prisma.enterpriseDatabase.findMany({
      where: { userId: session.user!.id! },
      orderBy: { createdAt: 'desc' },
    });
    const safe = databases.map((db) => ({ ...db, passwordEncrypted: db.passwordEncrypted ? '••••••••' : null }));
    return { success: true, databases: safe };
  } catch {
    return { success: false, error: 'Failed to fetch databases.' };
  }
}

// ─── 7. ADD ENTERPRISE DATABASE ───
export async function addEnterpriseDb(data: {
  name: string;
  engine: string;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password: string;
  sslMode?: string;
}) {
  const session = await requireAuth();
  try {
    const testResult = simulateConnectionTest(data.engine, data.host, data.port);
    if (!testResult.ok) {
      return { success: false, error: testResult.error };
    }

    const database = await prisma.enterpriseDatabase.create({
      data: {
        userId: session.user!.id!,
        name: data.name,
        engine: data.engine,
        host: data.host,
        port: data.port,
        databaseName: data.databaseName,
        username: data.username,
        passwordEncrypted: Buffer.from(data.password).toString('base64'),
        sslMode: data.sslMode || 'prefer',
        status: 'connected',
        lastSyncAt: new Date(),
      },
    });

    return {
      success: true,
      message: `${data.name} connected successfully!`,
      database: { ...database, passwordEncrypted: '••••••••' },
    };
  } catch {
    return { success: false, error: 'Failed to save database connection.' };
  }
}

// ─── 8. REMOVE ENTERPRISE DATABASE ───
export async function removeEnterpriseDb(dbId: string) {
  const session = await requireAuth();
  try {
    const db = await prisma.enterpriseDatabase.findFirst({
      where: { id: dbId, userId: session.user!.id! },
    });
    if (!db) return { success: false, error: 'Database not found.' };

    await prisma.enterpriseDatabase.delete({ where: { id: dbId } });
    return { success: true, message: `${db.name} removed.` };
  } catch {
    return { success: false, error: 'Failed to remove database.' };
  }
}

// ─── 9. TEST DB CONNECTION ───
export async function testDbConnection(dbId: string) {
  const session = await requireAuth();
  try {
    const db = await prisma.enterpriseDatabase.findFirst({
      where: { id: dbId, userId: session.user!.id! },
    });
    if (!db) return { success: false, error: 'Database not found.' };

    const result = simulateConnectionTest(db.engine, db.host, db.port || 5432);

    await prisma.enterpriseDatabase.update({
      where: { id: dbId },
      data: { status: result.ok ? 'connected' : 'failed', lastSyncAt: result.ok ? new Date() : undefined },
    });

    return {
      success: result.ok,
      message: result.ok ? 'Connection successful!' : result.error,
      latency: result.latency,
    };
  } catch {
    return { success: false, error: 'Connection test failed.' };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function generateSyncMetrics(provider: string) {
  const base: Record<string, Record<string, number | string>> = {
    shopify: {
      products: Math.floor(Math.random() * 500) + 50,
      orders: Math.floor(Math.random() * 2000) + 100,
      customers: Math.floor(Math.random() * 5000) + 200,
      revenue: parseFloat((Math.random() * 100000 + 5000).toFixed(2)),
    },
    google_analytics: {
      sessions: Math.floor(Math.random() * 50000) + 5000,
      pageViews: Math.floor(Math.random() * 150000) + 10000,
      bounceRate: parseFloat((Math.random() * 40 + 20).toFixed(1)),
      avgDuration: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 59)}s`,
    },
    facebook_ads: {
      campaigns: Math.floor(Math.random() * 20) + 3,
      impressions: Math.floor(Math.random() * 500000) + 10000,
      clicks: Math.floor(Math.random() * 15000) + 500,
      spend: parseFloat((Math.random() * 5000 + 200).toFixed(2)),
    },
    stripe: {
      totalRevenue: parseFloat((Math.random() * 200000 + 10000).toFixed(2)),
      subscriptions: Math.floor(Math.random() * 500) + 20,
      refunds: Math.floor(Math.random() * 30) + 1,
      mrr: parseFloat((Math.random() * 25000 + 2000).toFixed(2)),
    },
    salesforce: {
      contacts: Math.floor(Math.random() * 10000) + 500,
      opportunities: Math.floor(Math.random() * 200) + 10,
      deals_closed: Math.floor(Math.random() * 50) + 5,
      pipeline_value: parseFloat((Math.random() * 1000000 + 50000).toFixed(2)),
    },
  };

  return {
    provider,
    syncedAt: new Date().toISOString(),
    recordsProcessed: Math.floor(Math.random() * 10000) + 500,
    durationMs: Math.floor(Math.random() * 4000) + 800,
    data: base[provider] || {
      records: Math.floor(Math.random() * 5000) + 100,
      updated: Math.floor(Math.random() * 500) + 10,
    },
  };
}

function simulateConnectionTest(engine: string, host: string, port: number) {
  const latency = Math.floor(Math.random() * 150) + 20;

  if (host === 'localhost' || host === '127.0.0.1' || host.includes('.')) {
    return { ok: true, latency: `${latency}ms`, error: null };
  }

  return {
    ok: false,
    latency: null,
    error: `ECONNREFUSED: Could not connect to ${engine}://${host}:${port}. Verify credentials and firewall rules.`,
  };
}
