'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import { generateInsights } from './insights';

/* ─── Types ─── */
export interface AgentAction {
  id: string;
  type: 'alert' | 'disable' | 'flag' | 'optimize' | 'report';
  target: string;
  description: string;
  status: 'proposed' | 'approved' | 'executed' | 'rejected';
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  result?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  rules: AgentRule[];
  isAutoApprove: boolean;
  isActive: boolean;
  lastRun?: string;
  actionsExecuted: number;
}

export interface AgentRule {
  id: string;
  condition: string; // e.g., "outliers > 10"
  action: string; // e.g., "flag_anomaly"
  threshold?: number;
  column?: string;
}

/* ─── Built-in Agent Templates ─── */
const BUILT_IN_AGENTS: AgentConfig[] = [
  {
    id: 'anomaly-detector',
    name: 'Anomaly Detector',
    role: 'Monitors datasets for unusual patterns and flags anomalies automatically',
    rules: [
      { id: 'r1', condition: 'outlier_count > 5', action: 'flag_anomaly', threshold: 5 },
      { id: 'r2', condition: 'missing_data > 20%', action: 'alert', threshold: 20 },
    ],
    isAutoApprove: false,
    isActive: true,
    actionsExecuted: 0
  },
  {
    id: 'data-quality-guard',
    name: 'Data Quality Guard',
    role: 'Ensures data quality standards are met before analysis',
    rules: [
      { id: 'r3', condition: 'duplicate_rows > 0', action: 'flag_anomaly' },
      { id: 'r4', condition: 'data_quality_score < 60', action: 'alert', threshold: 60 },
    ],
    isAutoApprove: false,
    isActive: true,
    actionsExecuted: 0
  },
  {
    id: 'trend-watcher',
    name: 'Trend Watcher',
    role: 'Watches for significant trend changes and alerts stakeholders',
    rules: [
      { id: 'r5', condition: 'trend_change > 30%', action: 'alert', threshold: 30 },
      { id: 'r6', condition: 'loss_detected', action: 'report' },
    ],
    isAutoApprove: false,
    isActive: true,
    actionsExecuted: 0
  },
  {
    id: 'auto-optimizer',
    name: 'Auto Optimizer',
    role: 'Automatically cleans and optimizes datasets when issues are detected',
    rules: [
      { id: 'r7', condition: 'auto_cleanable_issues > 3', action: 'optimize', threshold: 3 },
    ],
    isAutoApprove: true,
    isActive: false,
    actionsExecuted: 0
  },
];

/* ─── Main Actions ─── */
export async function getAgentConfigs() {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Auth required' };
  
  // In production, these would come from DB. For now, use built-in templates.
  return { success: true, data: BUILT_IN_AGENTS };
}

