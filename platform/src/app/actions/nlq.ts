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

/* ─── NLQ Intent Parser ─── */
interface QueryIntent {
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'table' | 'kpi';
  columns: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
  filter?: { column: string; operator: string; value: string };
  limit?: number;
  sortDir?: 'asc' | 'desc';
}

const CHART_KEYWORDS: Record<string, QueryIntent['chartType']> = {
  'trend': 'line', 'line': 'line', 'time': 'line', 'over time': 'line', 'growth': 'line',
  'bar': 'bar', 'compare': 'bar', 'comparison': 'bar', 'versus': 'bar', 'vs': 'bar',
  'pie': 'pie', 'distribution': 'pie', 'breakdown': 'pie', 'share': 'pie', 'proportion': 'pie',
  'scatter': 'scatter', 'correlation': 'scatter', 'relationship': 'scatter',
  'table': 'table', 'list': 'table', 'show': 'table', 'data': 'table',
  'total': 'kpi', 'average': 'kpi', 'count': 'kpi', 'how many': 'kpi', 'sum': 'kpi',
};

const AGG_KEYWORDS: Record<string, QueryIntent['aggregation']> = {
  'total': 'sum', 'sum': 'sum', 'add': 'sum',
  'average': 'avg', 'avg': 'avg', 'mean': 'avg',
  'count': 'count', 'how many': 'count', 'number of': 'count',
  'minimum': 'min', 'min': 'min', 'lowest': 'min', 'smallest': 'min',
  'maximum': 'max', 'max': 'max', 'highest': 'max', 'largest': 'max', 'top': 'max',
};

function parseQuery(query: string, availableColumns: string[]): QueryIntent {
  const q = query.toLowerCase();

  // Detect chart type
  let chartType: QueryIntent['chartType'] = 'bar';
  for (const [keyword, type] of Object.entries(CHART_KEYWORDS)) {
    if (q.includes(keyword)) { chartType = type; break; }
  }

  // Detect aggregation
  let aggregation: QueryIntent['aggregation'] | undefined;
  for (const [keyword, agg] of Object.entries(AGG_KEYWORDS)) {
    if (q.includes(keyword)) { aggregation = agg; break; }
  }

  // Match columns from query
  const matchedCols = availableColumns.filter(col =>
    q.includes(col.toLowerCase()) ||
    q.includes(col.toLowerCase().replace(/_/g, ' '))
  );

  // Detect group by ("by category", "per region", "for each")
  let groupBy: string | undefined;
  const groupPatterns = [/by\s+(\w+)/i, /per\s+(\w+)/i, /for each\s+(\w+)/i, /group\s+(\w+)/i];
  for (const pattern of groupPatterns) {
    const match = q.match(pattern);
    if (match) {
      const groupCol = availableColumns.find(c => c.toLowerCase().includes(match[1].toLowerCase()));
      if (groupCol) { groupBy = groupCol; break; }
    }
  }

  // Detect limit ("top 5", "bottom 10")
  let limit: number | undefined;
  let sortDir: 'asc' | 'desc' | undefined;
  const topMatch = q.match(/top\s+(\d+)/);
  const bottomMatch = q.match(/bottom\s+(\d+)/);
  if (topMatch) { limit = parseInt(topMatch[1]); sortDir = 'desc'; }
  if (bottomMatch) { limit = parseInt(bottomMatch[1]); sortDir = 'asc'; }

  // If no columns matched, use all numeric columns
  const columns = matchedCols.length > 0 ? matchedCols : availableColumns.slice(0, 3);

  // Override: KPI type for aggregation queries with single result
  if (aggregation && !groupBy && chartType !== 'line') {
    chartType = 'kpi';
  }

  return { chartType, columns, aggregation, groupBy, limit, sortDir };
}

