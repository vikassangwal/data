'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        categories: true,
      }
    });
    return { success: true, data: posts };
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return { success: false, error: error.message };
  }
}

export async function createBlogPost(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const imageUrl = formData.get('imageUrl') as string || '';
    
    // Auto-generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Get or create default author
    let author = await prisma.user.findFirst();
    if (!author) {
      author = await prisma.user.create({
        data: {
          name: 'Admin',
          email: 'admin@devforge.com',
          role: 'ADMIN'
        }
      });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        content,
        imageUrl,
        slug,
        published: false,
        authorId: author.id
      }
    });

    revalidatePath('/admin/content');
    revalidatePath('/blog');
    return { success: true, data: post };
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await prisma.blogPost.delete({
      where: { id }
    });
    revalidatePath('/admin/content');
    revalidatePath('/blog');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return { success: false, error: error.message };
  }
}

export async function toggleBlogPostStatus(id: string, published: boolean) {
  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: { published }
    });
    revalidatePath('/admin/content');
    revalidatePath('/blog');
    return { success: true, data: post };
  } catch (error: any) {
    console.error('Error toggling blog status:', error);
    return { success: false, error: error.message };
  }
}
