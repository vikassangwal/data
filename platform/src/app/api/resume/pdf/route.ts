export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// jsPDF is a client-side library by default but can work on server with some setup.
// We'll generate the PDF on the server side using jsPDF.
// @ts-ignore - jsPDF ESM import
import { jsPDF } from 'jspdf';

/* ─── Color Palette ─── */
const COLORS = {
  primary: [45, 108, 223] as [number, number, number],     // #2D6CDF
  dark: [15, 23, 42] as [number, number, number],           // Slate 900
  text: [30, 41, 59] as [number, number, number],           // Slate 800
  muted: [100, 116, 139] as [number, number, number],       // Slate 500
  light: [241, 245, 249] as [number, number, number],       // Slate 100
  white: [255, 255, 255] as [number, number, number],
  accent: [124, 58, 237] as [number, number, number],       // Violet 600
  divider: [203, 213, 225] as [number, number, number],     // Slate 300
};

/* ─── Skills Data (matches client.tsx) ─── */
const SKILL_GROUPS = [
  { name: 'Languages', skills: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
  { name: 'Frontend', skills: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion'] },
  { name: 'Backend', skills: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'] },
  { name: 'AI/ML', skills: ['TensorFlow', 'LangChain', 'OpenAI', 'Scikit-learn'] },
  { name: 'Cloud', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'] },
  { name: 'Tools', skills: ['Power BI', 'Selenium', 'Git', 'Figma'] },
];

/* ─── Helper: wrap long text into array of lines ─── */
function wrapText(doc: any, text: string, maxWidth: number): string[] {
  if (!text) return [''];
  return doc.splitTextToSize(text, maxWidth) as string[];
}

/* ─── Helper: draw a section title bar ─── */
function drawSectionTitle(doc: any, title: string, y: number, pageW: number, margin: number): number {
  const barH = 8;
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, y, pageW - margin * 2, barH, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text(title.toUpperCase(), margin + 4, y + 5.6);
  return y + barH + 5;
}

/* ─── Helper: add page if needed ─── */
function checkPage(doc: any, y: number, needed: number, pageH: number, margin: number): number {
  if (y + needed > pageH - margin) {
    doc.addPage();
    return margin + 5;
  }
  return y;
}

/* ─── Helper: draw thin divider line ─── */
function drawDivider(doc: any, y: number, margin: number, pageW: number): number {
  doc.setDrawColor(...COLORS.divider);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  return y + 4;
}

export async function GET() {
  try {
    // ── Fetch all data from DB ──
    const [profileData, entries] = await Promise.all([
      prisma.resumeProfileSetting.findFirst(),
      prisma.resumeEntry.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    const profile = profileData || {
      name: 'Alex Kumar',
      initials: 'AK',
      title: 'Data Analyst · AI Engineer · Full-Stack Developer',
      bio: '7+ years transforming data into intelligence, building AI systems, and engineering premium digital platforms for global clients.',
      photoUrl: '',
      cvUrl: '',
    };

    const experience = entries.filter((e) => e.type === 'experience');
    const education = entries.filter((e) => e.type === 'education');
    const certifications = entries.filter((e) => e.type === 'certification');

    // ── Create PDF (A4) ──
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 0;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // HEADER BAND
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const headerH = 45;
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 0, pageW, headerH, 'F');

    // Accent strip at very top
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageW, 3, 'F');

    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...COLORS.white);
    doc.text(profile.name, margin, 17);

    // Title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(180, 200, 230);
    doc.text(profile.title, margin, 25);

    // Bio (wrapped)
    doc.setFontSize(8);
    doc.setTextColor(150, 165, 185);
    const bioLines = wrapText(doc, profile.bio, contentW);
    bioLines.slice(0, 2).forEach((line: string, i: number) => {
      doc.text(line, margin, 32 + i * 3.5);
    });

    // Generated date
    doc.setFontSize(7);
    doc.setTextColor(100, 120, 140);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Generated: ${dateStr}`, pageW - margin, 40, { align: 'right' });

    y = headerH + 8;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PROFESSIONAL EXPERIENCE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (experience.length > 0) {
      y = drawSectionTitle(doc, 'Professional Experience', y, pageW, margin);

      experience.forEach((exp, idx) => {
        y = checkPage(doc, y, 25, pageH, margin);

        // Role + Period
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text(exp.title, margin + 2, y);

        const period = `${exp.startDate} – ${exp.endDate || 'Present'}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.muted);
        doc.text(period, pageW - margin - 2, y, { align: 'right' });

        y += 4.5;

        // Organization + Location
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.primary);
        doc.text(exp.organization + (exp.location ? ` · ${exp.location}` : ''), margin + 2, y);
        y += 5;

        // Description
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.text);
        const descLines = wrapText(doc, exp.description, contentW - 4);
        descLines.forEach((line: string) => {
          y = checkPage(doc, y, 5, pageH, margin);
          doc.text(line, margin + 2, y);
          y += 3.5;
        });

        y += 2;

        if (idx < experience.length - 1) {
          y = drawDivider(doc, y, margin + 2, pageW - margin);
          y += 1;
        }
      });

      y += 4;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EDUCATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (education.length > 0) {
      y = checkPage(doc, y, 30, pageH, margin);
      y = drawSectionTitle(doc, 'Education', y, pageW, margin);

      education.forEach((edu, idx) => {
        y = checkPage(doc, y, 18, pageH, margin);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text(edu.title, margin + 2, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.muted);
        doc.text(edu.startDate || '', pageW - margin - 2, y, { align: 'right' });
        y += 4.5;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.primary);
        doc.text(edu.organization + (edu.location ? ` · ${edu.location}` : ''), margin + 2, y);
        y += 5;

        if (edu.description) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.text);
          const eduDescLines = wrapText(doc, edu.description, contentW - 4);
          eduDescLines.forEach((line: string) => {
            y = checkPage(doc, y, 5, pageH, margin);
            doc.text(line, margin + 2, y);
            y += 3.5;
          });
        }
        y += 3;

        if (idx < education.length - 1) {
          y = drawDivider(doc, y, margin + 2, pageW - margin);
          y += 1;
        }
      });

      y += 4;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CERTIFICATIONS & AWARDS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (certifications.length > 0) {
      y = checkPage(doc, y, 25, pageH, margin);
      y = drawSectionTitle(doc, 'Certifications & Awards', y, pageW, margin);

      certifications.forEach((cert, idx) => {
        y = checkPage(doc, y, 14, pageH, margin);

        // Bullet
        doc.setFillColor(...COLORS.accent);
        doc.circle(margin + 4, y - 1.2, 1.2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        doc.text(cert.title, margin + 8, y);

        const certYear = `${cert.startDate}${cert.endDate ? ' – ' + cert.endDate : ''}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.muted);
        doc.text(certYear, pageW - margin - 2, y, { align: 'right' });
        y += 4;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.primary);
        doc.text(cert.organization, margin + 8, y);
        y += 4;

        if (cert.description) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(...COLORS.text);
          const certDesc = wrapText(doc, cert.description, contentW - 10);
          certDesc.forEach((line: string) => {
            y = checkPage(doc, y, 4, pageH, margin);
            doc.text(line, margin + 8, y);
            y += 3.3;
          });
        }

        y += 2;
      });

      y += 3;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TECHNICAL SKILLS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    y = checkPage(doc, y, 50, pageH, margin);
    y = drawSectionTitle(doc, 'Technical Skills', y, pageW, margin);

    // Render in a 2-column grid
    const colW = (contentW - 6) / 2;
    const startY = y;
    let col = 0;
    let maxY = y;

    SKILL_GROUPS.forEach((group, gi) => {
      const colX = margin + 2 + col * (colW + 6);
      let localY = gi < 2 ? startY : (gi < 4 ? startY + 25 : startY + 50);

      // Recalc column
      if (gi % 2 === 0) col = 0; else col = 1;
      const x = margin + 2 + col * (colW + 6);

      // Row
      const row = Math.floor(gi / 2);
      localY = startY + row * 24;

      localY = checkPage(doc, localY, 20, pageH, margin);

      // Category label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.accent);
      doc.text(group.name, x, localY);
      localY += 4.5;

      // Skill tags
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.text);

      let tagX = x;
      group.skills.forEach((skill) => {
        const tw = doc.getTextWidth(skill) + 6;
        if (tagX + tw > x + colW) {
          tagX = x;
          localY += 6;
        }
        // Tag bg
        doc.setFillColor(...COLORS.light);
        doc.roundedRect(tagX, localY - 3.2, tw, 5, 1, 1, 'F');
        // Tag text
        doc.setTextColor(...COLORS.text);
        doc.text(skill, tagX + 3, localY);
        tagX += tw + 2;
      });

      if (localY + 6 > maxY) maxY = localY + 6;
    });

    y = maxY + 8;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FOOTER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Draw footer on each page
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      // Footer line
      doc.setDrawColor(...COLORS.divider);
      doc.setLineWidth(0.3);
      doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

      // Footer text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.muted);
      doc.text(`${profile.name} · Professional Resume`, margin, pageH - 8);
      doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
    }

    // ── Output PDF ──
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${profile.name.replace(/\s+/g, '_')}_Resume.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF resume:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
