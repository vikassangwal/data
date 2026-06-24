import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SYSTEM_PROMPT = `You are an Expert B2B Sales Copywriter and AI Outreach Specialist.
Your job is to read an SEO Audit Report of a target website and draft a highly personalized, professional cold email.

Rules for the Email:
1. Subject line must be catchy, non-spammy, and mention their website.
2. In the body, politely point out 1-2 specific critical flaws from the report to prove authenticity.
3. Naturally pitch our "Web Development & SEO Services" to fix these issues.
4. Keep it concise, professional, and focused on value/revenue.
5. Do not use generic greetings like 'Dear Sir/Madam'. Use placeholders like [Name] if unknown.

Output your result strictly in JSON format:
{
  "subject": "Quick question about example.com",
  "body": "Hi [Name],\\n\\nI was browsing your site..."
}`;

export async function POST(req: NextRequest) {
  try {
    const { auditId, model, report } = await req.json();

    if (!report && !auditId) {
      return NextResponse.json({ error: 'Audit Report or Audit ID is required' }, { status: 400 });
    }

    let reportData = report;

    // If report isn't passed directly, try fetching from DB
    if (!reportData) {
      try {
        const audit = await db.leadAudit.findUnique({ where: { id: auditId } });
        if (!audit) throw new Error('Audit not found');
        reportData = audit.seoReport;
      } catch (err) {
        return NextResponse.json({ error: 'Failed to retrieve audit from DB. Please pass report directly.' }, { status: 400 });
      }
    }

    // 1. Setup AI API
    let apiKey = process.env.OPENROUTER_API_KEY || '';
    
    if (!apiKey) {
      try {
        const openRouterConfig = await db.apiIntegration.findFirst({ where: { providerName: 'openrouter', status: 'ACTIVE' } });
        if (openRouterConfig) apiKey = openRouterConfig.apiKey;
      } catch (e) {
         // Ignore DB errors if pushing failed
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'AI API Key not configured.' }, { status: 500 });
    }

    // 2. Call AI for Email Draft
    const userPrompt = `Here is the SEO Audit Report for the target website:\n\n${typeof reportData === 'string' ? reportData : JSON.stringify(reportData)}\n\nPlease draft the outreach email based on this data.`;

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
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
    let emailText = aiData.choices?.[0]?.message?.content || '{}';
    
    // Clean markdown
    if (emailText.includes('\`\`\`json')) {
      emailText = emailText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    }

    let parsedEmail;
    try {
      parsedEmail = JSON.parse(emailText);
    } catch(e) {
      // Fallback
      parsedEmail = {
        subject: "Ideas for your website",
        body: emailText
      }
    }

    // 3. Save to Database (OutreachEmail) if possible
    try {
      if (!auditId.startsWith('temp-')) {
        await db.outreachEmail.create({
          data: {
            auditId,
            subject: parsedEmail.subject || 'No Subject',
            body: parsedEmail.body || 'No Body',
            status: 'DRAFT'
          }
        });
      }
    } catch (dbErr) {
      console.warn("Could not save email to DB:", dbErr);
    }

    return NextResponse.json({ success: true, email: parsedEmail });

  } catch (error: any) {
    console.error('Lead Gen Email Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
