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

/* ─── ML Algorithms (Pure TypeScript) ─── */

// Linear Regression
function trainLinearRegression(X: number[][], y: number[]): { weights: number[]; bias: number } {
  const n = X.length;
  const featureCount = X[0].length;
  const weights = new Array(featureCount).fill(0);
  let bias = 0;
  const lr = 0.0001;
  const iterations = 1000;

  for (let iter = 0; iter < iterations; iter++) {
    const gradW = new Array(featureCount).fill(0);
    let gradB = 0;

    for (let i = 0; i < n; i++) {
      let predicted = bias;
      for (let j = 0; j < featureCount; j++) predicted += weights[j] * X[i][j];
      const error = predicted - y[i];
      for (let j = 0; j < featureCount; j++) gradW[j] += (2 / n) * error * X[i][j];
      gradB += (2 / n) * error;
    }

    for (let j = 0; j < featureCount; j++) weights[j] -= lr * gradW[j];
    bias -= lr * gradB;
  }

  return { weights, bias };
}

// K-Nearest Neighbors
function trainKNN(X: number[][], y: number[], k: number = 5): { X: number[][]; y: number[]; k: number } {
  return { X, y, k };
}

function predictKNN(model: { X: number[][]; y: number[]; k: number }, sample: number[]): number {
  const distances = model.X.map((xi, idx) => ({
    dist: Math.sqrt(xi.reduce((s, v, j) => s + (v - sample[j]) ** 2, 0)),
    label: model.y[idx]
  }));
  distances.sort((a, b) => a.dist - b.dist);
  const nearest = distances.slice(0, model.k);

  // Check if classification or regression
  const uniqueLabels = new Set(model.y);
  if (uniqueLabels.size <= 10) {
    // Classification: majority vote
    const votes: Record<number, number> = {};
    nearest.forEach(n => { votes[n.label] = (votes[n.label] || 0) + 1; });
    return Number(Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]);
  } else {
    // Regression: average
    return nearest.reduce((s, n) => s + n.label, 0) / nearest.length;
  }
}

// Decision Tree (simple)
interface TreeNode {
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number;
}

function buildDecisionTree(X: number[][], y: number[], depth: number = 0, maxDepth: number = 8): TreeNode {
  if (depth >= maxDepth || y.length <= 5 || new Set(y).size === 1) {
    // Leaf node: mean for regression, mode for classification
    const counts: Record<number, number> = {};
    y.forEach(v => counts[v] = (counts[v] || 0) + 1);
    const mode = Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]);
    return { value: mode };
  }

  let bestFeature = 0, bestThreshold = 0, bestGain = -Infinity;
  const parentVariance = variance(y);

  for (let f = 0; f < X[0].length; f++) {
    const values = [...new Set(X.map(x => x[f]))].sort((a, b) => a - b);
    for (let t = 0; t < Math.min(values.length - 1, 20); t++) {
      const threshold = (values[t] + values[t + 1]) / 2;
      const leftIdx = X.map((x, i) => x[f] <= threshold ? i : -1).filter(i => i >= 0);
      const rightIdx = X.map((x, i) => x[f] > threshold ? i : -1).filter(i => i >= 0);
      
      if (leftIdx.length === 0 || rightIdx.length === 0) continue;

      const leftY = leftIdx.map(i => y[i]);
      const rightY = rightIdx.map(i => y[i]);
      const gain = parentVariance 
        - (leftY.length / y.length) * variance(leftY) 
        - (rightY.length / y.length) * variance(rightY);
      
      if (gain > bestGain) {
        bestGain = gain;
        bestFeature = f;
        bestThreshold = threshold;
      }
    }
  }

  if (bestGain <= 0) {
    const counts: Record<number, number> = {};
    y.forEach(v => counts[v] = (counts[v] || 0) + 1);
    return { value: Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) };
  }

  const leftIdx = X.map((x, i) => x[bestFeature] <= bestThreshold ? i : -1).filter(i => i >= 0);
  const rightIdx = X.map((x, i) => x[bestFeature] > bestThreshold ? i : -1).filter(i => i >= 0);

  return {
    featureIndex: bestFeature,
    threshold: bestThreshold,
    left: buildDecisionTree(leftIdx.map(i => X[i]), leftIdx.map(i => y[i]), depth + 1, maxDepth),
    right: buildDecisionTree(rightIdx.map(i => X[i]), rightIdx.map(i => y[i]), depth + 1, maxDepth)
  };
}

