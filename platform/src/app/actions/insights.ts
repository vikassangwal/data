'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';

/* ─── Types ─── */
export interface InsightCard {
  id: string;
  type: 'profit' | 'loss' | 'trend' | 'anomaly' | 'correlation' | 'summary';
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  metric?: string;
  value?: number;
  change?: number; // percentage change
  column?: string;
}

/* ─── Helpers ─── */
function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const vals: string[] = [];
    let current = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { vals.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    vals.push(current.trim());
    return vals;
  });
  return { headers, rows };
}

function isNumeric(val: string): boolean {
  return val !== '' && !isNaN(Number(val));
}

function getNumericColumns(headers: string[], rows: string[][]): { name: string; values: number[] }[] {
  const result: { name: string; values: number[] }[] = [];
  headers.forEach((h, idx) => {
    const nums = rows.map(r => r[idx]).filter(v => isNumeric(v)).map(Number);
    if (nums.length > rows.length * 0.5) { // at least 50% numeric
      result.push({ name: h, values: nums });
    }
  });
  return result;
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const frac = idx - lower;
  return sorted[lower] + frac * ((sorted[lower + 1] || sorted[lower]) - sorted[lower]);
}

function correlationCoeff(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = x[i] - mx;
    const b = y[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

/* ─── Main Action ─── */
export async function generateInsights(datasetId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Authentication required' };

  try {
    const dataset = await prisma.adminDataset.findUnique({
      where: { id: datasetId },
      include: { files: true }
    });

    if (!dataset) return { success: false, error: 'Dataset not found' };
    if (!dataset.files?.length) return { success: false, error: 'No files in dataset' };

    const file = dataset.files[0];
    let filePath = file.filePath;
    if (!path.isAbsolute(filePath)) filePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(filePath)) return { success: false, error: 'Dataset file not found on disk' };

    const content = fs.readFileSync(filePath, 'utf-8');
    const { headers, rows } = parseCSV(content);
    if (rows.length === 0) return { success: false, error: 'Dataset is empty' };

    const numCols = getNumericColumns(headers, rows);
    const insights: InsightCard[] = [];
    let idCounter = 0;

    // ── Dataset Summary ──
    insights.push({
      id: `insight-${idCounter++}`,
      type: 'summary',
      severity: 'info',
      title: 'Dataset Overview',
      description: `${rows.length.toLocaleString()} rows × ${headers.length} columns. ${numCols.length} numeric columns detected for analysis.`,
      metric: 'rows',
      value: rows.length
    });

    // ── Per-Column Analysis ──
    for (const col of numCols) {
      const m = mean(col.values);
      const med = median(col.values);
      const sd = stddev(col.values);
      const minV = Math.min(...col.values);
      const maxV = Math.max(...col.values);

      // Trend detection (first half vs second half)
      const half = Math.floor(col.values.length / 2);
      if (half > 2) {
        const firstHalf = mean(col.values.slice(0, half));
        const secondHalf = mean(col.values.slice(half));
        const changePercent = ((secondHalf - firstHalf) / Math.abs(firstHalf || 1)) * 100;

        if (Math.abs(changePercent) > 10) {
          insights.push({
            id: `insight-${idCounter++}`,
            type: changePercent > 0 ? 'profit' : 'loss',
            severity: Math.abs(changePercent) > 30 ? 'high' : 'medium',
            title: `${col.name}: ${changePercent > 0 ? '📈 Upward' : '📉 Downward'} Trend`,
            description: `"${col.name}" shows a ${Math.abs(changePercent).toFixed(1)}% ${changePercent > 0 ? 'increase' : 'decrease'} in the second half of data compared to the first half. Average moved from ${firstHalf.toFixed(2)} to ${secondHalf.toFixed(2)}.`,
            column: col.name,
            change: changePercent,
            value: secondHalf
          });
        }
      }

      // Outlier detection (IQR method)
      const q1 = percentile(col.values, 25);
      const q3 = percentile(col.values, 75);
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      const outliers = col.values.filter(v => v < lowerBound || v > upperBound);

      if (outliers.length > 0 && outliers.length < col.values.length * 0.1) {
        insights.push({
          id: `insight-${idCounter++}`,
          type: 'anomaly',
          severity: outliers.length > 5 ? 'high' : 'medium',
          title: `⚠️ ${outliers.length} Outlier${outliers.length > 1 ? 's' : ''} in "${col.name}"`,
          description: `Found ${outliers.length} values outside the normal range [${lowerBound.toFixed(1)}, ${upperBound.toFixed(1)}]. Range: ${minV.toFixed(2)} to ${maxV.toFixed(2)}, Mean: ${m.toFixed(2)}, Std Dev: ${sd.toFixed(2)}.`,
          column: col.name,
          value: outliers.length
        });
      }

      // High variance detection
      const cv = (sd / Math.abs(m || 1)) * 100;
      if (cv > 80) {
        insights.push({
          id: `insight-${idCounter++}`,
          type: 'anomaly',
          severity: 'medium',
          title: `🔀 High Variability in "${col.name}"`,
          description: `Coefficient of variation is ${cv.toFixed(1)}%. Data is highly spread out (mean: ${m.toFixed(2)}, std dev: ${sd.toFixed(2)}). Consider segmenting or investigating root causes.`,
          column: col.name,
          value: cv
        });
      }

      // Top performer detection (positive values, ranked)
      if (m > 0 && col.values.length >= 5) {
        const topVal = maxV;
        const topRatio = topVal / m;
        if (topRatio > 3) {
          insights.push({
            id: `insight-${idCounter++}`,
            type: 'profit',
            severity: 'low',
            title: `🏆 Peak Value in "${col.name}"`,
            description: `Maximum value (${topVal.toFixed(2)}) is ${topRatio.toFixed(1)}x the average. This could indicate a high-performing segment worth investigating.`,
            column: col.name,
            value: topVal
          });
        }
      }
    }

    // ── Cross-column Correlations ──
    for (let i = 0; i < numCols.length && i < 8; i++) {
      for (let j = i + 1; j < numCols.length && j < 8; j++) {
        const r = correlationCoeff(numCols[i].values, numCols[j].values);
        if (Math.abs(r) > 0.7) {
          insights.push({
            id: `insight-${idCounter++}`,
            type: 'correlation',
            severity: Math.abs(r) > 0.9 ? 'high' : 'medium',
            title: `🔗 Strong ${r > 0 ? 'Positive' : 'Negative'} Correlation`,
            description: `"${numCols[i].name}" and "${numCols[j].name}" are ${r > 0 ? 'positively' : 'negatively'} correlated (r = ${r.toFixed(3)}). Changes in one strongly ${r > 0 ? 'mirror' : 'oppose'} changes in the other.`,
            value: r
          });
        }
      }
    }

    // ── Data Quality Score ──
    const nullCount = rows.reduce((sum, row) => sum + row.filter(v => v === '' || v === 'null' || v === 'NULL' || v === 'NaN').length, 0);
    const totalCells = rows.length * headers.length;
    const completeness = ((totalCells - nullCount) / totalCells) * 100;

    // Check for duplicate rows
    const rowStrings = rows.map(r => r.join('|'));
    const uniqueRows = new Set(rowStrings).size;
    const dupeCount = rows.length - uniqueRows;

    const qualityScore = Math.max(0, Math.min(100,
      completeness * 0.5 +
      (1 - dupeCount / rows.length) * 100 * 0.3 +
      (numCols.length > 0 ? 20 : 0)
    ));

    insights.push({
      id: `insight-${idCounter++}`,
      type: 'summary',
      severity: qualityScore > 80 ? 'low' : qualityScore > 50 ? 'medium' : 'high',
      title: `📊 Data Quality Score: ${qualityScore.toFixed(0)}/100`,
      description: `Completeness: ${completeness.toFixed(1)}% (${nullCount} missing values). Uniqueness: ${uniqueRows.toLocaleString()} unique rows (${dupeCount} duplicates).`,
      value: qualityScore
    });

    // ── Save to DB ──
    const report = await prisma.insightReport.create({
      data: {
        datasetId,
        insights: JSON.stringify(insights),
        summary: `Generated ${insights.length} insights from "${dataset.name}" (${rows.length} rows, ${headers.length} columns).`,
        score: qualityScore,
        status: 'ready'
      }
    });

    return { success: true, data: { insights, reportId: report.id, score: qualityScore } };
  } catch (error: any) {
    console.error('Insight generation error:', error);
    return { success: false, error: error.message };
  }
}

export async function getInsightReports(datasetId: string) {
  const reports = await prisma.insightReport.findMany({
    where: { datasetId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  return reports.map(r => ({
    ...r,
    insights: JSON.parse(r.insights || '[]')
  }));
}
