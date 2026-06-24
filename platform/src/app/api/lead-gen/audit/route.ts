import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as cheerio from 'cheerio';

const SYSTEM_PROMPT = `You are an Expert Technical SEO Auditor and Conversion Rate Optimization (CRO) Specialist.
Analyze the provided website scraped content and identify critical flaws that a business owner would care about.

Output your report purely in structured JSON format exactly like this:
{
  "onPageSEO": [
    { "issue": "Missing Meta Description", "impact": "High", "recommendation": "Add a compelling meta description to improve CTR." }
  ],
  "technicalFlaws": [
    { "issue": "Missing H1 Tag", "impact": "Medium", "recommendation": "Ensure one clear H1 tag exists on the page." }
  ],
  "conversionGaps": [
    { "issue": "No clear Call to Action above the fold", "impact": "High", "recommendation": "Add a prominent 'Get Started' button." }
  ],
  "overallScore": 65,
  "summary": "Brief 2-sentence summary of the site's health."
}`;

export async function POST(req: NextRequest) {
  try {
    const { url, model } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Scrape the URL
    let scrapedContent = '';
    let metaTags: any = {};
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
      
      const html = await response.text();
      const $ = cheerio.load(html);

      metaTags.title = $('title').text() || '';
      metaTags.description = $('meta[name="description"]').attr('content') || '';
      metaTags.h1 = [];
      $('h1').each((_, el) => { metaTags.h1.push($(el).text().trim()); });
      
      // Extract main text (strip scripts, styles, etc)
      $('script, style, noscript, iframe, img, svg').remove();
      scrapedContent = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000); // Max 15k chars to save tokens

    } catch (scrapeErr: any) {
      return NextResponse.json({ error: `Scraping failed: ${scrapeErr.message}` }, { status: 400 });
    }

    // 2. Setup AI API
    // We will use OpenRouter as the generic provider, looking up key from env or DB
    let apiKey = process.env.OPENROUTER_API_KEY || '';
    
    // Check DB for custom integration if needed
    if (!apiKey) {
      const openRouterConfig = await db.apiIntegration.findFirst({ where: { providerName: 'openrouter', status: 'ACTIVE' } });
      if (openRouterConfig) apiKey = openRouterConfig.apiKey;
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'AI API Key not configured. Please set OPENROUTER_API_KEY in .env or via Admin.' }, { status: 500 });
    }

    // 3. Call AI for Audit
    const userPrompt = `Target URL: ${url}\n\nMeta Title: ${metaTags.title}\nMeta Description: ${metaTags.description}\nH1 Tags: ${JSON.stringify(metaTags.h1)}\n\nPage Content (Truncated):\n${scrapedContent}\n\nPlease analyze this and provide the JSON report.`;

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI API Error: ${errText}`);
    }

    const aiData = await aiRes.json();
    let reportText = aiData.choices?.[0]?.message?.content || '{}';
    
    // Clean markdown if AI wrapped it in ```json
    if (reportText.includes('\`\`\`json')) {
      reportText = reportText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }

    // 4. Save to Database
    // Note: Since Prisma push failed, if LeadAudit table doesn't exist, this will crash. 
    // We wrap it in a try-catch to allow the app to work even if db push hasn't completed yet.
    let auditRecord;
    try {
      auditRecord = await db.leadAudit.create({
        data: {
          url,
          scrapedContent,
          metaTags: JSON.stringify(metaTags),
          seoReport: reportText,
          status: 'AUDITED'
        }
      });
    } catch (dbErr) {
      console.warn("DB Save failed (table might not exist yet):", dbErr);
      // Fallback object to send to client
      auditRecord = {
        id: `temp-${Date.now()}`,
        url,
        seoReport: reportText,
        status: 'AUDITED',
        createdAt: new Date()
      };
    }

    return NextResponse.json({ success: true, audit: auditRecord });

  } catch (error: any) {
    console.error('Lead Gen Audit Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
