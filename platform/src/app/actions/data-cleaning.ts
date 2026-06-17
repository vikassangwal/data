'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';

/* ─── CSV Parser ─── */
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

/* ─── Issue Types ─── */
export interface CleaningIssue {
  id: string;
  type: 'missing' | 'duplicate' | 'outlier' | 'type_mismatch' | 'inconsistent' | 'whitespace';
  severity: 'high' | 'medium' | 'low';
  column?: string;
  rowIndices?: number[];
  count: number;
  description: string;
  suggestedFix: string;
  autoFixable: boolean;
}

/* ─── Scanning Logic ─── */
function scanForIssues(headers: string[], rows: string[][]): CleaningIssue[] {
  const issues: CleaningIssue[] = [];
  let idCounter = 0;

  // 1. Missing values per column
  headers.forEach((h, colIdx) => {
    const missingRows: number[] = [];
    rows.forEach((row, rowIdx) => {
      const val = row[colIdx]?.trim() || '';
      if (val === '' || val.toLowerCase() === 'null' || val.toLowerCase() === 'nan' || val === 'undefined' || val === 'N/A' || val === 'n/a' || val === '-') {
        missingRows.push(rowIdx);
      }
    });

    if (missingRows.length > 0) {
      const pct = ((missingRows.length / rows.length) * 100).toFixed(1);
      const numericVals = rows.map(r => r[colIdx]).filter(v => v !== '' && !isNaN(Number(v))).map(Number);
      const isNumeric = numericVals.length > rows.length * 0.3;

      issues.push({
        id: `issue-${idCounter++}`,
        type: 'missing',
        severity: missingRows.length > rows.length * 0.3 ? 'high' : missingRows.length > rows.length * 0.1 ? 'medium' : 'low',
        column: h,
        rowIndices: missingRows.slice(0, 50),
        count: missingRows.length,
        description: `${missingRows.length} missing values (${pct}%) in column "${h}"`,
        suggestedFix: isNumeric
          ? `Fill with median (${numericVals.length > 0 ? median(numericVals).toFixed(2) : '0'})`
          : `Fill with mode or "Unknown"`,
        autoFixable: true
      });
    }
  });

  // 2. Duplicate rows
  const rowStrings = rows.map(r => r.join('|'));
  const seen = new Map<string, number[]>();
  rowStrings.forEach((rs, idx) => {
    if (!seen.has(rs)) seen.set(rs, []);
    seen.get(rs)!.push(idx);
  });
  const duplicateGroups = [...seen.entries()].filter(([_, indices]) => indices.length > 1);
  const totalDupes = duplicateGroups.reduce((s, [_, indices]) => s + indices.length - 1, 0);

  if (totalDupes > 0) {
    issues.push({
      id: `issue-${idCounter++}`,
      type: 'duplicate',
      severity: totalDupes > rows.length * 0.1 ? 'high' : 'medium',
      rowIndices: duplicateGroups.flatMap(([_, indices]) => indices.slice(1)).slice(0, 100),
      count: totalDupes,
      description: `${totalDupes} duplicate rows found (${duplicateGroups.length} groups)`,
      suggestedFix: 'Remove duplicate rows, keeping first occurrence',
      autoFixable: true
    });
  }

  // 3. Outliers (IQR method) for numeric columns
  headers.forEach((h, colIdx) => {
    const numericVals = rows.map((row, i) => ({ val: Number(row[colIdx]), idx: i, raw: row[colIdx] }))
      .filter(v => !isNaN(v.val) && v.raw !== '');
    
    // Need enough data
    if (numericVals.length < 10) return;
    
    const sorted = [...numericVals].sort((a, b) => a.val - b.val);
    const q1Idx = Math.floor(sorted.length * 0.25);
    const q3Idx = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Idx].val;
    const q3 = sorted[q3Idx].val;
    const iqr = q3 - q1;
    
    if (iqr === 0) return;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outlierRows = numericVals.filter(v => v.val < lowerBound || v.val > upperBound);

    if (outlierRows.length > 0 && outlierRows.length < numericVals.length * 0.15) {
      issues.push({
        id: `issue-${idCounter++}`,
        type: 'outlier',
        severity: outlierRows.length > 10 ? 'high' : 'medium',
        column: h,
        rowIndices: outlierRows.map(o => o.idx).slice(0, 50),
        count: outlierRows.length,
        description: `${outlierRows.length} outliers in "${h}" (outside [${lowerBound.toFixed(1)}, ${upperBound.toFixed(1)}])`,
        suggestedFix: 'Cap outliers at IQR bounds (winsorization)',
        autoFixable: true
      });
    }
  });

  // 4. Data type inconsistencies
  headers.forEach((h, colIdx) => {
    const values = rows.map(r => r[colIdx]?.trim() || '').filter(v => v !== '');
    if (values.length === 0) return;

    const numericCount = values.filter(v => !isNaN(Number(v))).length;
    const datePatterns = values.filter(v => /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(v) || /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(v)).length;

    // Mixed types: some numeric, some not
    if (numericCount > values.length * 0.3 && numericCount < values.length * 0.9) {
      const nonNumeric = values.length - numericCount;
      issues.push({
        id: `issue-${idCounter++}`,
        type: 'type_mismatch',
        severity: 'medium',
        column: h,
        count: nonNumeric,
        description: `Mixed types in "${h}": ${numericCount} numeric, ${nonNumeric} text values`,
        suggestedFix: 'Convert non-numeric values to NaN or parse manually',
        autoFixable: false
      });
    }

    // Inconsistent date formats
    if (datePatterns > values.length * 0.5) {
      const formats = new Set(values.map(v => {
        if (/^\d{4}-\d{2}-\d{2}/.test(v)) return 'YYYY-MM-DD';
        if (/^\d{2}\/\d{2}\/\d{4}/.test(v)) return 'MM/DD/YYYY';
        if (/^\d{2}-\d{2}-\d{4}/.test(v)) return 'DD-MM-YYYY';
        return 'other';
      }));
      if (formats.size > 1) {
        issues.push({
          id: `issue-${idCounter++}`,
          type: 'inconsistent',
          severity: 'medium',
          column: h,
          count: values.length,
          description: `Inconsistent date formats in "${h}": ${[...formats].join(', ')}`,
          suggestedFix: 'Standardize to YYYY-MM-DD format',
          autoFixable: true
        });
      }
    }
  });

  // 5. Leading/trailing whitespace
  let whitespaceCount = 0;
  rows.forEach(row => {
    row.forEach(val => {
      if (val !== val.trim()) whitespaceCount++;
    });
  });
  if (whitespaceCount > 0) {
    issues.push({
      id: `issue-${idCounter++}`,
      type: 'whitespace',
      severity: 'low',
      count: whitespaceCount,
      description: `${whitespaceCount} cells have leading/trailing whitespace`,
      suggestedFix: 'Trim all text values',
      autoFixable: true
    });
  }

  return issues;
}

