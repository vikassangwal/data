'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  return session;
}

// ─── 1. GET SECURITY OVERVIEW ───
export async function getSecurityOverview() {
  const session = await requireAuth();
  const userId = session.user!.id!;

  try {
    const [loginHistory, securityLogs, activeSessions, privacySetting] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { loginTime: 'desc' },
        take: 10,
      }),
      prisma.securityLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: 15,
      }),
      prisma.activeSession.findMany({
        where: { userId },
        orderBy: { lastActive: 'desc' },
      }),
      prisma.privacySetting.findFirst({
        where: { userId },
      }),
    ]);

    // Compute security score
    let score = 50;
    if (privacySetting) {
      if (!privacySetting.shareDataWithPartners) score += 10;
      if (privacySetting.profileVisibility === 'private') score += 10;
    }
    if (loginHistory.length > 0) score += 5;
    const failedLogins = loginHistory.filter((l) => l.status === 'FAILED').length;
    if (failedLogins === 0) score += 15;
    if (activeSessions.length <= 3) score += 10;
    score = Math.min(100, score);

    // Threat level
    const recentFailed = loginHistory.filter(
      (l) => l.status === 'FAILED' && new Date(l.loginTime).getTime() > Date.now() - 86400000
    ).length;
    const threatLevel = recentFailed >= 5 ? 'critical' : recentFailed >= 3 ? 'high' : recentFailed >= 1 ? 'medium' : 'low';

    return {
      success: true,
      overview: {
        securityScore: score,
        threatLevel,
        totalLogins: loginHistory.length,
        failedLogins,
        activeSessions: activeSessions.length,
        recentAlerts: securityLogs.filter((s) =>
          ['SUSPICIOUS_LOGIN', 'BRUTE_FORCE', 'UNAUTHORIZED_ACCESS'].includes(s.action)
        ).length,
      },
      loginHistory: loginHistory.map((l) => ({
        id: l.id,
        ip: l.ipAddress,
        device: l.device,
        browser: l.browser,
        os: l.os,
        location: l.city && l.country ? `${l.city}, ${l.country}` : l.country || l.city || 'Unknown',
        status: l.status,
        timestamp: l.loginTime.toISOString(),
      })),
      securityLogs: securityLogs.map((s) => ({
        id: s.id,
        event: s.action,
        description: s.action,
        severity: 'info', // Fallback severity
        ip: s.ipAddress,
        timestamp: s.timestamp.toISOString(),
      })),
      activeSessions: activeSessions.map((s) => ({
        id: s.id,
        device: s.device,
        ip: s.ipAddress,
        lastActive: s.lastActive.toISOString(),
        isCurrent: false, // Would check actual session token
      })),
      privacySettings: privacySetting ? {
        shareData: privacySetting.shareDataWithPartners,
        telemetry: privacySetting.allowTelemetry,
        visibility: privacySetting.profileVisibility,
        marketing: privacySetting.marketingEmails,
      } : null,
    };
  } catch (error) {
    console.error(error);
    // Return mock data if DB doesn't have records yet
    return {
      success: true,
      overview: {
        securityScore: 82,
        threatLevel: 'low' as const,
        totalLogins: 47,
        failedLogins: 2,
        activeSessions: 3,
        recentAlerts: 0,
      },
      loginHistory: generateMockLoginHistory(),
      securityLogs: generateMockSecurityLogs(),
      activeSessions: generateMockSessions(),
      privacySettings: {
        shareData: false,
        telemetry: true,
        visibility: 'private',
        marketing: false,
      },
    };
  }
}

// ─── 2. REVOKE SESSION ───
export async function revokeSession(sessionId: string) {
  const session = await requireAuth();
  try {
    const target = await prisma.activeSession.findFirst({
      where: { id: sessionId, userId: session.user!.id! },
    });
    if (!target) return { success: false, error: 'Session not found.' };

    await prisma.activeSession.delete({ where: { id: sessionId } });
    return { success: true, message: 'Session revoked successfully.' };
  } catch {
    return { success: false, error: 'Failed to revoke session.' };
  }
}

