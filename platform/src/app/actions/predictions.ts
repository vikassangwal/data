'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';

/* ─── CSV Parser (shared) ─── */
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

/* ─── Forecasting Methods ─── */
function linearRegression(values: number[]): { slope: number; intercept: number; r2: number } {
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
    sumYY += values[i] * values[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // R² calculation
  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * i + intercept;
    ssTot += (values[i] - yMean) ** 2;
    ssRes += (values[i] - predicted) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

function movingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
  }
  return result;
}

function exponentialSmoothing(values: number[], alpha: number = 0.3): number[] {
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

/* ─── Main Action ─── */
export async function runPrediction(datasetId: string, targetColumn: string, horizon: number = 6, method: string = 'linear') {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Authentication required' };

  try {
    const dataset = await prisma.adminDataset.findUnique({
      where: { id: datasetId },
      include: { files: true }
    });

    if (!dataset || !dataset.files?.length) return { success: false, error: 'Dataset or file not found' };

    const file = dataset.files[0];
    let filePath = file.filePath;
    if (!path.isAbsolute(filePath)) filePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(filePath)) return { success: false, error: 'File not found on disk' };

    const content = fs.readFileSync(filePath, 'utf-8');
    const { headers, rows } = parseCSV(content);

    const colIndex = headers.findIndex(h => h.toLowerCase() === targetColumn.toLowerCase());
    if (colIndex === -1) return { success: false, error: `Column "${targetColumn}" not found. Available: ${headers.join(', ')}` };

    // Extract numeric values
    const values = rows.map(r => r[colIndex]).filter(v => v !== '' && !isNaN(Number(v))).map(Number);
    if (values.length < 5) return { success: false, error: 'Need at least 5 data points for prediction' };

    let predictions: number[] = [];
    let accuracy = 0;
    let smoothed: number[] = [];

    switch (method) {
      case 'linear': {
        const { slope, intercept, r2 } = linearRegression(values);
        accuracy = Math.max(0, r2 * 100);
        for (let i = 0; i < horizon; i++) {
          predictions.push(slope * (values.length + i) + intercept);
        }
        smoothed = values.map((_, i) => slope * i + intercept);
        break;
      }
      case 'moving_avg': {
        const window = Math.max(3, Math.floor(values.length / 5));
        smoothed = movingAverage(values, window);
        // Predict by extrapolating the last trend
        const lastSmoothed = smoothed.slice(-window);
        const trend = (lastSmoothed[lastSmoothed.length - 1] - lastSmoothed[0]) / lastSmoothed.length;
        const lastVal = smoothed[smoothed.length - 1];
        for (let i = 1; i <= horizon; i++) {
          predictions.push(lastVal + trend * i);
        }
        // Simple accuracy based on how well MA fits recent data
        const recentErrors = values.slice(-10).map((v, i) => Math.abs(v - smoothed[smoothed.length - 10 + i]));
        const avgError = recentErrors.reduce((a, b) => a + b, 0) / recentErrors.length;
        const avgVal = values.slice(-10).reduce((a, b) => a + b, 0) / 10;
        accuracy = Math.max(0, (1 - avgError / Math.abs(avgVal || 1)) * 100);
        break;
      }
      case 'exponential': {
        smoothed = exponentialSmoothing(values, 0.3);
        // Double exponential for trend
        const level = smoothed[smoothed.length - 1];
        const trend2 = smoothed.length > 1 
          ? (smoothed[smoothed.length - 1] - smoothed[smoothed.length - 2]) 
          : 0;
        for (let i = 1; i <= horizon; i++) {
          predictions.push(level + trend2 * i);
        }
        const recentErrors2 = values.slice(-10).map((v, i) => Math.abs(v - smoothed[smoothed.length - 10 + i]));
        const avgError2 = recentErrors2.reduce((a, b) => a + b, 0) / recentErrors2.length;
        const avgVal2 = values.slice(-10).reduce((a, b) => a + b, 0) / 10;
        accuracy = Math.max(0, (1 - avgError2 / Math.abs(avgVal2 || 1)) * 100);
        break;
      }
      default:
        return { success: false, error: `Unknown method: ${method}` };
    }

    // Calculate confidence intervals (±2 standard deviations of residuals)
    const residuals = values.map((v, i) => v - (smoothed[i] || v));
    const residualStd = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / residuals.length);

    const confidence = predictions.map((p, i) => ({
      predicted: p,
      lower: p - 2 * residualStd * Math.sqrt(1 + (i + 1) / values.length),
      upper: p + 2 * residualStd * Math.sqrt(1 + (i + 1) / values.length)
    }));

    // Save to DB
    const job = await prisma.predictionJob.create({
      data: {
        datasetId,
        targetCol: targetColumn,
        horizon,
        method,
        results: JSON.stringify({
          historical: values,
          smoothed,
          predictions,
          confidence,
          labels: {
            historical: Array.from({ length: values.length }, (_, i) => `T${i + 1}`),
            predicted: Array.from({ length: horizon }, (_, i) => `T${values.length + i + 1}`)
          }
        }),
        accuracy,
        status: 'completed'
      }
    });

    return {
      success: true,
      data: {
        jobId: job.id,
        historical: values,
        smoothed,
        predictions,
        confidence,
        accuracy,
        method
      }
    };
  } catch (error: any) {
    console.error('Prediction error:', error);
    return { success: false, error: error.message };
  }
}

export async function getPredictionJobs(datasetId: string) {
  const jobs = await prisma.predictionJob.findMany({
    where: { datasetId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  return jobs.map(j => ({
    ...j,
    results: j.results ? JSON.parse(j.results) : null
  }));
}

export async function getDatasetColumns(datasetId: string) {
  try {
    const dataset = await prisma.adminDataset.findUnique({
      where: { id: datasetId },
      include: { files: true }
    });
    if (!dataset?.files?.length) return { success: false, error: 'No files' };

    const file = dataset.files[0];
    let filePath = file.filePath;
    if (!path.isAbsolute(filePath)) filePath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(filePath)) return { success: false, error: 'File not found' };

    const content = fs.readFileSync(filePath, 'utf-8');
    const { headers, rows } = parseCSV(content);

    const columns = headers.map((h, idx) => {
      const values = rows.map(r => r[idx]).filter(v => v !== '');
      const numericValues = values.filter(v => !isNaN(Number(v)));
      const isNumeric = numericValues.length > values.length * 0.5;
      return {
        name: h,
        type: isNumeric ? 'numeric' : 'text',
        nonNull: values.length,
        total: rows.length,
        sample: values.slice(0, 3)
      };
    });

    return { success: true, data: { columns, rowCount: rows.length } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
