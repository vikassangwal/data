import { notFound } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import ScrollReveal from '@/components/ui/ScrollReveal';
import prisma from '@/lib/db';
import { Metadata } from 'next';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });
  if (!post) return { title: 'Post Not Found' };
  
  const excerpt = post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...';

  return {
    title: post.title,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: [post.authorId],
    }
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      categories: true
    }
  });
  
  if (!post || !post.published) {
    notFound();
  }

  const excerpt = post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...';
  const wordCount = post.content.split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
  const categoryName = post.categories?.[0]?.name || 'Uncategorized';
  const authorName = post.author?.name || 'Admin';
  const authorAvatar = post.author?.image || authorName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Container className="max-w-4xl">
        <ScrollReveal>
          <div className="mb-8">
            <Link href="/blog" className="text-primary hover:underline text-sm flex items-center gap-2 mb-6">
              ← Back to Blog
            </Link>
            <div className="flex gap-2 mb-4">
              <Badge variant="primary">{categoryName}</Badge>
              <Badge variant="default">{readTime}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 text-muted-foreground border-b border-white/10 pb-8 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                {authorAvatar}
              </div>
              <div>
                <p className="font-semibold text-white">{authorName}</p>
                <p className="text-sm">
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {post.imageUrl && (
          <ScrollReveal delay={0.1}>
            <div className="w-full h-[400px] relative rounded-2xl overflow-hidden mb-12">
              <Image 
                src={post.imageUrl} 
                alt={post.title} 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.2}>
          <GlassCard className="prose prose-invert prose-primary max-w-none">
            {/* Minimal Markdown rendering simulation. In production, use react-markdown */}
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
          </GlassCard>
        </ScrollReveal>
      </Container>
    </main>
  );
}