// Helper function used in scanning
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}



/* ─── Apply Fixes ─── */
function applyFixes(headers: string[], rows: string[][], issues: CleaningIssue[]): {
  cleanedRows: string[][];
  appliedFixes: { issueId: string; action: string; affected: number }[];
} {
  let cleanedRows = rows.map(r => [...r]); // deep copy
  const appliedFixes: { issueId: string; action: string; affected: number }[] = [];

  for (const issue of issues) {
    if (!issue.autoFixable) continue;

    switch (issue.type) {
      case 'missing': {
        if (!issue.column) break;
        const colIdx = headers.indexOf(issue.column);
        if (colIdx === -1) break;

        // Check if numeric
        const numVals = cleanedRows.map(r => r[colIdx]).filter(v => v !== '' && !isNaN(Number(v))).map(Number);
        const isNumeric = numVals.length > cleanedRows.length * 0.3;

        if (isNumeric && numVals.length > 0) {
          const med = median(numVals);
          let fixed = 0;
          cleanedRows.forEach(row => {
            const val = row[colIdx]?.trim() || '';
            if (val === '' || val.toLowerCase() === 'null' || val.toLowerCase() === 'nan' || val === 'undefined' || val === 'N/A' || val === 'n/a' || val === '-') {
              row[colIdx] = med.toString();
              fixed++;
            }
          });
          appliedFixes.push({ issueId: issue.id, action: `Filled ${fixed} missing values with median (${med.toFixed(2)})`, affected: fixed });
        } else {
          // Mode for text
          const valueCounts: Record<string, number> = {};
          cleanedRows.forEach(row => {
            const val = row[colIdx]?.trim();
            if (val && val !== '' && val.toLowerCase() !== 'null') {
              valueCounts[val] = (valueCounts[val] || 0) + 1;
            }
          });
          const mode = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
          let fixed = 0;
          cleanedRows.forEach(row => {
            const val = row[colIdx]?.trim() || '';
            if (val === '' || val.toLowerCase() === 'null' || val.toLowerCase() === 'nan') {
              row[colIdx] = mode;
              fixed++;
            }
          });
          appliedFixes.push({ issueId: issue.id, action: `Filled ${fixed} missing values with mode ("${mode}")`, affected: fixed });
        }
        break;
      }

      case 'duplicate': {
        const rowStrings = cleanedRows.map(r => r.join('|'));
        const seen = new Set<string>();
        const keepIndices: number[] = [];
        rowStrings.forEach((rs, idx) => {
          if (!seen.has(rs)) {
            seen.add(rs);
            keepIndices.push(idx);
          }
        });
        const removed = cleanedRows.length - keepIndices.length;
        cleanedRows = keepIndices.map(i => cleanedRows[i]);
        appliedFixes.push({ issueId: issue.id, action: `Removed ${removed} duplicate rows`, affected: removed });
        break;
      }

      case 'outlier': {
        if (!issue.column) break;
        const colIdx = headers.indexOf(issue.column);
        if (colIdx === -1) break;

        const numVals = cleanedRows.map(r => Number(r[colIdx])).filter(v => !isNaN(v));
        const sorted = [...numVals].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lower = q1 - 1.5 * iqr;
        const upper = q3 + 1.5 * iqr;

        let capped = 0;
        cleanedRows.forEach(row => {
          const val = Number(row[colIdx]);
          if (!isNaN(val)) {
            if (val < lower) { row[colIdx] = lower.toString(); capped++; }
            else if (val > upper) { row[colIdx] = upper.toString(); capped++; }
          }
        });
        appliedFixes.push({ issueId: issue.id, action: `Capped ${capped} outliers to [${lower.toFixed(1)}, ${upper.toFixed(1)}]`, affected: capped });
        break;
      }

      case 'whitespace': {
        let trimmed = 0;
        cleanedRows.forEach(row => {
          row.forEach((val, i) => {
            if (val !== val.trim()) { row[i] = val.trim(); trimmed++; }
          });
        });
        appliedFixes.push({ issueId: issue.id, action: `Trimmed whitespace from ${trimmed} cells`, affected: trimmed });
        break;
      }

      case 'inconsistent': {
        // Standardize dates to YYYY-MM-DD
        if (!issue.column) break;
        const colIdx = headers.indexOf(issue.column);
        if (colIdx === -1) break;

        let fixed = 0;
        cleanedRows.forEach(row => {
          const val = row[colIdx];
          // Try MM/DD/YYYY
          const m1 = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (m1) { row[colIdx] = `${m1[3]}-${m1[1]}-${m1[2]}`; fixed++; return; }
          // Try DD-MM-YYYY
          const m2 = val.match(/^(\d{2})-(\d{2})-(\d{4})$/);
          if (m2) { row[colIdx] = `${m2[3]}-${m2[2]}-${m2[1]}`; fixed++; return; }
        });
        appliedFixes.push({ issueId: issue.id, action: `Standardized ${fixed} dates to YYYY-MM-DD`, affected: fixed });
        break;
      }
    }
  }

  return { cleanedRows, appliedFixes };
}

