'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Authentication required.');
  return session;
}

// ─── 1. GET USER'S WORKSPACES ───
export async function getUserWorkspaces() {
  const session = await requireAuth();
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: session.user!.id! },
      include: {
        workspace: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
            datasets: { select: { id: true } },
            dashboards: { select: { id: true } },
          },
        },
      },
      orderBy: { workspace: { updatedAt: 'desc' } },
    });

    const workspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
      memberCount: m.workspace.members.length,
      datasetCount: m.workspace.datasets.length,
      dashboardCount: m.workspace.dashboards.length,
      members: m.workspace.members.map((mem) => ({
        id: mem.user.id,
        name: mem.user.name,
        email: mem.user.email,
        image: mem.user.image,
        role: mem.role,
      })),
      createdAt: m.workspace.createdAt.toISOString(),
      updatedAt: m.workspace.updatedAt.toISOString(),
    }));

    return { success: true, workspaces };
  } catch {
    return { success: false, error: 'Failed to fetch workspaces.' };
  }
}

// ─── 2. CREATE WORKSPACE ───
export async function createWorkspace(name: string) {
  const session = await requireAuth();
  if (!name || name.trim().length < 2) return { success: false, error: 'Workspace name must be at least 2 characters.' };

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        members: {
          create: {
            userId: session.user!.id!,
            role: 'owner',
          },
        },
      },
    });

    return { success: true, message: `Workspace "${workspace.name}" created!`, workspace };
  } catch {
    return { success: false, error: 'Failed to create workspace.' };
  }
}

// ─── 3. INVITE MEMBER ───
export async function inviteMember(workspaceId: string, email: string, role: string = 'viewer') {
  const session = await requireAuth();
  try {
    // Verify caller is owner/editor
    const callerMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user!.id! } },
    });
    if (!callerMembership || callerMembership.role === 'viewer') {
      return { success: false, error: 'Only owners and editors can invite members.' };
    }

    // Find the user by email
    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) return { success: false, error: 'No user found with that email address.' };

    // Check if already a member
    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: invitee.id } },
    });
    if (existing) return { success: false, error: 'This user is already a member of this workspace.' };

    await prisma.workspaceMember.create({
      data: { workspaceId, userId: invitee.id, role },
    });

    return { success: true, message: `${invitee.name || invitee.email} invited as ${role}.` };
  } catch {
    return { success: false, error: 'Failed to invite member.' };
  }
}

// ─── 4. REMOVE MEMBER ───
export async function removeMember(workspaceId: string, targetUserId: string) {
  const session = await requireAuth();
  try {
    const callerMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user!.id! } },
    });
    if (!callerMembership || callerMembership.role !== 'owner') {
      return { success: false, error: 'Only workspace owners can remove members.' };
    }
    if (targetUserId === session.user!.id) {
      return { success: false, error: 'You cannot remove yourself from the workspace.' };
    }

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    });

    return { success: true, message: 'Member removed.' };
  } catch {
    return { success: false, error: 'Failed to remove member.' };
  }
}

// ─── 5. UPDATE MEMBER ROLE ───
export async function updateMemberRole(workspaceId: string, targetUserId: string, newRole: string) {
  const session = await requireAuth();
  try {
    const callerMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user!.id! } },
    });
    if (!callerMembership || callerMembership.role !== 'owner') {
      return { success: false, error: 'Only owners can change member roles.' };
    }

    await prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      data: { role: newRole },
    });

    return { success: true, message: `Role updated to ${newRole}.` };
  } catch {
    return { success: false, error: 'Failed to update role.' };
  }
}

// ─── 6. DELETE WORKSPACE ───
export async function deleteWorkspace(workspaceId: string) {
  const session = await requireAuth();
  try {
    const callerMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user!.id! } },
    });
    if (!callerMembership || callerMembership.role !== 'owner') {
      return { success: false, error: 'Only workspace owners can delete workspaces.' };
    }

    await prisma.workspace.delete({ where: { id: workspaceId } });
    return { success: true, message: 'Workspace deleted.' };
  } catch {
    return { success: false, error: 'Failed to delete workspace.' };
  }
}

// ─── 7. RENAME WORKSPACE ───
export async function renameWorkspace(workspaceId: string, newName: string) {
  const session = await requireAuth();
  if (!newName || newName.trim().length < 2) return { success: false, error: 'Name must be at least 2 characters.' };

  try {
    const callerMembership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user!.id! } },
    });
    if (!callerMembership || callerMembership.role === 'viewer') {
      return { success: false, error: 'Only owners and editors can rename workspaces.' };
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: newName.trim() },
    });

    return { success: true, message: 'Workspace renamed.' };
  } catch {
    return { success: false, error: 'Failed to rename workspace.' };
  }
}

// ─── 8. GET TEAM ACTIVITY (for a workspace) ───
export async function getTeamActivity(workspaceId: string) {
  const session = await requireAuth();
  try {
    // Verify membership
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user!.id! } },
    });
    if (!membership) return { success: false, error: 'Not a member of this workspace.' };

    // Get member IDs
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true },
    });
    const memberIds = members.map((m) => m.userId);

    // Fetch recent activities from team members
    const activities = await prisma.userActivityLog.findMany({
      where: { userId: { in: memberIds } },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: { user: { select: { name: true, image: true } } },
    });

    return {
      success: true,
      activities: activities.map((a) => ({
        id: a.id,
        user: a.user?.name || 'Team Member',
        userImage: a.user?.image,
        action: a.action,
        module: a.module,
        resource: a.resource,
        timestamp: a.timestamp.toISOString(),
      })),
    };
  } catch {
    return { success: false, error: 'Failed to fetch team activity.' };
  }
}