function predictTree(tree: TreeNode, sample: number[]): number {
  if (tree.value !== undefined) return tree.value;
  if (sample[tree.featureIndex!] <= tree.threshold!) {
    return predictTree(tree.left!, sample);
  }
  return predictTree(tree.right!, sample);
}

function variance(arr: number[]): number {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
}

// Random Forest
function buildRandomForest(X: number[][], y: number[], nTrees: number = 10, maxDepth: number = 6): TreeNode[] {
  const trees: TreeNode[] = [];
  for (let t = 0; t < nTrees; t++) {
    // Bootstrap sample
    const indices = Array.from({ length: X.length }, () => Math.floor(Math.random() * X.length));
    const bsX = indices.map(i => X[i]);
    const bsY = indices.map(i => y[i]);
    trees.push(buildDecisionTree(bsX, bsY, 0, maxDepth));
  }
  return trees;
}

function predictForest(trees: TreeNode[], sample: number[]): number {
  const predictions = trees.map(t => predictTree(t, sample));
  // Majority vote or average
  const uniqueVals = new Set(predictions);
  if (uniqueVals.size <= 10) {
    const votes: Record<number, number> = {};
    predictions.forEach(p => votes[p] = (votes[p] || 0) + 1);
    return Number(Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]);
  }
  return predictions.reduce((a, b) => a + b, 0) / predictions.length;
}

/* ─── Normalization ─── */
function normalize(X: number[][]): { normalized: number[][]; mins: number[]; maxs: number[] } {
  const featureCount = X[0].length;
  const mins = new Array(featureCount).fill(Infinity);
  const maxs = new Array(featureCount).fill(-Infinity);
  X.forEach(row => row.forEach((v, j) => {
    if (v < mins[j]) mins[j] = v;
    if (v > maxs[j]) maxs[j] = v;
  }));
  const normalized = X.map(row => row.map((v, j) => {
    const range = maxs[j] - mins[j];
    return range === 0 ? 0 : (v - mins[j]) / range;
  }));
  return { normalized, mins, maxs };
}

/* ─── Metrics ─── */
function calculateMetrics(actual: number[], predicted: number[]): {
  r2: number; mae: number; mse: number; accuracy?: number; confusionMatrix?: any;
} {
  const n = actual.length;
  const meanActual = actual.reduce((a, b) => a + b, 0) / n;
  
  let ssTot = 0, ssRes = 0, maeSum = 0, mseSum = 0;
  for (let i = 0; i < n; i++) {
    ssTot += (actual[i] - meanActual) ** 2;
    ssRes += (actual[i] - predicted[i]) ** 2;
    maeSum += Math.abs(actual[i] - predicted[i]);
    mseSum += (actual[i] - predicted[i]) ** 2;
  }

  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const mae = maeSum / n;
  const mse = mseSum / n;

  // Classification accuracy
  const uniqueLabels = new Set(actual);
  if (uniqueLabels.size <= 10) {
    let correct = 0;
    actual.forEach((a, i) => { if (Math.round(a) === Math.round(predicted[i])) correct++; });
    return { r2, mae, mse, accuracy: (correct / n) * 100 };
  }

  return { r2, mae, mse };
}

/* ─── Feature Importance (permutation-based) ─── */
function computeFeatureImportance(
  X: number[][], y: number[], predictFn: (sample: number[]) => number, featureNames: string[]
): { name: string; importance: number }[] {
  // Baseline score
  const baseline = y.map((yi, i) => (yi - predictFn(X[i])) ** 2);
  const baselineMSE = baseline.reduce((a, b) => a + b, 0) / baseline.length;

  return featureNames.map((name, fIdx) => {
    // Permute feature
    const permuted = X.map(row => [...row]);
    for (let i = permuted.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [permuted[i][fIdx], permuted[j][fIdx]] = [permuted[j][fIdx], permuted[i][fIdx]];
    }
    const permutedErrors = y.map((yi, i) => (yi - predictFn(permuted[i])) ** 2);
    const permutedMSE = permutedErrors.reduce((a, b) => a + b, 0) / permutedErrors.length;
    
    return { name, importance: Math.max(0, permutedMSE - baselineMSE) };
  }).sort((a, b) => b.importance - a.importance);
}