/* ─── Main Actions ─── */
export async function scanDataset(datasetId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Authentication required' };

  try {
    const dataset = await prisma.adminDataset.findUnique({
      where: { id: datasetId },
      include: { files: true }
    });

    if (!dataset?.files?.length) return { success: false, error: 'Dataset not found' };

    const file = dataset.files[0];
    let filePath = file.filePath;
    if (!path.isAbsolute(filePath)) filePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(filePath)) return { success: false, error: 'File not found' };

    const content = fs.readFileSync(filePath, 'utf-8');
    const { headers, rows } = parseCSV(content);

    const issues = scanForIssues(headers, rows);

    const beforeStats = {
      rows: rows.length,
      columns: headers.length,
      nullCells: rows.reduce((sum, row) => sum + row.filter(v => !v.trim() || v.toLowerCase() === 'null').length, 0),
      duplicates: rows.length - new Set(rows.map(r => r.join('|'))).size,
      totalIssues: issues.reduce((s, i) => s + i.count, 0)
    };

    // Save scan
    const job = await prisma.cleaningJob.create({
      data: {
        datasetId,
        issues: JSON.stringify(issues),
        stats: JSON.stringify({ before: beforeStats }),
        status: 'review'
      }
    });

    return { success: true, data: { jobId: job.id, issues, stats: beforeStats } };
  } catch (error: any) {
    console.error('Scan error:', error);
    return { success: false, error: error.message };
  }
}

