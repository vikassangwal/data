'use server';

import prisma from '@/lib/db';

export async function createDataset(name: string, sizeBytes: number) {
  try {
    // We will create a default workspace if it doesn't exist just for demonstration
    // In a real app, the user would select or create a workspace first.
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: 'Default Lab Workspace' }
      });
    }

    const dataset = await prisma.dataset.create({
      data: {
        name,
        sizeBytes,
        filePath: 'local_virtual_path/' + name, // Mock path since we don't have file storage
        workspaceId: workspace.id,
      }
    });

    return { success: true, data: dataset };
  } catch (error: any) {
    console.error('Error creating dataset:', error);
    return { success: false, error: error.message };
  }
}

export async function saveChatMessage(sessionId: string | null, role: string, content: string) {
  try {
    let currentSessionId = sessionId;

    // If no session exists, create one
    if (!currentSessionId) {
      const session = await prisma.chatSession.create({
        data: {}
      });
      currentSessionId = session.id;
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId: currentSessionId,
        role,
        content
      }
    });

    return { success: true, data: message, sessionId: currentSessionId };
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    return { success: false, error: error.message };
  }
}
