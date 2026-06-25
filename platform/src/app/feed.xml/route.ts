import { NextResponse } from 'next';
import prisma from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.example.com';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const feedItems = posts.map((post) => {
      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${BASE_URL}/blog/${post.slug}</link>
          <guid>${BASE_URL}/blog/${post.slug}</guid>
          <pubDate>${post.createdAt.toUTCString()}</pubDate>
          <description><![CDATA[${post.seoDesc || 'Read our latest blog post.'}]]></description>
        </item>
      `;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>Blog Feed</title>
          <link>${BASE_URL}/blog</link>
          <description>Latest insights and articles.</description>
          <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
          ${feedItems}
        </channel>
      </rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}