/* ─── Execute Query ─── */
function executeQuery(
  intent: QueryIntent,
  headers: string[],
  rows: string[][]
): { chartConfig: any; resultData: any; explanation: string } {
  const { chartType, columns, aggregation, groupBy, limit, sortDir } = intent;

  // Helper to get column values
  const getCol = (name: string) => {
    const idx = headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
    if (idx === -1) return [];
    return rows.map(r => r[idx]);
  };

  const getNumCol = (name: string) => getCol(name).map(Number).filter(v => !isNaN(v));

  // ── KPI Mode ──
  if (chartType === 'kpi' && columns.length > 0) {
    const values = getNumCol(columns[0]);
    let result = 0;
    switch (aggregation) {
      case 'sum': result = values.reduce((a, b) => a + b, 0); break;
      case 'avg': result = values.reduce((a, b) => a + b, 0) / values.length; break;
      case 'count': result = values.length; break;
      case 'min': result = Math.min(...values); break;
      case 'max': result = Math.max(...values); break;
      default: result = values.reduce((a, b) => a + b, 0);
    }
    return {
      chartConfig: { type: 'kpi' },
      resultData: { value: result, column: columns[0], aggregation: aggregation || 'sum' },
      explanation: `${(aggregation || 'Total').toUpperCase()} of "${columns[0]}" = ${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    };
  }

  // ── Grouped Aggregation (Bar/Pie) ──
  if (groupBy && columns.length > 0) {
    const groupVals = getCol(groupBy);
    const dataVals = getCol(columns[0]);
    const groups: Record<string, number[]> = {};
    
    groupVals.forEach((g, i) => {
      if (!groups[g]) groups[g] = [];
      const num = Number(dataVals[i]);
      if (!isNaN(num)) groups[g].push(num);
    });

    let aggregated: { label: string; value: number }[] = Object.entries(groups).map(([label, vals]) => {
      let value = 0;
      switch (aggregation) {
        case 'avg': value = vals.reduce((a, b) => a + b, 0) / vals.length; break;
        case 'count': value = vals.length; break;
        case 'min': value = Math.min(...vals); break;
        case 'max': value = Math.max(...vals); break;
        default: value = vals.reduce((a, b) => a + b, 0);
      }
      return { label, value };
    });

    // Sort and limit
    if (sortDir === 'desc') aggregated.sort((a, b) => b.value - a.value);
    else if (sortDir === 'asc') aggregated.sort((a, b) => a.value - b.value);
    if (limit) aggregated = aggregated.slice(0, limit);

    return {
      chartConfig: {
        type: chartType === 'pie' ? 'pie' : 'bar',
        labels: aggregated.map(a => a.label),
        values: aggregated.map(a => a.value),
        xLabel: groupBy,
        yLabel: `${(aggregation || 'Sum')} of ${columns[0]}`
      },
      resultData: aggregated,
      explanation: `${(aggregation || 'Sum').toUpperCase()} of "${columns[0]}" grouped by "${groupBy}" (${aggregated.length} groups)`
    };
  }

  // ── Line/Scatter (raw values) ──
  if (chartType === 'line' || chartType === 'scatter') {
    const xValues = columns.length > 1 ? getCol(columns[0]) : rows.map((_, i) => String(i + 1));
    const yCol = columns.length > 1 ? columns[1] : columns[0];
    const yValues = getNumCol(yCol);
    const xLabels = columns.length > 1 ? xValues.slice(0, yValues.length) : xValues.slice(0, yValues.length);

    return {
      chartConfig: {
        type: chartType,
        labels: xLabels,
        values: yValues,
        xLabel: columns.length > 1 ? columns[0] : 'Index',
        yLabel: yCol
      },
      resultData: xLabels.map((x, i) => ({ x, y: yValues[i] })),
      explanation: `${chartType === 'line' ? 'Trend' : 'Scatter plot'} of "${yCol}" (${yValues.length} data points)`
    };
  }

  // ── Table Mode ──
  let tableData = rows.map(row => {
    const obj: Record<string, string> = {};
    columns.forEach(col => {
      const idx = headers.findIndex(h => h.toLowerCase() === col.toLowerCase());
      if (idx !== -1) obj[col] = row[idx];
    });
    return obj;
  });

  if (sortDir && columns.length > 0) {
    const sortCol = columns[0];
    tableData.sort((a, b) => {
      const va = Number(a[sortCol]) || 0;
      const vb = Number(b[sortCol]) || 0;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  }
  if (limit) tableData = tableData.slice(0, limit);

  return {
    chartConfig: { type: 'table', columns },
    resultData: tableData,
    explanation: `Showing ${tableData.length} rows for columns: ${columns.join(', ')}`
  };
}

/* ─── Main Action ─── */
export async function processNaturalQuery(datasetId: string, query: string) {
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
    if (rows.length === 0) return { success: false, error: 'Dataset is empty' };

    // Parse natural language query into structured intent
    const intent = parseQuery(query, headers);
    
    // Execute the query
    const result = executeQuery(intent, headers, rows);

    return {
      success: true,
      data: {
        query,
        intent,
        ...result,
        datasetName: dataset.name,
        rowCount: rows.length,
        availableColumns: headers
      }
    };
  } catch (error: any) {
    console.error('NLQ error:', error);
    return { success: false, error: error.message };
  }
}

export async function getNLQuerySuggestions(datasetId: string) {
  try {
    const dataset = await prisma.adminDataset.findUnique({
      where: { id: datasetId },
      include: { files: true }
    });

    if (!dataset?.files?.length) return [];

    const file = dataset.files[0];
    let filePath = file.filePath;
    if (!path.isAbsolute(filePath)) filePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, 'utf-8');
    const { headers } = parseCSV(content);

    // Generate smart suggestions based on columns
    const suggestions: string[] = [];
    const numericCols = headers.filter(h => h.toLowerCase().includes('price') || h.toLowerCase().includes('amount') || h.toLowerCase().includes('sales') || h.toLowerCase().includes('revenue') || h.toLowerCase().includes('count') || h.toLowerCase().includes('total') || h.toLowerCase().includes('value'));
    const textCols = headers.filter(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('category') || h.toLowerCase().includes('type') || h.toLowerCase().includes('region') || h.toLowerCase().includes('status'));

    if (numericCols.length > 0) {
      suggestions.push(`Show trend of ${numericCols[0]} over time`);
      suggestions.push(`What is the total ${numericCols[0]}?`);
      suggestions.push(`Top 10 highest ${numericCols[0]}`);
    }
    if (numericCols.length > 0 && textCols.length > 0) {
      suggestions.push(`Compare ${numericCols[0]} by ${textCols[0]}`);
      suggestions.push(`Distribution of ${numericCols[0]} by ${textCols[0]}`);
      suggestions.push(`Average ${numericCols[0]} per ${textCols[0]}`);
    }
    if (headers.length > 0) {
      suggestions.push(`Show all data in table format`);
      suggestions.push(`Count of records by ${headers[0]}`);
    }

    return suggestions;
  } catch {
    return [];
  }
}
