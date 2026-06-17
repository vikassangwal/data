import { getBlogPosts } from '@/app/actions/blog';
import BlogClient from './client';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const { success, data: posts, error } = await getBlogPosts();

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500 pt-32">
        <h2 className="text-xl font-bold mb-2">Error loading blog posts</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Filter only published posts for the public page
  const publishedPosts = posts?.filter((p: any) => p.published) || [];

  // Extract categories dynamically from the actual posts, plus "All"
  const allCategories = publishedPosts.flatMap((p: any) => p.categories?.map((c: any) => c.name) || []);
  const categories = ['All', ...Array.from(new Set(allCategories))] as string[];

  // Map the DB structure to the expected UI structure
  const formattedPosts = publishedPosts.map((p: any) => {
    const authorName = p.author?.name || 'Admin';
    const excerpt = p.content?.replace(/<[^>]+>/g, '').substring(0, 150) + '...';
    const wordCount = p.content?.split(/\s+/).length || 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    return {
      ...p,
      category: p.categories?.[0]?.name || 'Uncategorized',
      excerpt,
      readTime,
      date: p.createdAt.toISOString(),
      author: {
        name: authorName,
        avatar: authorName.charAt(0).toUpperCase()
      }
    };
  });

  return <BlogClient initialPosts={formattedPosts} categories={categories} />;
}
