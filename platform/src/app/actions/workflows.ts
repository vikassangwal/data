'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  return session;
}

// Mock workflow database for the builder UI demonstration
// In a real app, this would use a Prisma schema like:
// model Workflow { id, name, status, trigger, nodes, createdAt }

export async function getWorkflows() {
  await requireAuth();
  
  // Return some mock enterprise workflows
  const workflows = [
    {
      id: 'wf-1',
      name: 'New Lead Onboarding',
      description: 'When a new lead is added in Salesforce, send a welcome email and slack notification.',
      status: 'active',
      trigger: 'Salesforce: New Lead',
      nodes: 4,
      lastRun: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      successRate: 99.2,
      runsToday: 145,
    },
    {
      id: 'wf-2',
      name: 'Monthly Invoice Generation',
      description: 'Generate PDF invoices from Stripe data on the 1st of every month.',
      status: 'active',
      trigger: 'Schedule: 1st of Month',
      nodes: 3,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      successRate: 100,
      runsToday: 0,
    },
    {
      id: 'wf-3',
      name: 'Support Ticket Sentiment Routing',
      description: 'Analyze Zendesk tickets with AI and route angry customers to senior agents.',
      status: 'paused',
      trigger: 'Zendesk: New Ticket',
      nodes: 5,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      successRate: 94.5,
      runsToday: 0,
    },
    {
      id: 'wf-4',
      name: 'Data Sync: Postgres to Snowflake',
      description: 'Nightly ETL pipeline to sync production database to data warehouse.',
      status: 'active',
      trigger: 'Schedule: Daily 2:00 AM',
      nodes: 2,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      successRate: 98.1,
      runsToday: 1,
    }
  ];

  return { success: true, workflows };
}

export async function toggleWorkflowStatus(workflowId: string, currentStatus: string) {
  await requireAuth();
  const newStatus = currentStatus === 'active' ? 'paused' : 'active';
  // In a real app, update DB
  return { success: true, message: `Workflow is now ${newStatus}`, newStatus };
}

export async function getWorkflowExecutionLogs(workflowId: string) {
  await requireAuth();
  
  const logs = Array.from({ length: 5 }, (_, i) => ({
    id: `log-${i}`,
    status: i === 2 ? 'failed' : 'success',
    duration: Math.floor(Math.random() * 2000) + 500, // ms
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60 * 2).toISOString(),
    error: i === 2 ? 'API Rate Limit Exceeded' : null,
  }));

  return { success: true, logs };
}

export async function saveWorkflow(name: string, nodesData: any) {
  await requireAuth();
  // Simulate saving the node graph structure
  return { success: true, message: 'Workflow saved successfully' };
}