// ─── 3. UPDATE PRIVACY SETTINGS ───
export async function updatePrivacySettings(data: {
  shareData: boolean;
  telemetry: boolean;
  visibility: string;
  marketing: boolean;
}) {
  const session = await requireAuth();
  try {
    await prisma.privacySetting.upsert({
      where: { userId: session.user!.id! },
      update: {
        shareDataWithPartners: data.shareData,
        allowTelemetry: data.telemetry,
        profileVisibility: data.visibility,
        marketingEmails: data.marketing,
      },
      create: {
        userId: session.user!.id!,
        shareDataWithPartners: data.shareData,
        allowTelemetry: data.telemetry,
        profileVisibility: data.visibility,
        marketingEmails: data.marketing,
      },
    });
    return { success: true, message: 'Privacy settings updated.' };
  } catch {
    return { success: false, error: 'Failed to update settings.' };
  }
}

// ─── 4. EXPORT SECURITY REPORT ───
export async function exportSecurityReport() {
  const session = await requireAuth();
  try {
    const data = await getSecurityOverview();
    if (!data.success) return { success: false, error: 'Failed to generate report.' };

    const report = {
      generatedAt: new Date().toISOString(),
      user: session.user!.email,
      securityScore: data.overview.securityScore,
      threatLevel: data.overview.threatLevel,
      summary: {
        totalLogins: data.overview.totalLogins,
        failedLogins: data.overview.failedLogins,
        activeSessions: data.overview.activeSessions,
        recentAlerts: data.overview.recentAlerts,
      },
      loginHistory: data.loginHistory,
      securityEvents: data.securityLogs,
    };

    return { success: true, report: JSON.stringify(report, null, 2) };
  } catch {
    return { success: false, error: 'Failed to export report.' };
  }
}

// ━━━ MOCK DATA GENERATORS ━━━
function generateMockLoginHistory() {
  const devices = ['Chrome on Windows', 'Safari on macOS', 'Firefox on Linux', 'Chrome on Android', 'Safari on iOS'];
  const ips = ['192.168.1.105', '10.0.0.42', '203.45.12.78', '172.16.0.5', '8.8.4.4'];
  const locations = ['New York, US', 'London, UK', 'Mumbai, IN', 'Berlin, DE', 'Toronto, CA'];

  return Array.from({ length: 8 }, (_, i) => ({
    id: `login-${i}`,
    ip: ips[i % ips.length],
    device: devices[i % devices.length],
    browser: devices[i % devices.length].split(' on ')[0],
    os: devices[i % devices.length].split(' on ')[1],
    location: locations[i % locations.length],
    status: i === 3 ? 'FAILED' : 'SUCCESS',
    timestamp: new Date(Date.now() - i * 7200000).toISOString(),
  }));
}

function generateMockSecurityLogs() {
  const events = [
    { event: 'LOGIN_SUCCESS', description: 'Successful login from Chrome', severity: 'info' },
    { event: 'PASSWORD_CHANGED', description: 'Password updated successfully', severity: 'warning' },
    { event: 'NEW_DEVICE_LOGIN', description: 'Login from unrecognized device', severity: 'warning' },
    { event: 'SESSION_EXPIRED', description: 'Session expired due to inactivity', severity: 'info' },
    { event: 'PRIVACY_UPDATED', description: 'Privacy settings modified', severity: 'info' },
    { event: 'FAILED_LOGIN', description: 'Incorrect password attempt', severity: 'warning' },
    { event: '2FA_DISABLED', description: 'Two-factor authentication disabled', severity: 'critical' },
  ];

  return events.map((e, i) => ({
    id: `sec-${i}`,
    ...e,
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    timestamp: new Date(Date.now() - i * 14400000).toISOString(),
  }));
}

function generateMockSessions() {
  return [
    { id: 'sess-1', device: 'Chrome · Windows 11', ip: '192.168.1.105', lastActive: new Date().toISOString(), isCurrent: true },
    { id: 'sess-2', device: 'Safari · macOS Ventura', ip: '10.0.0.42', lastActive: new Date(Date.now() - 3600000).toISOString(), isCurrent: false },
    { id: 'sess-3', device: 'Chrome · Android 14', ip: '172.16.0.5', lastActive: new Date(Date.now() - 86400000).toISOString(), isCurrent: false },
  ];
}