export async function applyCleaningFixes(jobId: string, selectedIssueIds?: string[]) {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Auth required' };

  try {
    const job = await prisma.cleaningJob.findUnique({ where: { id: jobId } });
    if (!job) return { success: false, error: 'Job not found' };

    const allIssues: CleaningIssue[] = JSON.parse(job.issues || '[]');
    const issuesToFix = selectedIssueIds
      ? allIssues.filter(i => selectedIssueIds.includes(i.id))
      : allIssues.filter(i => i.autoFixable);

    const dataset = await prisma.adminDataset.findUnique({
      where: { id: job.datasetId },
      include: { files: true }
    });

    if (!dataset?.files?.length) return { success: false, error: 'Dataset not found' };

    const file = dataset.files[0];
    let filePath = file.filePath;
    if (!path.isAbsolute(filePath)) filePath = path.resolve(process.cwd(), filePath);

    const content = fs.readFileSync(filePath, 'utf-8');
    const { headers, rows } = parseCSV(content);

    const { cleanedRows, appliedFixes } = applyFixes(headers, rows, issuesToFix);

    // Write cleaned file
    const cleanedContent = [headers.join(','), ...cleanedRows.map(r => r.map(v => v.includes(',') ? `"${v}"` : v).join(','))].join('\n');
    
    // Save to new file
    const cleanedPath = filePath.replace(/\.csv$/i, '_cleaned.csv');
    fs.writeFileSync(cleanedPath, cleanedContent, 'utf-8');

    const afterStats = {
      rows: cleanedRows.length,
      columns: headers.length,
      nullCells: cleanedRows.reduce((sum, row) => sum + row.filter(v => !v.trim() || v.toLowerCase() === 'null').length, 0),
      duplicates: cleanedRows.length - new Set(cleanedRows.map(r => r.join('|'))).size,
      totalIssues: 0
    };

    // Update job
    await prisma.cleaningJob.update({
      where: { id: jobId },
      data: {
        fixes: JSON.stringify(appliedFixes),
        stats: JSON.stringify({ before: JSON.parse(job.stats || '{}').before, after: afterStats }),
        status: 'applied'
      }
    });

    return {
      success: true,
      data: {
        appliedFixes,
        afterStats,
        cleanedFilePath: cleanedPath,
        originalRows: rows.length,
        cleanedRows: cleanedRows.length
      }
    };
  } catch (error: any) {
    console.error('Cleaning error:', error);
    return { success: false, error: error.message };
  }
}

export async function getCleaningJobs(datasetId: string) {
  const jobs = await prisma.cleaningJob.findMany({
    where: { datasetId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  return jobs.map(j => ({
    ...j,
    issues: j.issues ? JSON.parse(j.issues) : [],
    fixes: j.fixes ? JSON.parse(j.fixes) : [],
    stats: j.stats ? JSON.parse(j.stats) : {}
  }));
}