export async function runAgent(agentId: string, datasetId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Auth required' };

  try {
    const agent = BUILT_IN_AGENTS.find(a => a.id === agentId);
    if (!agent) return { success: false, error: 'Agent not found' };
    if (!agent.isActive) return { success: false, error: 'Agent is paused' };

    // Run insights to get data analysis
    const insightResult = await generateInsights(datasetId);
    if (!insightResult.success) return { success: false, error: insightResult.error };

    const insights = insightResult.data!.insights;
    const score = insightResult.data!.score;
    const actions: AgentAction[] = [];
    let actionId = 0;

    // Evaluate rules against insights
    for (const rule of agent.rules) {
      switch (rule.condition) {
        case 'outlier_count > 5': {
          const outlierInsights = insights.filter(i => i.type === 'anomaly' && i.title.includes('Outlier'));
          const totalOutliers = outlierInsights.reduce((s, i) => s + (i.value || 0), 0);
          if (totalOutliers > (rule.threshold || 5)) {
            actions.push({
              id: `action-${actionId++}`,
              type: 'flag',
              target: `Dataset outliers (${totalOutliers} found)`,
              description: `Detected ${totalOutliers} outliers across ${outlierInsights.length} columns. ${outlierInsights.map(i => i.column).join(', ')}`,
              status: agent.isAutoApprove ? 'executed' : 'proposed',
              severity: totalOutliers > 20 ? 'critical' : 'warning',
              timestamp: new Date().toISOString()
            });
          }
          break;
        }

        case 'missing_data > 20%': {
          const missingInsights = insights.filter(i => i.type === 'summary' && i.title.includes('Quality'));
          const qualityScore = missingInsights[0]?.value || score;
          if (qualityScore < (100 - (rule.threshold || 20))) {
            actions.push({
              id: `action-${actionId++}`,
              type: 'alert',
              target: 'Data Quality Warning',
              description: `Data quality score is ${qualityScore?.toFixed(0)}/100. Significant missing data detected. Recommend running data cleaning pipeline.`,
              status: agent.isAutoApprove ? 'executed' : 'proposed',
              severity: 'critical',
              timestamp: new Date().toISOString()
            });
          }
          break;
        }

        case 'duplicate_rows > 0': {
          const qualityInsight = insights.find(i => i.description.includes('duplicate'));
          if (qualityInsight && qualityInsight.description.includes('duplicate')) {
            const dupeMatch = qualityInsight.description.match(/(\d+) duplicate/);
            const dupeCount = dupeMatch ? parseInt(dupeMatch[1]) : 0;
            if (dupeCount > 0) {
              actions.push({
                id: `action-${actionId++}`,
                type: 'flag',
                target: `${dupeCount} duplicate rows`,
                description: `Found ${dupeCount} duplicate rows that should be reviewed and potentially removed.`,
                status: agent.isAutoApprove ? 'executed' : 'proposed',
                severity: 'warning',
                timestamp: new Date().toISOString()
              });
            }
          }
          break;
        }

        case 'data_quality_score < 60': {
          if (score < (rule.threshold || 60)) {
            actions.push({
              id: `action-${actionId++}`,
              type: 'alert',
              target: 'Low Quality Dataset',
              description: `Data quality score (${score?.toFixed(0)}) is below threshold (${rule.threshold || 60}). Dataset may produce unreliable analysis results.`,
              status: agent.isAutoApprove ? 'executed' : 'proposed',
              severity: 'critical',
              timestamp: new Date().toISOString()
            });
          }
          break;
        }

        case 'trend_change > 30%': {
          const trendInsights = insights.filter(i => (i.type === 'profit' || i.type === 'loss') && Math.abs(i.change || 0) > (rule.threshold || 30));
          for (const trend of trendInsights) {
            actions.push({
              id: `action-${actionId++}`,
              type: 'alert',
              target: `Significant trend: ${trend.column}`,
              description: trend.description,
              status: agent.isAutoApprove ? 'executed' : 'proposed',
              severity: Math.abs(trend.change || 0) > 50 ? 'critical' : 'warning',
              timestamp: new Date().toISOString()
            });
          }
          break;
        }

        case 'loss_detected': {
          const lossInsights = insights.filter(i => i.type === 'loss');
          for (const loss of lossInsights) {
            actions.push({
              id: `action-${actionId++}`,
              type: 'report',
              target: `Loss detected: ${loss.column}`,
              description: loss.description,
              status: agent.isAutoApprove ? 'executed' : 'proposed',
              severity: loss.severity === 'high' ? 'critical' : 'warning',
              timestamp: new Date().toISOString()
            });
          }
          break;
        }

        case 'auto_cleanable_issues > 3': {
          // This would trigger auto-cleaning
          actions.push({
            id: `action-${actionId++}`,
            type: 'optimize',
            target: 'Auto Data Cleaning',
            description: 'Multiple cleanable issues detected. Auto-cleaning pipeline can resolve missing values, duplicates, and formatting inconsistencies.',
            status: agent.isAutoApprove ? 'executed' : 'proposed',
            severity: 'info',
            timestamp: new Date().toISOString()
          });
          break;
        }
      }
    }

    // Log actions in audit log
    if (actions.length > 0) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id || null,
          action: `AI Agent "${agent.name}" executed`,
          module: 'AI Agents',
          resource: datasetId,
          details: JSON.stringify({ agentId, actionsProposed: actions.length, autoApproved: agent.isAutoApprove }),
        }
      });
    }

    // Create admin alerts for critical/warning actions
    for (const action of actions.filter(a => a.severity !== 'info')) {
      await prisma.adminAlert.create({
        data: {
          title: `[${agent.name}] ${action.target}`,
          description: action.description,
          severity: action.severity === 'critical' ? 'critical' : 'warning',
          datasetId,
          source: `ai-agent:${agent.id}`
        }
      });
    }

    return {
      success: true,
      data: {
        agentId: agent.id,
        agentName: agent.name,
        actions,
        insightCount: insights.length,
        qualityScore: score
      }
    };
  } catch (error: any) {
    console.error('Agent error:', error);
    return { success: false, error: error.message };
  }
}

export async function getAgentHistory(limit: number = 20) {
  const logs = await prisma.auditLog.findMany({
    where: { module: 'AI Agents' },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
  return logs;
}

export async function getAgentAlerts() {
  const alerts = await prisma.adminAlert.findMany({
    where: { source: { startsWith: 'ai-agent:' } },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return alerts;
}
