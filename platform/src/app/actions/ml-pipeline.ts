'use server';

import prisma from '@/lib/db';
import { auth } from '@/auth';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { UniversalAIGateway } from '@/lib/ai/gateway';

async function enforceRoles(allowedRoles: string[]) {
  const session = await auth();
  if (!session || !session.user || !session.user.role) {
    throw new Error('UNAUTHORIZED: Authenticated session required.');
  }
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('ACCESS DENIED: Insufficient administrative privileges.');
  }
  return session;
}

export async function runMlPipeline(datasetId: string, targetCol?: string) {
  await enforceRoles(['ADMIN', 'SUPER-ADMIN']);
  
  try {
    // 1. Fetch dataset and its file
    const dataset = await prisma.adminDataset.findUnique({
      where: { id: datasetId },
      include: { files: true }
    });
    
    if (!dataset) {
      return { success: false, error: `Dataset with ID "${datasetId}" not found.` };
    }
    
    if (!dataset.files || dataset.files.length === 0) {
      return { success: false, error: `Dataset "${dataset.name}" has no files attached.` };
    }
    
    const file = dataset.files[0];
    let absolutePath = file.filePath;
    if (!path.isAbsolute(absolutePath)) {
      absolutePath = path.resolve(process.cwd(), absolutePath);
    }
    
    if (!fs.existsSync(absolutePath)) {
      return { success: false, error: `Physical dataset file not found at: ${absolutePath}` };
    }
    
    // Update status to processing
    await prisma.adminDataset.update({
      where: { id: datasetId },
      data: { status: 'processing' }
    });
    
    // 2. Spawn Python ML Script
    const scriptPath = path.join(process.cwd(), 'scripts', 'ml_pipeline.py');
    
    const resultJson = await new Promise<string>((resolve, reject) => {
      const pyArgs = [scriptPath, absolutePath];
      if (targetCol) {
        pyArgs.push(targetCol);
      }
      
      const pyProcess = spawn('python', pyArgs);
      
      let stdout = '';
      let stderr = '';
      
      pyProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pyProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pyProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}. Error: ${stderr}`));
        } else {
          resolve(stdout);
        }
      });
      
      pyProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });
    
    const pipelineResult = JSON.parse(resultJson);
    
    if (!pipelineResult.success) {
      await prisma.adminDataset.update({
        where: { id: datasetId },
        data: { status: 'failed' }
      });
      return { success: false, error: pipelineResult.error || 'Python ML analysis failed.' };
    }
    
    // 3. Process anomalies and create database alerts
    const anomalies = pipelineResult.anomalies || [];
    const criticalAnomalies = anomalies.filter((an: any) => an.severity === 'critical');
    
    for (const anom of criticalAnomalies) {
      await prisma.adminAlert.create({
        data: {
          title: `Critical ML Anomaly in ${anom.column}`,
          description: `Anomaly detected in row ${anom.row_index} of column "${anom.column}". Value: ${anom.value}. Deviation score: ${anom.score.toFixed(2)}. Reason: ${anom.type}.`,
          severity: 'critical',
          datasetId: datasetId,
          source: 'ml-scanner',
          isResolved: false
        }
      });
    }
    
    // Also create a general warning alert if there are many warning anomalies
    const warningAnomalies = anomalies.filter((an: any) => an.severity === 'warning');
    if (warningAnomalies.length > 5) {
      await prisma.adminAlert.create({
        data: {
          title: `Multiple ML Anomalies Detected`,
          description: `Auditor flagged ${warningAnomalies.length} warnings in dataset "${dataset.name}". Check the ML Pipeline dashboard for detailed reports.`,
          severity: 'warning',
          datasetId: datasetId,
          source: 'ml-scanner',
          isResolved: false
        }
      });
    }
    
    // 4. Generate Gemini Strategic Interpretation and Visual Layout Recommendations
    let geminiInsights = '';
    
    try {
      // Build a statistical metadata summary to satisfy token optimization guardrails
      const profileSummary = pipelineResult.data_profile.map((p: any) => 
        `- Column: ${p.name}, Type: ${p.type}, Unique Values: ${p.unique}, Missing Values: ${p.nulls}`
      ).join('\n');
      
      const cleanSummary = `Imputed values count: ${pipelineResult.cleaning.imputed_count}, Outliers handled: ${pipelineResult.cleaning.outliers_detected}, Engineered features: ${pipelineResult.cleaning.features_added.join(', ')}`;
      
      const modelInfo = pipelineResult.model_info;
      const modelSummary = `Model type: ${modelInfo.type}, Target variable: ${modelInfo.target_column || 'N/A'}, Algorithm: ${modelInfo.algorithm}, Metrics: ${JSON.stringify(modelInfo.metrics)}, Top Features: ${JSON.stringify(modelInfo.feature_importances)}`;
      
      const anomalySummary = `Total anomalies found: ${anomalies.length} (${criticalAnomalies.length} critical, ${warningAnomalies.length} warnings)`;
      
      const prompt = `
Act as an Expert AI Scientist and SaaS Enterprise Architect.
You are reviewing the statistical output of a Data Science & ML pipeline run on the dataset "${dataset.name}".
To preserve token usage, we are only sending the statistical metadata summary rather than the raw rows.

---
DATASET PROFILE METADATA:
${profileSummary}

DATA CLEANING & FEATURE ENGINEERING SUMMARY:
${cleanSummary}

MACHINE LEARNING MODEL OUTPUTS:
${modelSummary}

ANOMALIES AUDIT:
${anomalySummary}
---

Please generate an executive dashboard brief containing:
1. **Strategic Business Interpretation**: Explain what these modeling/forecasting/clustering results mean for business leaders. Translate the technical metrics (Accuracy, R2, Cluster groups) into practical, high-value corporate strategies.
2. **Anomaly & Fraud Risk Assessment**: Interpret the detected anomalies. Provide an analysis of why they might have occurred (e.g. system anomalies, logging issues, fraud risks) and actionable next steps.
3. **Dashboard Design & Tonality Recommendations**: Recommend the design aesthetic (colors, typography weight, visual priority) and corporate tonality suitable for presenting these specific insights to executive board members.

Format your output in professional Markdown with clear, elegant headers.
`;

      const aiResponse = await UniversalAIGateway.executeRequest({
        taskType: 'analytics',
        prompt,
        systemPrompt: 'You are a Senior Data Scientist and Enterprise Architect delivering strategic board-room business briefings.',
        temperature: 0.2,
        maxTokens: 1500
      });
      
      if (aiResponse.error) {
        console.warn(`[ML Server Action] Gemini request failed: ${aiResponse.error}`);
        
        const accuracy = modelInfo.metrics.accuracy || modelInfo.metrics.r2_score || 'N/A';
        const accuracyFormatted = typeof accuracy === 'number' 
          ? `${(accuracy * 100).toFixed(1)}%` 
          : accuracy;
        
        geminiInsights = `### 📊 ML Pipeline Analysis Executive Summary

Analysis completed successfully using **${modelInfo.algorithm}**.

#### 📈 Model Metrics
- **Algorithm**: ${modelInfo.algorithm}
- **Target Variable**: \`${modelInfo.target_column || 'Class'}\`
- **Performance Rating (Accuracy/R2)**: **${accuracyFormatted}**
- **Data Columns Profiled**: ${pipelineResult.data_profile.length} Columns

#### ⚠️ Anomaly Audit Log
- **Total Flagged Anomalies**: **${anomalies.length}** anomalies detected.
- **Critical Anomalies**: ${criticalAnomalies.length} flagged.
- **Warning Anomalies**: ${warningAnomalies.length} flagged.

---

### 💡 Local Strategic AI Insights (Fallback Engine)
*Note: The live Universal AI Gateway is currently offline or unconfigured. To unlock dynamic generative briefings, please configure a valid key in the [AI Providers Panel](/admin/ai/providers).*

1. **Modeling & Clustering Interpretation**:
   - The model has successfully trained on the dataset using a **${modelInfo.algorithm}**.
   - With an evaluation metric of **${accuracyFormatted}**, this model exhibits robust classification boundaries, suitable for batch predictions.
   - Recommended next step: Evaluate feature importances to determine key decision vectors.

2. **Risk & Anomaly Assessment**:
   - Out of the analyzed rows, **${anomalies.length}** data points deviated significantly from standard feature distributions.
   - This indicates minor data logging irregularities or potential outliers that have been automatically imputed by the pipeline.

3. **Strategic Recommendations**:
   - Present these findings to executives emphasizing the model's accuracy of **${accuracyFormatted}**.
   - Focus on optimizing the top feature dimensions highlighted in the feature importance telemetry.
`;
      } else {
        geminiInsights = aiResponse.text;
      }
    } catch (aiErr: any) {
      console.error('Error generating AI insights:', aiErr);
      geminiInsights = `Failed to generate AI insights: ${aiErr.message}`;
    }
    
    // Update status to ready
    await prisma.adminDataset.update({
      where: { id: datasetId },
      data: { status: 'ready' }
    });
    
    return {
      success: true,
      summary: pipelineResult.summary,
      cleaning: pipelineResult.cleaning,
      anomalies: pipelineResult.anomalies,
      model_info: pipelineResult.model_info,
      data_profile: pipelineResult.data_profile,
      visualization: pipelineResult.visualization,
      gemini_insights: geminiInsights
    };
    
  } catch (error: any) {
    console.error('Error running ML pipeline:', error);
    return { success: false, error: error.message || 'Internal Server Error' };
  }
}

export async function getAdminAlerts() {
  await enforceRoles(['ADMIN', 'SUPER-ADMIN']);
  try {
    return await prisma.adminAlert.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error: any) {
    console.error('Error fetching admin alerts:', error);
    return [];
  }
}

export async function resolveAdminAlert(alertId: string) {
  await enforceRoles(['ADMIN', 'SUPER-ADMIN']);
  try {
    await prisma.adminAlert.update({
      where: { id: alertId },
      data: { isResolved: true }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error resolving admin alert:', error);
    return { success: false, error: error.message };
  }
}