/* ─── Main Training Action ─── */
export async function trainModel(
  datasetId: string,
  targetCol: string,
  modelType: string = 'random_forest',
  featureCols?: string[],
  modelName?: string
) {
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

    const targetIdx = headers.findIndex(h => h.toLowerCase() === targetCol.toLowerCase());
    if (targetIdx === -1) return { success: false, error: `Target column "${targetCol}" not found` };

    // Determine feature columns
    const featureHeaders = featureCols?.length 
      ? featureCols 
      : headers.filter((h, i) => i !== targetIdx);

    const featureIndices = featureHeaders.map(f => headers.findIndex(h => h.toLowerCase() === f.toLowerCase())).filter(i => i >= 0);

    // Build training data (only numeric)
    const validRows = rows.filter(row => {
      if (row[targetIdx] === '' || isNaN(Number(row[targetIdx]))) return false;
      return featureIndices.every(fi => row[fi] !== '' && !isNaN(Number(row[fi])));
    });

    if (validRows.length < 10) return { success: false, error: 'Need at least 10 valid numeric rows for training' };

    const X = validRows.map(row => featureIndices.map(fi => Number(row[fi])));
    const y = validRows.map(row => Number(row[targetIdx]));

    // Train-test split (80/20)
    const splitIdx = Math.floor(X.length * 0.8);
    const trainX = X.slice(0, splitIdx);
    const trainY = y.slice(0, splitIdx);
    const testX = X.slice(splitIdx);
    const testY = y.slice(splitIdx);

    // Normalize
    const { normalized: normTrainX, mins, maxs } = normalize(trainX);
    const normTestX = testX.map(row => row.map((v, j) => {
      const range = maxs[j] - mins[j];
      return range === 0 ? 0 : (v - mins[j]) / range;
    }));

    let modelData: any = {};
    let predictFn: (sample: number[]) => number;

    switch (modelType) {
      case 'linear_regression': {
        const model = trainLinearRegression(normTrainX, trainY);
        modelData = { ...model, type: 'linear_regression', mins, maxs };
        predictFn = (s: number[]) => {
          let pred = model.bias;
          for (let j = 0; j < model.weights.length; j++) pred += model.weights[j] * s[j];
          return pred;
        };
        break;
      }
      case 'knn': {
        const model = trainKNN(normTrainX, trainY, 5);
        modelData = { type: 'knn', k: 5, mins, maxs, sampleCount: normTrainX.length };
        predictFn = (s: number[]) => predictKNN(model, s);
        break;
      }
      case 'decision_tree': {
        const tree = buildDecisionTree(normTrainX, trainY, 0, 8);
        modelData = { type: 'decision_tree', tree, mins, maxs };
        predictFn = (s: number[]) => predictTree(tree, s);
        break;
      }
      case 'random_forest':
      default: {
        const trees = buildRandomForest(normTrainX, trainY, 15, 6);
        modelData = { type: 'random_forest', treeCount: trees.length, mins, maxs };
        predictFn = (s: number[]) => predictForest(trees, s);
        break;
      }
    }

    // Evaluate on test set
    const testPredictions = normTestX.map(s => predictFn(s));
    const metrics = calculateMetrics(testY, testPredictions);

    // Feature importance
    const featureImportance = computeFeatureImportance(
      normTestX, testY, predictFn,
      featureIndices.map(fi => headers[fi])
    );

    const fullMetrics = { ...metrics, featureImportance };
    const overallAccuracy = metrics.accuracy ?? Math.max(0, metrics.r2 * 100);

    // Save to DB
    const trainedModel = await prisma.trainedModel.create({
      data: {
        name: modelName || `${modelType}_${dataset.name}_${Date.now()}`,
        datasetId,
        modelType,
        targetCol,
        featureCols: JSON.stringify(featureIndices.map(fi => headers[fi])),
        accuracy: overallAccuracy,
        metrics: JSON.stringify(fullMetrics),
        modelData: JSON.stringify({ ...modelData, featureNames: featureIndices.map(fi => headers[fi]) }),
        status: 'ready',
        trainedBy: session.user.email || session.user.name || 'unknown'
      }
    });

    return {
      success: true,
      data: {
        modelId: trainedModel.id,
        modelType,
        accuracy: overallAccuracy,
        metrics: fullMetrics,
        trainSize: trainX.length,
        testSize: testX.length,
        featureImportance
      }
    };
  } catch (error: any) {
    console.error('Model training error:', error);
    return { success: false, error: error.message };
  }
}

export async function getTrainedModels(datasetId?: string) {
  const where = datasetId ? { datasetId } : {};
  const models = await prisma.trainedModel.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return models.map(m => ({
    ...m,
    metrics: m.metrics ? JSON.parse(m.metrics) : null,
    featureCols: m.featureCols ? JSON.parse(m.featureCols) : []
  }));
}

export async function deleteTrainedModel(modelId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'Auth required' };
  await prisma.trainedModel.delete({ where: { id: modelId } });
  return { success: true };
}
