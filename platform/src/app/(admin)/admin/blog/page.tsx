import { getBlogPosts } from '@/app/actions/blog';
import BlogClient from './client';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const { success, data: posts, error } = await getBlogPosts();

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error loading blog posts</h2>
        <p>{error}</p>
      </div>
    );
  }

  return <BlogClient initialPosts={posts || []} />;
}
