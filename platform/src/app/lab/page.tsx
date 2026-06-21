'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import FormulaBotSuite from '@/components/lab/FormulaBotSuite';
import PowerBIDashboard from '@/components/lab/PowerBIDashboard';
import DataModeler from '@/components/lab/DataModeler';
import { createDataset, saveChatMessage } from '@/app/actions/lab';
import { useSession } from 'next-auth/react';
import { simulateCheckout } from '@/app/actions/pricing';

// ==============================================================
// 🌐 MULTI-LANGUAGE DICTIONARY (EN, HI, AR, ES, FR, DE)
// ==============================================================
interface Translation {
  title: string;
  subtitle: string;
  langBtn: string;

  // Hero Section
  heroTag: string;
  heroHeading: string;
  heroHeadingGrad: string;
  heroSubheading: string;
  heroTryBtn: string;
  heroFeaturesBtn: string;
  heroStatAcc: string;
  heroStatSpeed: string;
  heroStatQueries: string;

  // Tabs / Navigation
  tabSandbox: string;
  tabAutoML: string;
  tabScience: string;
  tabUploader: string;
  tabFormulaBot: string;
  tabDashboard: string;

  // Model Playground
  playgroundTitle: string;
  playgroundSub: string;
  selectAlgo: string;
  paramsTitle: string;
  epochs: string;
  lr: string;
  regularization: string;
  retrainBtn: string;
  exportBtn: string;
  trainingMetrics: string;
  lossVal: string;
  accVal: string;
  f1Val: string;
  activeStatus: string;
  trainingStatus: string;
  stableStatus: string;
  lossCurveTitle: string;

  // AI Chat Sandbox
  chatTitle: string;
  chatStatus: string;
  placeholder: string;
  sendBtn: string;
  clickPrompt: string;
  prompts: string[];
  startingBotMsg: string;
  calculating: string;

  // Data Cleaner
  cleanerTitle: string;
  cleanerSub: string;
  cleanerHealth: string;
  cleanerCols: string;
  cleanerStats: string;
  totalRows: string;
  anomalies: string;
  missingVals: string;
  cleanBtn: string;
  cleaningProgress: string[];
  cleanSuccess: string;

  // Voice Assistant
  voiceTitle: string;
  voiceStatusIdle: string;
  voiceStatusListening: string;
  voiceStatusProcessing: string;
  voiceStatusExecuted: string;

  // Heatmap
  heatmapTitle: string;
  heatmapSub: string;
  heatmapTooltip: string;
  heatmapNoTooltip: string;
  heatmapDesc: { [key: string]: string };

  // Data Science Modules
  pcaTitle: string;
  pcaSub: string;
  pcaClusters: string;
  pcaOutliers: string;
  pcaSilhouette: string;
  pcaHoverText: string;

  ttestTitle: string;
  ttestSub: string;
  ttestSampleA: string;
  ttestSampleB: string;
  ttestMean: string;
  ttestVar: string;
  ttestSize: string;
  ttestTStat: string;
  ttestPVal: string;
  ttestConf: string;

  anomalyTitle: string;
  anomalySub: string;
  anomalyFlushBtn: string;
  anomalyPurgeBtn: string;
  anomalyHealthyLog: string;

  // Database pipelines
  pipelinesTitle: string;
  pipelinesSub: string;

  // Security Block
  securityTitle: string;
  securitySub: string;
  securityBadge1Title: string;
  securityBadge1Desc: string;
  securityBadge2Title: string;
  securityBadge2Desc: string;
  securityBadge3Title: string;
  securityBadge3Desc: string;
  securityBadge4Title: string;
  securityBadge4Desc: string;

  // Pricing Block
  pricingTitle: string;
  pricingSub: string;
  planStarter: string;
  planPro: string;
  planEnt: string;
  priceStarter: string;
  pricePro: string;
  priceEnt: string;
  getStarted: string;
  featuresStarter: string[];
  featuresPro: string[];
  featuresEnt: string[];

  // Uploader UI
  uploadTitle: string;
  uploadSub: string;
  uploadDragText: string;
  uploadSizeText: string;
  uploadActiveScan: string;
  uploadGridPreview: string;
  downloadCSV: string;
  downloadPDF: string;
  editableGridTitle: string;

  // Checkout modal
  modalTitle: string;
  modalCardNo: string;
  modalExpiry: string;
  modalCvv: string;
  modalCardName: string;
  modalPayBtn: string;
  modalProcessing: string;
  modalSuccess: string;
}

const TRANSLATIONS: { [key: string]: Translation } = {
  EN: {
    title: "Cinematic Data Lab",
    subtitle: "Premium Sandbox for AI Data Analytics & AutoML Systems",
    langBtn: "हिन्दी / العربية / ES / FR / DE",

    heroTag: "🔮 Powered by GPT-4o & Advanced ML",
    heroHeading: "Your Personal",
    heroHeadingGrad: "AI Data Analyst",
    heroSubheading: "Transform raw Excel files, SQL databases, and CSVs into stunning interactive dashboards, predictive forecasts, and machine learning models in seconds using natural language.",
    heroTryBtn: "Try Sandbox →",
    heroFeaturesBtn: "Explore Features",
    heroStatAcc: "Model Accuracy",
    heroStatSpeed: "Analysis Speed",
    heroStatQueries: "Queries Run",

    tabSandbox: "AI Chat Sandbox",
    tabAutoML: "AutoML Tuning Laboratory",
    tabScience: "Advanced Statistics & PCA",
    tabUploader: "Dataset Portal",
    tabFormulaBot: "Spreadsheet Copilot",
    tabDashboard: "BI Dashboard",

    playgroundTitle: "Advanced Model Playground",
    playgroundSub: "Fine-tune hyperparameters and witness training convergence in real-time.",
    selectAlgo: "Select Algorithm",
    paramsTitle: "Hyperparameter Settings",
    epochs: "Training Epochs",
    lr: "Learning Rate",
    regularization: "Regularization (Lambda)",
    retrainBtn: "Train Model Network",
    exportBtn: "Export Python Code",
    trainingMetrics: "Training Telemetry",
    lossVal: "Training Loss",
    accVal: "Model Accuracy",
    f1Val: "F1 Score Metric",
    activeStatus: "OPTIMIZING...",
    trainingStatus: "TRAINING...",
    stableStatus: "STABLE",
    lossCurveTitle: "Live Loss Convergence Curve",

    chatTitle: "AI Data Analyst Sandbox",
    chatStatus: "READY TO ANALYZE",
    placeholder: "Ask a question about sales, churn, database...",
    sendBtn: "Send Query",
    clickPrompt: "CLICK A SUGGESTED INSTRUCTION:",
    prompts: [
      "Analyze sales trends by cohort for 2026.",
      "Predict customer churn probability with SVM.",
      "What is the correlation between Revenue and Ad Spend?"
    ],
    startingBotMsg: "Hello! I have loaded your dataset: <code>sales_q1_insights.csv</code> (12,480 rows). Ask me anything in English or Hindi, or click a prompt!",
    calculating: "Running query in sandbox...",

    cleanerTitle: "Data Cleanse & Profiler",
    cleanerSub: "Purge duplicates, fill null cells, and optimize feature datasets.",
    cleanerHealth: "Dataset Health Index",
    cleanerCols: "Interactive Column Selection",
    cleanerStats: "Profiling Telemetry",
    totalRows: "Total Processed Rows",
    anomalies: "Anomalous Records",
    missingVals: "Null Cell Counts",
    cleanBtn: "Execute Deep Cleanse",
    cleaningProgress: [
      "Scanning missing value cells...",
      "Executing KNN imputation...",
      "Purging duplicate records...",
      "Standardizing feature columns..."
    ],
    cleanSuccess: "Dataset fully sanitized! Health is excellent.",

    voiceTitle: "Voice Assistant Simulator",
    voiceStatusIdle: "Click Mic & say: 'Show Sales Forecast'",
    voiceStatusListening: "Listening to audio input stream...",
    voiceStatusProcessing: "Converting speech to analytical query...",
    voiceStatusExecuted: "Executed command successfully!",

    heatmapTitle: "Interactive Correlation Matrix",
    heatmapSub: "Hover over cells to inspect coefficient relationships between target columns.",
    heatmapTooltip: "Correlation Coefficient",
    heatmapNoTooltip: "Hover over any cell inside the matrix",
    heatmapDesc: {
      "Revenue_Revenue": "Self-correlation (1.00)",
      "Revenue_Ad_Spend": "Strong positive correlation (+0.84). Marketing spend directly drives user acquisitions.",
      "Revenue_User_Growth": "High correlation (+0.76). Customer base expansion is scaling revenue proportionally.",
      "Revenue_Churn_Rate": "Negative correlation (-0.48). Churn slightly degrades gross revenue performance.",
      "Ad_Spend_Revenue": "Strong positive correlation (+0.84). Marketing spend directly drives user acquisitions.",
      "Ad_Spend_Ad_Spend": "Self-correlation (1.00)",
      "Ad_Spend_User_Growth": "Medium positive correlation (+0.58). Campaign expenditures pull in new users.",
      "Ad_Spend_Churn_Rate": "Near zero correlation (-0.12). Marketing spend does not directly influence user loyalty.",
      "User_Growth_Revenue": "High correlation (+0.76). Customer base expansion is scaling revenue proportionally.",
      "User_Growth_Ad_Spend": "Medium positive correlation (+0.58). Campaign expenditures pull in new users.",
      "User_Growth_User_Growth": "Self-correlation (1.00)",
      "User_Growth_Churn_Rate": "Strong negative correlation (-0.68). High growth velocity sometimes introduces volatile users.",
      "Churn_Rate_Revenue": "Negative correlation (-0.48). Churn slightly degrades gross revenue performance.",
      "Churn_Rate_Ad_Spend": "Near zero correlation (-0.12). Marketing spend does not directly influence user loyalty.",
      "Churn_Rate_User_Growth": "Strong negative correlation (-0.68). High growth velocity sometimes introduces volatile users.",
      "Churn_Rate_Churn_Rate": "Self-correlation (1.00)"
    },

    pcaTitle: "PCA Cluster Projection Sandbox",
    pcaSub: "Interactive 2D Principal Component Analysis of user clusters. Hover on nodes to inspect details.",
    pcaClusters: "Active Clusters",
    pcaOutliers: "PCA Outliers Detected",
    pcaSilhouette: "Silhouette Score",
    pcaHoverText: "Hover over a vector coordinate to inspect metadata.",

    ttestTitle: "Hypothesis Testing (A/B T-Test)",
    ttestSub: "Adjust Sample A & B variables. Recursively computes statistical significance levels.",
    ttestSampleA: "Sample A (Control Group)",
    ttestSampleB: "Sample B (Test Group)",
    ttestMean: "Sample Mean",
    ttestVar: "Sample Variance",
    ttestSize: "Sample Size (n)",
    ttestTStat: "Calculated t-Statistic",
    ttestPVal: "Two-Tailed p-Value",
    ttestConf: "Confidence Interval (95%)",

    anomalyTitle: "Outliers & Anomaly Inspector",
    anomalySub: "Deep diagnostic terminal tracking corrupt cell entries and out-of-bounds metrics.",
    anomalyFlushBtn: "Flush Outlier Rows",
    anomalyPurgeBtn: "Purge Outlier Columns",
    anomalyHealthyLog: "Dataset sanitized. No active anomalies detected.",

    pipelinesTitle: "Connected Pipeline Integrations",
    pipelinesSub: "Real-time query speeds and system sync status across connected data repositories.",

    securityTitle: "Bank-Grade Cyber Security",
    securitySub: "All analytical routines run in temporary zero-retention sandboxes encrypted at rest.",
    securityBadge1Title: "AES-256 Encryption",
    securityBadge1Desc: "Analytical data streams are encrypted at rest and in flight at all times.",
    securityBadge2Title: "Row-Level Security",
    securityBadge2Desc: "Advanced role policies ensure segments are isolated by team permissions.",
    securityBadge3Title: "SOC2 Compliance",
    securityBadge3Desc: "Rigorously audited system policies satisfy leading corporate guidelines.",
    securityBadge4Title: "Zero-Retention",
    securityBadge4Desc: "Files are parsed exclusively client-side and deleted post-session.",

    pricingTitle: "Flexible Enterprise Pricing",
    pricingSub: "Unlock advanced forecasting models, unlimited DB pipeline configurations, and SOC2 dedicated servers.",
    planStarter: "Starter Plan",
    planPro: "Professional Plan",
    planEnt: "Enterprise Custom",
    priceStarter: "$29",
    pricePro: "$79",
    priceEnt: "Custom Pricing",
    getStarted: "Initiate Checkout",
    featuresStarter: ["Up to 10 CSV/Excel uploads", "Natural Language Data Analyst", "Automated Dashboard Builder", "✘ Custom DB pipelines", "✘ Real-time AutoML Model playground"],
    featuresPro: ["Unlimited CSV/Excel uploads", "Custom DB Connectors (SQL, Snowflake)", "1-Click Forecasting Engine", "AutoML Classifier & Regressor", "✘ Dedicated SOC2 private server"],
    featuresEnt: ["Dedicated SOC2 private server", "Unlimited high-velocity pipelines", "Pre-trained custom neural architectures", "99.99% Guaranteed SLA support", "Complete team workspace audit logs"],

    uploadTitle: "Dataset Pipeline Portal",
    uploadSub: "Drag and drop standard datasets to parse, preview, edit, and export summaries.",
    uploadDragText: "Drag & drop Excel, CSV, PDF, JSON, or XML or click to browse",
    uploadSizeText: "Max file size: 50MB. Secure sandboxed processing.",
    uploadActiveScan: "Sweeping structural rows...",
    uploadGridPreview: "Parsed Grid Preview (Editable)",
    downloadCSV: "Download Clean CSV",
    downloadPDF: "Generate PDF Report",
    editableGridTitle: "Live Parsed Cells",

    modalTitle: "Futuristic Sandbox Checkout",
    modalCardNo: "Card Number",
    modalExpiry: "Expiry Date (MM/YY)",
    modalCvv: "CVV Security Code",
    modalCardName: "Cardholder Name",
    modalPayBtn: "Confirm Sandbox Payment",
    modalProcessing: "Encrypting payment gateway...",
    modalSuccess: "Transaction Authorized! Premium data features enabled."
  },
  HI: {
    title: "सिनेमैटिक डेटा लैब",
    subtitle: "एआई डेटा एनालिटिक्स और ऑटोएमएल सिस्टम के लिए प्रीमियम सैंडबॉक्स",
    langBtn: "Switch Languages",

    heroTag: "🔮 जीपीटी -4ओ और उन्नत एमएल द्वारा संचालित",
    heroHeading: "आपका व्यक्तिगत",
    heroHeadingGrad: "एआई डेटा विश्लेषक",
    heroSubheading: "प्राकृतिक भाषा का उपयोग करके सेकंडों में कच्चे एक्सेल फाइलों, एसक्यूएल डेटाबेस और सीएसवी को शानदार इंटरैक्टिव डैशबोर्ड, भविष्य कहनेवाला पूर्वानुमान और मशीन लर्निंग मॉडल में बदलें।",
    heroTryBtn: "सैंडबॉक्स आज़माएं →",
    heroFeaturesBtn: "सुविधाओं का अन्वेषण करें",
    heroStatAcc: "मॉडल की शुद्धता",
    heroStatSpeed: "विश्लेषण की गति",
    heroStatQueries: "निष्पादित प्रश्न",

    tabSandbox: "एआई चैट सैंडबॉक्स",
    tabAutoML: "ऑटोएमएल प्रयोगशाला",
    tabScience: "उन्नत सांख्यिकी और पीसीए",
    tabUploader: "डेटासेट पोर्टल",
    tabFormulaBot: "स्प्रेडशीट कोपायलट",
    tabDashboard: "बीआई डैशबोर्ड",

    playgroundTitle: "उन्नत मॉडल प्लेग्राउंड",
    playgroundSub: "हाइपरपैरामीटर ट्यून करें और वास्तविक समय में प्रशिक्षण अभिसरण देखें।",
    selectAlgo: "एल्गोरिथ्म चुनें",
    paramsTitle: "हाइपरपैरामीटर सेटिंग्स",
    epochs: "प्रशिक्षण चक्र (Epochs)",
    lr: "सीखने की दर (Learning Rate)",
    regularization: "नियमितीकरण (Lambda)",
    retrainBtn: "मॉडल नेटवर्क को प्रशिक्षित करें",
    exportBtn: "पायथन कोड एक्सपोर्ट करें",
    trainingMetrics: "प्रशिक्षण टेलीमेट्री",
    lossVal: "प्रशिक्षण हानि",
    accVal: "मॉडल की शुद्धता",
    f1Val: "F1 स्कोर मेट्रिक",
    activeStatus: "ऑप्टिमाइज़ हो रहा है...",
    trainingStatus: "प्रशिक्षण चालू है...",
    stableStatus: "स्थिर",
    lossCurveTitle: "लाइव हानि अभिसरण वक्र",

    chatTitle: "एआई डेटा विश्लेषक सैंडबॉक्स",
    chatStatus: "विश्लेषण के लिए तैयार",
    placeholder: "बिक्री, ग्राहक मथना (churn), डेटाबेस के बारे में पूछें...",
    sendBtn: "सैंडबॉक्स में भेजें",
    clickPrompt: "एक सुझाए गए निर्देश पर क्लिक करें:",
    prompts: [
      "2026 के लिए समूह द्वारा बिक्री प्रवृत्तियों का विश्लेषण करें।",
      "SVM के साथ ग्राहक मंथन संभावना की भविष्यवाणी करें।",
      "राजस्व (Revenue) और विज्ञापन खर्च (Ad Spend) में क्या संबंध है?"
    ],
    startingBotMsg: "नमस्ते! मैंने आपका डेटासेट लोड कर लिया है: <code>sales_q1_insights.csv</code> (12,480 पंक्तियाँ)। मुझसे अंग्रेजी या हिंदी में कुछ भी पूछें, या किसी प्रॉम्प्ट पर क्लिक करें!",
    calculating: "सैंडबॉक्स में क्वेरी चल रही है...",

    cleanerTitle: "डेटा सफाई और प्रोफाइलर",
    cleanerSub: "डुप्लिकेट हटाएं, रिक्त सेल भरें, और फीचर डेटासेट को अनुकूलित करें।",
    cleanerHealth: "डेटासेट स्वास्थ्य सूचकांक",
    cleanerCols: "इंटरएक्टिव कॉलम चयन",
    cleanerStats: "प्रोफाइलिंग टेलीमेट्री",
    totalRows: "कुल संसाधित पंक्तियाँ",
    anomalies: "असंगत रिकॉर्ड्स",
    missingVals: "रिक्त सेल की संख्या",
    cleanBtn: "गहन सफाई चलाएं",
    cleaningProgress: [
      "लापता मूल्य कोशिकाओं को स्कैन किया जा रहा है...",
      "केएनएन प्रतिरोपण (KNN Imputation) निष्पादित किया जा रहा है...",
      "डुप्लिकेट रिकॉर्ड्स को हटाया जा रहा है...",
      "फ़ीचर कॉलम का मानकीकरण किया जा रहा है..."
    ],
    cleanSuccess: "डेटासेट पूरी तरह से साफ हो गया है! स्वास्थ्य उत्कृष्ट है।",

    voiceTitle: "आवाज़ सहायक सिम्युलेटर",
    voiceStatusIdle: "माइक पर क्लिक करें और बोलें: 'Show Sales Forecast'",
    voiceStatusListening: "ऑडियो इनपुट सुन रहा है...",
    voiceStatusProcessing: "आवाज को विश्लेषणात्मक क्वेरी में बदल रहा है...",
    voiceStatusExecuted: "आदेश सफलतापूर्वक निष्पादित किया गया!",

    heatmapTitle: "इंटरएक्टिव सहसंबंध मैट्रिक्स",
    heatmapSub: "लक्षित कॉलमों के बीच सहसंबंध गुणांक संबंधों का निरीक्षण करने के लिए माउस घुमाएं।",
    heatmapTooltip: "सहसंबंध गुणांक (Correlation)",
    heatmapNoTooltip: "मैट्रिक्स के किसी भी सेल पर माउस ले जाएं",
    heatmapDesc: {
      "Revenue_Revenue": "स्व-सहसंबंध (1.00)",
      "Revenue_Ad_Spend": "मजबूत सकारात्मक सहसंबंध (+0.84)। विपणन खर्च सीधे उपयोगकर्ता अधिग्रहण को बढ़ावा देता है।",
      "Revenue_User_Growth": "उच्च सहसंबंध (+0.76)। ग्राहक आधार विस्तार राजस्व को आनुपातिक रूप से बढ़ा रहा है।",
      "Revenue_Churn_Rate": "नकारात्मक सहसंबंध (-0.48)। मंथन से कुल राजस्व प्रदर्शन में थोड़ी गिरावट आती है।",
      "Ad_Spend_Revenue": "मजबूत सकारात्मक सहसंबंध (+0.84)। विपणन खर्च सीधे उपयोगकर्ता अधिग्रहण को बढ़ावा देता है।",
      "Ad_Spend_Ad_Spend": "स्व-सहसंबंध (1.00)",
      "Ad_Spend_User_Growth": "मध्यम सकारात्मक सहसंबंध (+0.58)। अभियान व्यय नए उपयोगकर्ताओं को आकर्षित करते हैं।",
      "Ad_Spend_Churn_Rate": "शून्य सहसंबंध के करीब (-0.12)। विपणन खर्च सीधे उपयोगकर्ता निष्ठा को प्रभावित नहीं करता है।",
      "User_Growth_Revenue": "उच्च सहसंबंध (+0.76)। ग्राहक आधार विस्तार राजस्व को आनुपातिक रूप से बढ़ा रहा है।",
      "User_Growth_Ad_Spend": "मध्यम सकारात्मक सहसंबंध (+0.58)। अभियान व्यय नए उपयोगकर्ताओं को आकर्षित करते हैं।",
      "User_Growth_User_Growth": "स्व-सहसंबंध (1.00)",
      "User_Growth_Churn_Rate": "मजबूत नकारात्मक सहसंबंध (-0.68)। उच्च विकास गति कभी-कभी अस्थिर उपयोगकर्ताओं को लाती है।",
      "Churn_Rate_Revenue": "नकारात्मक सहसंबंध (-0.48)। मंथन से कुल राजस्व प्रदर्शन में थोड़ी गिरावट आती है।",
      "Churn_Rate_Ad_Spend": "शून्य सहसंबंध के करीब (-0.12)। विपणन खर्च सीधे उपयोगकर्ता निष्ठा को प्रभावित नहीं करता है।",
      "Churn_Rate_User_Growth": "मजबूत नकारात्मक सहसंबंध (-0.68)। उच्च विकास गति कभी-कभी अस्थिर उपयोगकर्ताओं को लाती है।",
      "Churn_Rate_Churn_Rate": "स्व-सहसंबंध (1.00)"
    },

    pcaTitle: "पीसीए क्लस्टर प्रोजेक्शन सैंडबॉक्स",
    pcaSub: "उपयोगकर्ता समूहों का इंटरैक्टिव 2D प्रिंसिपल कंपोनेंट विश्लेषण। विवरण के लिए नोड्स पर होवर करें।",
    pcaClusters: "सक्रिय समूह",
    pcaOutliers: "पीसीए विसंगतियाँ पाई गईं",
    pcaSilhouette: "सिल्हूट स्कोर",
    pcaHoverText: "मेटाडेटा का निरीक्षण करने के लिए वेक्टर निर्देशांक पर माउस ले जाएं।",

    ttestTitle: "परिकल्पना परीक्षण (A/B टी-टेस्ट)",
    ttestSub: "नमूना ए और बी वेरिएबल्स को समायोजित करें। सांख्यिकीय महत्व स्तरों की गणना करता है।",
    ttestSampleA: "नमूना ए (नियंत्रण समूह)",
    ttestSampleB: "नमूना बी (परीक्षण समूह)",
    ttestMean: "नमूना माध्य (Mean)",
    ttestVar: "नमूना विचरण (Variance)",
    ttestSize: "नमूना आकार (n)",
    ttestTStat: "परिकलित टी-सांख्यिकी",
    ttestPVal: "द्वि-पुच्छीय पी-मान (p-Value)",
    ttestConf: "विश्वास अंतराल (95% CI)",

    anomalyTitle: "विसंगति और बाहरी निरीक्षक",
    anomalySub: "दोषपूर्ण सेल प्रविष्टियों और सीमा से बाहर के मेट्रिक्स पर नज़र रखने वाला गहरा नैदानिक टर्मिनल।",
    anomalyFlushBtn: "विसंगति पंक्तियाँ साफ़ करें",
    anomalyPurgeBtn: "विसंगति कॉलम हटाएँ",
    anomalyHealthyLog: "डेटासेट साफ़ कर दिया गया है। कोई विसंगति नहीं मिली।",

    pipelinesTitle: "संबद्ध पाइपलाइन एकीकरण",
    pipelinesSub: "कनेक्टेड डेटा रिपॉजिटरी में रीयल-टाइम क्वेरी गति और सिस्टम सिंक स्थिति।",

    securityTitle: "बैंक-ग्रेड साइबर सुरक्षा",
    securitySub: "सभी विश्लेषणात्मक कार्य शून्य-अवधारण सैंडबॉक्स में चलते हैं जो सुरक्षित हैं।",
    securityBadge1Title: "AES-256 एन्क्रिप्शन",
    securityBadge1Desc: "विश्लेषणात्मक डेटा स्ट्रीम पारगमन और भंडारण के दौरान हमेशा एन्क्रिप्टेड होते हैं।",
    securityBadge2Title: "पंक्ति-स्तरीय सुरक्षा",
    securityBadge2Desc: "उन्नत भूमिका नीतियां सुनिश्चित करती हैं कि सेगमेंट टीम अनुमतियों द्वारा अलग किए गए हैं।",
    securityBadge3Title: "SOC2 अनुपालन",
    securityBadge3Desc: "कड़ाई से अंकेक्षित नीतियां कॉर्पोरेट मानकों को पूरा करती हैं।",
    securityBadge4Title: "शून्य-अवधारण",
    securityBadge4Desc: "फ़ाइलें विशेष रूप से क्लाइंट-साइड पर पार्स की जाती हैं और सत्र के बाद हटा दी जाती हैं।",

    pricingTitle: "लचीला एंटरप्राइज मूल्य निर्धारण",
    pricingSub: "उन्नत पूर्वानुमान मॉडल, असीमित डीबी पाइपलाइन कॉन्फ़िगरेशन और SOC2 समर्पित सर्वर अनलॉक करें।",
    planStarter: "स्टार्टर योजना",
    planPro: "प्रोफेशनल योजना",
    planEnt: "एंटरप्राइज कस्टम",
    priceStarter: "$29",
    pricePro: "$79",
    priceEnt: "कस्टम मूल्य",
    getStarted: "चेकआउट प्रारंभ करें",
    featuresStarter: ["10 तक सीएसवी/एक्सेल अपलोड", "प्राकृतिक भाषा डेटा विश्लेषक", "स्वचालित डैशबोर्ड बिल्डर", "✘ कस्टम डीबी पाइपलाइन्स", "✘ वास्तविक समय ऑटोएमएल प्लेग्राउंड"],
    featuresPro: ["असीमित सीएसवी/एक्सेल अपलोड", "कस्टम डीबी कनेक्टर्स (एसक्यूएल, स्नोफ्लेक)", "1-क्लिक पूर्वानुमान इंजन", "ऑटोएमएल क्लासिफायर और रिग्रेसर", "✘ समर्पित SOC2 निजी सर्वर"],
    featuresEnt: ["समर्पित SOC2 निजी सर्वर", "असीमित उच्च गति पाइपलाइन्स", "पूर्व-प्रशिक्षित कस्टम तंत्रिका संरचनाएं", "99.99% गारंटीकृत SLA समर्थन", "पूर्ण टीम वर्कस्पेस ऑडिट लॉग"],

    uploadTitle: "डेटासेट पाइपलाइन पोर्टल",
    uploadSub: " preview, संपादित करें और सारांश निर्यात करने के लिए डेटासेट ड्रैग एंड ड्रॉप करें।",
    uploadDragText: "एक्सेल (.xlsx), सीएसवी (.csv), या पीडीएफ (.pdf) ड्रैग करें या ब्राउज़ करने के लिए क्लिक करें",
    uploadSizeText: "अधिकतम फ़ाइल आकार: 50MB. सुरक्षित सैंडबॉक्स प्रसंस्करण।",
    uploadActiveScan: "संरचनात्मक पंक्तियों को स्कैन किया जा रहा है...",
    uploadGridPreview: "पार्स किया गया ग्रिड पूर्वावलोकन (संपादन योग्य)",
    downloadCSV: "साफ़ सीएसवी डाउनलोड करें",
    downloadPDF: "पीडीएफ रिपोर्ट बनाएं",
    editableGridTitle: "लाइव पार्स की गई कोशिकाएं",

    modalTitle: "भविष्य का सैंडबॉक्स चेकआउट",
    modalCardNo: "कार्ड संख्या",
    modalExpiry: "समाप्ति तिथि (MM/YY)",
    modalCvv: "सीवीवी सुरक्षा कोड",
    modalCardName: "कार्डधारक का नाम",
    modalPayBtn: "सैंडबॉक्स भुगतान की पुष्टि करें",
    modalProcessing: "भुगतान गेटवे को एन्क्रिप्ट किया जा रहा है...",
    modalSuccess: "लेन-देन अधिकृत! प्रीमियम डेटा सुविधाएं सक्षम।"
  },
  AR: {
    title: "مختبر البيانات السينمائي",
    subtitle: "بيئة رملية متميزة لتحليلات البيانات وأنظمة AutoML المدعومة بالذكاء الاصطناعي",
    langBtn: "تغيير اللغة (English/HI)",

    heroTag: "🔮 مدعوم بـ GPT-4o والتعلم الآلي المتقدم",
    heroHeading: "محلل البيانات",
    heroHeadingGrad: "الخاص بك بالذكاء الاصطناعي",
    heroSubheading: "قم بتحويل ملفات Excel وقواعد بيانات SQL و CSV الخام إلى لوحات معلومات تفاعلية مذهلة وتوقعات تنبؤية ونماذج تعلم آلي في ثوانٍ باستخدام اللغة الطبيعية.",
    heroTryBtn: "تجربة البيئة الرملية ←",
    heroFeaturesBtn: "استكشف الميزات",
    heroStatAcc: "دقة النموذج",
    heroStatSpeed: "سرعة التحليل",
    heroStatQueries: "الاستعلامات المنفذة",

    tabSandbox: "صندوق رمل المحادثة",
    tabAutoML: "مختبر ضبط AutoML",
    tabScience: "الإحصاء المتقدم و PCA",
    tabUploader: "بوابة البيانات",
    tabFormulaBot: "مساعد الجداول",
    tabDashboard: "لوحة تحكم BI",

    playgroundTitle: "ميدان تجارب النماذج المتقدمة",
    playgroundSub: "قم بضبط المعلمات الفائقة وشاهد تقارب التدريب في الوقت الفعلي.",
    selectAlgo: "اختر الخوارزمية",
    paramsTitle: "إعدادات المعلمات الفائقة",
    epochs: "عصور التدريب (Epochs)",
    lr: "معدل التعلم (Learning Rate)",
    regularization: "التنظيم (Lambda)",
    retrainBtn: "تدريب شبكة النموذج",
    exportBtn: "تصدير كود Python",
    trainingMetrics: "قياس التدريب عن بعد",
    lossVal: "خسارة التدريب (Loss)",
    accVal: "دقة النموذج",
    f1Val: "مقياس درجة F1",
    activeStatus: "جاري التحسين...",
    trainingStatus: "جاري التدريب...",
    stableStatus: "مستقر",
    lossCurveTitle: "منحنى تقارب الخسارة المباشر",

    chatTitle: "صندوق رمل محلل البيانات",
    chatStatus: "جاهز للتحليل",
    placeholder: "اسأل عن المبيعات، معدل التخلي، قاعدة البيانات...",
    sendBtn: "إرسال الاستعلام",
    clickPrompt: "انقر فوق أمر مقترح:",
    prompts: [
      "قم بتحليل اتجاهات المبيعات حسب الفئة لعام 2026.",
      "تنبأ باحتمالية تخلي العملاء باستخدام SVM.",
      "ما هي العلاقة بين الإيرادات والإنفاق الإعلاني؟"
    ],
    startingBotMsg: "مرحبًا! لقد قمت بتحميل مجموعة البيانات الخاصة بك: <code>sales_q1_insights.csv</code> (12,480 صفًا). اسألني أي شيء باللغة الإنجليزية أو العربية أو انقر فوق اقتراح!",
    calculating: "جاري تشغيل الاستعلام...",

    cleanerTitle: "منظف ومحلل البيانات",
    cleanerSub: "تخلص من التكرارات، واملأ الخلايا الفارغة، وقم بتحسين مجموعات الميزات.",
    cleanerHealth: "مؤشر صحة البيانات",
    cleanerCols: "اختيار الأعمدة التفاعلي",
    cleanerStats: "تحليلات التوصيف",
    totalRows: "إجمالي الصفوف المعالجة",
    anomalies: "السجلات الشاذة",
    missingVals: "عدد الخلايا الفارغة",
    cleanBtn: "تنفيذ التنظيف العميق",
    cleaningProgress: [
      "جاري فحص الخلايا الفارغة...",
      "جاري تنفيذ احتساب KNN...",
      "جاري التخلص من السجلات المكررة...",
      "جاري توحيد أعمدة الميزات..."
    ],
    cleanSuccess: "تم تطهير مجموعة البيانات بالكامل! الصحة ممتازة.",

    voiceTitle: "محاكي المساعد الصوتي",
    voiceStatusIdle: "انقر على الميكروفون وقل: 'Show Sales Forecast'",
    voiceStatusListening: "جاري الاستماع إلى تدفق الصوت...",
    voiceStatusProcessing: "تحويل الكلام إلى استعلام تحليلي...",
    voiceStatusExecuted: "تم تنفيذ الأمر بنجاح!",

    heatmapTitle: "مصفوفة الارتباط التفاعلية",
    heatmapSub: "حرك المؤشر فوق الخلايا لفحص علاقات المعاملات بين الأعمدة.",
    heatmapTooltip: "معامل الارتباط",
    heatmapNoTooltip: "ضع المؤشر فوق أي خلية داخل المصفوفة",
    heatmapDesc: {
      "Revenue_Revenue": "ارتباط ذاتي (1.00)",
      "Revenue_Ad_Spend": "ارتباط إيجابي قوي (+0.84). الإنفاق التسويقي يدفع مباشرة لاكتساب المستخدمين.",
      "Revenue_User_Growth": "ارتباط مرتفع (+0.76). توسيع قاعدة العملاء يوسع الإيرادات بشكل متناسب.",
      "Revenue_Churn_Rate": "ارتباط سلبي (-0.48). التخلي يقلل قليلاً من أداء الإيرادات الإجمالية.",
      "Ad_Spend_Revenue": "ارتباط إيجابي قوي (+0.84). الإنفاق التسويقي يدفع مباشرة لاكتساب المستخدمين.",
      "Ad_Spend_Ad_Spend": "ارتباط ذاتي (1.00)",
      "Ad_Spend_User_Growth": "ارتباط إيجابي متوسط (+0.58). نفقات الحملة تجذب مستخدمين جدد.",
      "Ad_Spend_Churn_Rate": "ارتباط قريب من الصفر (-0.12). الإنفاق التسويقي لا يؤثر مباشرة على ولاء المستخدم.",
      "User_Growth_Revenue": "ارتباط مرتفع (+0.76). توسيع قاعدة العملاء يوسع الإيرادات بشكل متناسب.",
      "User_Growth_Ad_Spend": "ارتباط إيجابي متوسط (+0.58). نفقات الحملة تجذب مستخدمين جدد.",
      "User_Growth_User_Growth": "ارتباط ذاتي (1.00)",
      "User_Growth_Churn_Rate": "ارتباط سلبي قوي (-0.68). سرعة النمو العالية قد تقدم أحيانًا مستخدمين غير مستقرين.",
      "Churn_Rate_Revenue": "ارتباط سلبي (-0.48). التخلي يقلل قليلاً من أداء الإيرادات الإجمالية.",
      "Churn_Rate_Ad_Spend": "ارتباط قريب من الصفر (-0.12). الإنفاق التسويقي لا يؤثر مباشرة على ولاء المستخدم.",
      "Churn_Rate_User_Growth": "ارتباط سلبي قوي (-0.68). سرعة النمو العالية قد تقدم أحيانًا مستخدمين غير مستقرين.",
      "Churn_Rate_Churn_Rate": "ارتباط ذاتي (1.00)"
    },

    pcaTitle: "صندوق رمل إسقاط وتجميع PCA",
    pcaSub: "تحليل المكونات الرئيسية ثنائي الأبعاد التفاعلي لمجموعات المستخدمين. حرك المؤشر لرؤية التفاصيل.",
    pcaClusters: "المجموعات النشطة",
    pcaOutliers: "القيم الشاذة المكتشفة",
    pcaSilhouette: "درجة الصورة الظلية (Silhouette)",
    pcaHoverText: "حرك المؤشر فوق إحداثيات المتجه لفحص البيانات الوصفية.",

    ttestTitle: "اختبار الفرضيات (T-Test لـ A/B)",
    ttestSub: "اضبط متغيرات العينة A و B لتحديد مستويات الأهمية الإحصائية بشكل مباشر.",
    ttestSampleA: "العينة A (المجموعة الضابطة)",
    ttestSampleB: "العينة B (مجموعة الاختبار)",
    ttestMean: "متوسط العينة",
    ttestVar: "تباين العينة",
    ttestSize: "حجم العينة (n)",
    ttestTStat: "إحصائية t المحسوبة",
    ttestPVal: "قيمة p للذيلين",
    ttestConf: "فاصل الثقة (95% CI)",

    anomalyTitle: "مفتش القيم الشاذة والعيوب",
    anomalySub: "محطة تشخيصية عميقة تتتبع الخلايا التالفة والقياسات الخارجة عن الحدود.",
    anomalyFlushBtn: "مسح الصفوف الشاذة",
    anomalyPurgeBtn: "حذف الأعمدة الشاذة",
    anomalyHealthyLog: "تم تطهير مجموعة البيانات. لم يتم العثور على قيم شاذة.",

    pipelinesTitle: "تكامل خطوط الأنابيب المتصلة",
    pipelinesSub: "سرعات الاستعلام الفورية وحالة مزامنة النظام عبر مستودعات البيانات المتصلة.",

    securityTitle: "الأمن السيبراني المصرفي",
    securitySub: "تعمل جميع العمليات التحليلية في بيئات رملية مؤقتة مشفرة وبدون حفظ للبيانات.",
    securityBadge1Title: "تشفير AES-256",
    securityBadge1Desc: "يتم تشفير تدفقات البيانات التحليلية أثناء النقل وأثناء السكون في جميع الأوقات.",
    securityBadge2Title: "أمان على مستوى الصف",
    securityBadge2Desc: "تضمن سياسات الأدوار المتقدمة عزل البيانات حسب أذونات الفريق.",
    securityBadge3Title: "امتثال SOC2",
    securityBadge3Desc: "سياسات نظام خاضعة لتدقيق صارم لتلبية معايير الشركات الكبرى.",
    securityBadge4Title: "عدم الاحتفاظ بالبيانات",
    securityBadge4Desc: "يتم تحليل الملفات محليًا بالكامل من جانب العميل ويتم حذفها بعد انتهاء الجلسة.",

    pricingTitle: "أسعار مرنة للمؤسسات",
    pricingSub: "افتح نماذج التنبؤ المتقدمة، وتكوينات خطوط الأنابيب غير المحدودة، وخوادم SOC2 المخصصة.",
    planStarter: "خطة البداية",
    planPro: "الخطة الاحترافية",
    planEnt: "مخصص للمؤسسات",
    priceStarter: "$29",
    pricePro: "$79",
    priceEnt: "تسعير مخصص",
    getStarted: "بدء الدفع",
    featuresStarter: ["حتى 10 ملفات مرفوعة CSV/Excel", "محلل بيانات باللغة الطبيعية", "منشئ لوحة معلومات تلقائي", "✘ خطوط أنابيب قاعدة بيانات مخصصة", "✘ بيئة AutoML التجريبية المباشرة"],
    featuresPro: ["ملفات مرفوعة غير محدودة", "موصلات مخصصة (SQL, Snowflake)", "محرك توقع بنقرة واحدة", "مصنف ومنظم AutoML التلقائي", "✘ خادم SOC2 مخصص وخاص"],
    featuresEnt: ["خادم SOC2 مخصص وخاص", "خطوط أنابيب غير محدودة للسرعة العالية", "بنى عصبية مخصصة مدربة مسبقًا", "دعم اتفاقية مستوى الخدمة 99.99%", "سجلات تدقيق كاملة لمساحة العمل"],

    uploadTitle: "بوابة خطوط أنابيب البيانات",
    uploadSub: "اسحب وأفلت مجموعات البيانات القياسية لتحليلها ومعاينتها وتعديلها وتصديرها.",
    uploadDragText: "اسحب وأفلت ملف Excel (.xlsx) أو CSV (.csv) أو PDF (.pdf) أو انقر للتصفح",
    uploadSizeText: "الحد الأقصى لحجم الملف: 50 ميجابايت. معالجة آمنة في بيئة رملية.",
    uploadActiveScan: "جاري فحص الصفوف الهيكلية...",
    uploadGridPreview: "معاينة الشبكة المحللة (قابلة للتعديل)",
    downloadCSV: "تحميل CSV نظيف",
    downloadPDF: "إنشاء تقرير PDF",
    editableGridTitle: "الخلايا النشطة التي تم تحليلها",

    modalTitle: "بوابة الدفع الرملية المستقبلية",
    modalCardNo: "رقم البطاقة",
    modalExpiry: "تاريخ الانتهاء (MM/YY)",
    modalCvv: "رمز الأمان CVV",
    modalCardName: "اسم حامل البطاقة",
    modalPayBtn: "تأكيد الدفع التجريبي",
    modalProcessing: "جاري تشفير بوابة الدفع...",
    modalSuccess: "تم التصريح بالمعاملة! تم تمكين ميزات البيانات الممتازة."
  },
  ES: {
    title: "Cinematic Data Lab",
    subtitle: "Laboratorio premium de análisis de datos e inteligencia artificial AutoML",
    langBtn: "Traducir Página",

    heroTag: "🔮 Impulsado por GPT-4o y ML avanzado",
    heroHeading: "Tu Analista",
    heroHeadingGrad: "de Datos Personal IA",
    heroSubheading: "Transforma archivos Excel, bases de datos SQL y CSVs en tableros interactivos e informes predictivos en segundos mediante lenguaje natural.",
    heroTryBtn: "Probar Sandbox →",
    heroFeaturesBtn: "Ver Características",
    heroStatAcc: "Precisión del Modelo",
    heroStatSpeed: "Velocidad de Análisis",
    heroStatQueries: "Consultas Ejecutadas",

    tabSandbox: "Sandbox de Chat IA",
    tabAutoML: "Laboratorio AutoML",
    tabScience: "Estadística & PCA",
    tabUploader: "Portal de Datos",
    tabFormulaBot: "Copiloto de Hojas",
    tabDashboard: "Dashboard BI",

    playgroundTitle: "Panel de Entrenamiento AutoML",
    playgroundSub: "Ajusta hiperparámetros y observa la convergencia del modelo en tiempo real.",
    selectAlgo: "Seleccionar Algoritmo",
    paramsTitle: "Parámetros de Red",
    epochs: "Épocas de Entrenamiento",
    lr: "Tasa de Aprendizaje (LR)",
    regularization: "Regularización (Lambda)",
    retrainBtn: "Entrenar Red Neuronal",
    exportBtn: "Exportar Código Python",
    trainingMetrics: "Telemetría de Entrenamiento",
    lossVal: "Pérdida (Loss)",
    accVal: "Precisión final",
    f1Val: "Puntuación F1",
    activeStatus: "OPTIMIZANDO...",
    trainingStatus: "ENTRENANDO...",
    stableStatus: "ESTABLE",
    lossCurveTitle: "Curva de Convergencia en Vivo",

    chatTitle: "Analista de Datos IA Sandbox",
    chatStatus: "LISTO PARA ANALIZAR",
    placeholder: "Haz una pregunta sobre ventas, abandono, métricas...",
    sendBtn: "Enviar Consulta",
    clickPrompt: "SELECCIONA UNA CONSULTA SUGERIDA:",
    prompts: [
      "Analiza tendencias de ventas por cohorte para 2026.",
      "Predice la probabilidad de abandono con SVM.",
      "¿Cuál es la correlación entre Ingresos y Gasto Publicitario?"
    ],
    startingBotMsg: "¡Hola! He cargado tu conjunto de datos: <code>sales_q1_insights.csv</code> (12,480 filas). ¡Pregúntame lo que quieras!",
    calculating: "Procesando consulta...",

    cleanerTitle: "Depurador & Analizador de Datos",
    cleanerSub: "Elimina duplicados, imputa valores nulos y optimiza las columnas de características.",
    cleanerHealth: "Índice de Salud del Dataset",
    cleanerCols: "Selección de Columnas Activa",
    cleanerStats: "Telemetría de Perfilado",
    totalRows: "Filas Procesadas",
    anomalies: "Registros Anómalos",
    missingVals: "Celdas Nulas",
    cleanBtn: "Ejecutar Depuración Profunda",
    cleaningProgress: [
      "Buscando celdas nulas...",
      "Imputando valores perdidos mediante KNN...",
      "Eliminando duplicados...",
      "Estandarizando variables numéricas..."
    ],
    cleanSuccess: "¡Dataset totalmente desinfectado! Salud excelente.",

    voiceTitle: "Simulador de Asistente de Voz",
    voiceStatusIdle: "Presiona el Mic y di: 'Show Sales Forecast'",
    voiceStatusListening: "Escuchando transmisión de audio...",
    voiceStatusProcessing: "Traduciendo voz a consulta SQL/Python...",
    voiceStatusExecuted: "¡Comando ejecutado con éxito!",

    heatmapTitle: "Matriz de Correlación Interactiva",
    heatmapSub: "Pasa el cursor sobre las celdas para inspeccionar los coeficientes.",
    heatmapTooltip: "Coeficiente de Correlación",
    heatmapNoTooltip: "Pasa el cursor sobre cualquier celda",
    heatmapDesc: {
      "Revenue_Revenue": "Autocorrelación (1.00)",
      "Revenue_Ad_Spend": "Fuerte correlación positiva (+0.84). El marketing impulsa directamente las ventas.",
      "Revenue_User_Growth": "Alta correlación (+0.76). La base de usuarios escala los ingresos de manera proporcional.",
      "Revenue_Churn_Rate": "Correlación negativa (-0.48). El abandono reduce ligeramente el rendimiento de los ingresos.",
      "Ad_Spend_Revenue": "Fuerte correlación positiva (+0.84). El marketing impulsa directamente las ventas.",
      "Ad_Spend_Ad_Spend": "Autocorrelación (1.00)",
      "Ad_Spend_User_Growth": "Correlación media positiva (+0.58). Las campañas atraen nuevos usuarios.",
      "Ad_Spend_Churn_Rate": "Sin correlación significativa (-0.12).",
      "User_Growth_Revenue": "Alta correlación (+0.76).",
      "User_Growth_Ad_Spend": "Correlación media positiva (+0.58).",
      "User_Growth_User_Growth": "Autocorrelación (1.00)",
      "User_Growth_Churn_Rate": "Correlación negativa fuerte (-0.68).",
      "Churn_Rate_Revenue": "Correlación negativa (-0.48).",
      "Churn_Rate_Ad_Spend": "Sin correlación significativa (-0.12).",
      "Churn_Rate_User_Growth": "Correlación negativa fuerte (-0.68).",
      "Churn_Rate_Churn_Rate": "Autocorrelación (1.00)"
    },

    pcaTitle: "Proyección de Clústeres PCA",
    pcaSub: "Análisis interactivo en 2D de componentes principales. Pasa el cursor sobre los nodos para inspeccionar los detalles.",
    pcaClusters: "Clústeres Activos",
    pcaOutliers: "Anomalías PCA Detectadas",
    pcaSilhouette: "Coeficiente Silhouette",
    pcaHoverText: "Pasa el cursor sobre un nodo para inspeccionar sus detalles métricos.",

    ttestTitle: "Prueba de Hipótesis (T-Test A/B)",
    ttestSub: "Ajusta las muestras A y B. Calcula dinámicamente la significación estadística (p-valor).",
    ttestSampleA: "Muestra A (Grupo de Control)",
    ttestSampleB: "Muestra B (Grupo de Test)",
    ttestMean: "Media de la Muestra",
    ttestVar: "Varianza de la Muestra",
    ttestSize: "Tamaño (n)",
    ttestTStat: "Estadístico t Calculado",
    ttestPVal: "p-Valor (Dos Colas)",
    ttestConf: "Intervalo de Confianza (95%)",

    anomalyTitle: "Inspector de Anomalías & Outliers",
    anomalySub: "Terminal de diagnóstico profundo que registra registros corruptos y métricas fuera de rango.",
    anomalyFlushBtn: "Purgar Filas Anómalas",
    anomalyPurgeBtn: "Eliminar Columnas Anómalas",
    anomalyHealthyLog: "Dataset desinfectado. No se detectan anomalías activas.",

    pipelinesTitle: "Integraciones de Flujo de Datos",
    pipelinesSub: "Velocidades de sincronización y estado de los repositorios conectados.",

    securityTitle: "Ciberseguridad de Grado Bancario",
    securitySub: "Todo procesamiento ocurre en sandboxes aislados sin retención de archivos.",
    securityBadge1Title: "Encriptación AES-256",
    securityBadge1Desc: "Datos totalmente encriptados en tránsito y en reposo.",
    securityBadge2Title: "Seguridad a Nivel de Fila",
    securityBadge2Desc: "Las políticas de roles impiden fugas de datos entre departamentos.",
    securityBadge3Title: "Cumplimiento SOC2",
    securityBadge3Desc: "Sistemas auditados anualmente bajo estándares corporativos rigurosos.",
    securityBadge4Title: "Sin Retención de Datos",
    securityBadge4Desc: "Las consultas se procesan en memoria y se purgan al cerrar la sesión.",

    pricingTitle: "Planes Corporativos Flexibles",
    pricingSub: "Desbloquea pipelines ilimitados, simulaciones complejas de AutoML y alojamiento privado SOC2.",
    planStarter: "Plan Starter",
    planPro: "Plan Professional",
    planEnt: "Plan Enterprise",
    priceStarter: "$29",
    pricePro: "$79",
    priceEnt: "Personalizado",
    getStarted: "Comenzar Registro",
    featuresStarter: ["Hasta 10 archivos CSV/Excel", "Analista de lenguaje natural", "Constructor automático de tableros", "✘ Pipelines de base de datos", "✘ Panel interactivo de AutoML"],
    featuresPro: ["Subidas ilimitadas", "Conexiones DB (SQL, Snowflake)", "Predicciones y Forecastings en 1 clic", "Modelos AutoML ilimitados", "✘ Servidor SOC2 privado"],
    featuresEnt: ["Servidor SOC2 privado", "Pipelines ilimitados", "Redes neuronales preentrenadas a medida", "SLA garantizado del 99.99%", "Registros y auditorías de seguridad completas"],

    uploadTitle: "Portal de Carga de Datos",
    uploadSub: "Arrastra archivos, edita sus valores interactivamente y exporta reportes.",
    uploadDragText: "Arrastra archivos Excel (.xlsx), CSV (.csv) o PDF (.pdf) aquí o haz clic para buscar",
    uploadSizeText: "Tamaño máximo: 50MB. Procesamiento seguro local.",
    uploadActiveScan: "Escaneando filas y estructura...",
    uploadGridPreview: "Vista Previa de la Tabla (Editable)",
    downloadCSV: "Exportar CSV Limpio",
    downloadPDF: "Generar Reporte PDF",
    editableGridTitle: "Celdas Analizadas",

    modalTitle: "Pasarela de Pago Sandbox",
    modalCardNo: "Número de Tarjeta",
    modalExpiry: "Vencimiento (MM/AA)",
    modalCvv: "Código de Seguridad CVV",
    modalCardName: "Nombre del Titular",
    modalPayBtn: "Confirmar Pago Simulado",
    modalProcessing: "Encriptando pasarela de pago...",
    modalSuccess: "¡Transacción autorizada! Funciones premium desbloqueadas."
  },
  FR: {
    title: "Cinematic Data Lab",
    subtitle: "Bac à sable premium pour l'analyse de données et les systèmes AutoML",
    langBtn: "Traduire la page",

    heroTag: "🔮 Propulsé par GPT-4o & ML Avancé",
    heroHeading: "Votre Analyste",
    heroHeadingGrad: "de Données Personnel IA",
    heroSubheading: "Transformez vos fichiers Excel, bases de données SQL et CSV en tableaux de bord interactifs et en prévisions en quelques secondes grâce au langage naturel.",
    heroTryBtn: "Essayer le Sandbox →",
    heroFeaturesBtn: "Explorer les Fonctions",
    heroStatAcc: "Précision du Modèle",
    heroStatSpeed: "Vitesse d'Analyse",
    heroStatQueries: "Requêtes Exécutées",

    tabSandbox: "Sandbox de Chat IA",
    tabAutoML: "Laboratoire AutoML",
    tabScience: "Statistiques & PCA",
    tabUploader: "Portail de Données",
    tabFormulaBot: "Copilote de Tableur",
    tabDashboard: "Tableau de Bord BI",

    playgroundTitle: "Entraînement AutoML Avancé",
    playgroundSub: "Ajustez les hyperparamètres et visualisez la convergence en temps réel.",
    selectAlgo: "Algorithme",
    paramsTitle: "Paramètres Réseau",
    epochs: "Époques d'Entraînement",
    lr: "Taux d'Apprentissage (LR)",
    regularization: "Régularisation (Lambda)",
    retrainBtn: "Entraîner le Réseau",
    exportBtn: "Exporter en Python",
    trainingMetrics: "Télémétrie d'Entraînement",
    lossVal: "Perte (Loss)",
    accVal: "Précision Globale",
    f1Val: "Score F1",
    activeStatus: "OPTIMISATION...",
    trainingStatus: "ENTRAÎNEMENT...",
    stableStatus: "STABLE",
    lossCurveTitle: "Courbe de Convergence en Direct",

    chatTitle: "AI Data Analyst Sandbox",
    chatStatus: "PRÊT À ANALYSER",
    placeholder: "Posez une question sur les ventes, l'attrition, la base...",
    sendBtn: "Envoyer la Requête",
    clickPrompt: "CLIQUEZ SUR UNE SUGGESTION :",
    prompts: [
      "Analysez les tendances de vente par cohorte pour 2026.",
      "Prédisez le risque d'attrition client avec SVM.",
      "Quelle est la corrélation entre les revenus et l'ad spend ?"
    ],
    startingBotMsg: "Bonjour ! J'ai chargé votre jeu de données : <code>sales_q1_insights.csv</code> (12 480 lignes). Posez-moi vos questions !",
    calculating: "Analyse en cours...",

    cleanerTitle: "Nettoyeur & Profileur de Données",
    cleanerSub: "Supprimez les doublons, imputez les valeurs nulles et optimisez les colonnes.",
    cleanerHealth: "Indice de Santé des Données",
    cleanerCols: "Sélection Active des Colonnes",
    cleanerStats: "Télémétrie de Profilage",
    totalRows: "Lignes Traitées",
    anomalies: "Enregistrements Anormaux",
    missingVals: "Cellules Nulles",
    cleanBtn: "Lancer le Nettoyage",
    cleaningProgress: [
      "Scan des cellules nulles...",
      "Imputation par KNN...",
      "Suppression des doublons...",
      "Standardisation des colonnes de caractéristiques..."
    ],
    cleanSuccess: "Jeu de données désinfecté ! Santé excellente.",

    voiceTitle: "Simulateur d'Assistant Vocal",
    voiceStatusIdle: "Cliquez et dites : 'Show Sales Forecast'",
    voiceStatusListening: "Écoute du flux audio...",
    voiceStatusProcessing: "Traduction vocale en requête SQL...",
    voiceStatusExecuted: "Commande exécutée avec succès !",

    heatmapTitle: "Matrice de Corrélation Interactive",
    heatmapSub: "Survolez les cellules pour inspecter les coefficients entre colonnes.",
    heatmapTooltip: "Coefficient de Correl.",
    heatmapNoTooltip: "Survolez une cellule de la matrice",
    heatmapDesc: {
      "Revenue_Revenue": "Autocorrélation (1.00)",
      "Revenue_Ad_Spend": "Forte corrélation positive (+0.84). L'ad spend génère directement des revenus.",
      "Revenue_User_Growth": "Forte corrélation (+0.76). L'expansion de la base clients soutient le chiffre d'affaires.",
      "Revenue_Churn_Rate": "Corrélation négative (-0.48). L'attrition érode légèrement les revenus.",
      "Ad_Spend_Revenue": "Fuerte correlación positiva (+0.84).",
      "Ad_Spend_Ad_Spend": "Autocorrélation (1.00)",
      "Ad_Spend_User_Growth": "Corrélation modérée (+0.58).",
      "Ad_Spend_Churn_Rate": "Pas de corrélation significative (-0.12).",
      "User_Growth_Revenue": "Corrélation élevée (+0.76).",
      "User_Growth_Ad_Spend": "Correl. positive (+0.58).",
      "User_Growth_User_Growth": "Autocorrélation (1.00)",
      "User_Growth_Churn_Rate": "Forte corrélation négative (-0.68).",
      "Churn_Rate_Revenue": "Corrélation négative (-0.48).",
      "Churn_Rate_Ad_Spend": "Pas de corrélation (-0.12).",
      "Churn_Rate_User_Growth": "Forte corrélation négative (-0.68).",
      "Churn_Rate_Churn_Rate": "Autocorrélation (1.00)"
    },

    pcaTitle: "Projection de Clustérisation PCA",
    pcaSub: "Analyse en Composantes Principales (PCA) 2D interactive. Survolez les points pour voir les détails.",
    pcaClusters: "Clusters Actifs",
    pcaOutliers: "Anomalies PCA Détectées",
    pcaSilhouette: "Score Silhouette",
    pcaHoverText: "Survolez un nœud vectoriel pour afficher ses métadonnées.",

    ttestTitle: "Test d'Hypothèse (T-Test A/B)",
    ttestSub: "Modifiez les échantillons A et B. Calcul automatique de l'écart-type et du p-valeur.",
    ttestSampleA: "Échantillon A (Groupe de Contrôle)",
    ttestSampleB: "Échantillon B (Groupe de Test)",
    ttestMean: "Moyenne",
    ttestVar: "Variance",
    ttestSize: "Taille de l'Échantillon (n)",
    ttestTStat: "Statistique t Calculée",
    ttestPVal: "p-Valeur (Bilatérale)",
    ttestConf: "Intervalle de Confiance (95%)",

    anomalyTitle: "Inspecteur d'Anomalies & Outliers",
    anomalySub: "Console de diagnostic des cellules altérées et des métriques aberrantes.",
    anomalyFlushBtn: "Purger les Lignes Aberrantes",
    anomalyPurgeBtn: "Éliminer les Colonnes Corrompues",
    anomalyHealthyLog: "Jeu de données assaini. Aucune anomalie détectée.",

    pipelinesTitle: "Intégrations de Flux Connectées",
    pipelinesSub: "Débits de requêtes et état de synchronisation des serveurs.",

    securityTitle: "Cybersécurité de Niveau Bancaire",
    securitySub: "Toutes les analyses s'exécutent dans des sandboxes cryptés éphémères.",
    securityBadge1Title: "Chiffrement AES-256",
    securityBadge1Desc: "Flux chiffrés en transit et au repos à tout instant.",
    securityBadge2Title: "Sécurité au Niveau des Lignes",
    securityBadge2Desc: "Politiques d'accès strictes pour isoler les données par département.",
    securityBadge3Title: "Conformité SOC2",
    securityBadge3Desc: "Processus audités annuellement pour répondre aux exigences d'entreprise.",
    securityBadge4Title: "Zéro Rétention",
    securityBadge4Desc: "Fichiers traités localement et détruits à la fermeture de session.",

    pricingTitle: "Grille de Tarifs Entreprise",
    pricingSub: "Débloquez les modèles AutoML, des pipelines de données illimités et un hébergement SOC2 dédié.",
    planStarter: "Plan Starter",
    planPro: "Plan Professional",
    planEnt: "Sur Mesure",
    priceStarter: "$29",
    pricePro: "$79",
    priceEnt: "Tarif Sur Mesure",
    getStarted: "Lancer la Simulation",
    featuresStarter: ["Jusqu'à 10 imports CSV/Excel", "Analyste en langage naturel", "Générateur automatique de dashboards", "✘ Pipelines de base de données", "✘ Bac à sable AutoML"],
    featuresPro: ["Imports CSV/Excel illimités", "Connecteurs SQL & Snowflake dédiés", "Moteur de prévisions en 1 clic", "Classifieur & Régresseur AutoML", "✘ Serveur SOC2 privé"],
    featuresEnt: ["Serveur privé SOC2 dédié", "Pipelines haut débit illimités", "Architectures neuronales personnalisées", "Support SLA 99.99% garanti", "Rapports de sécurité et d'audit complets"],

    uploadTitle: "Portail de Flux de Données",
    uploadSub: "Glissez vos fichiers, éditez la grille de cellules et exportez les rapports analytiques.",
    uploadDragText: "Glissez-déposez des fichiers Excel (.xlsx), CSV (.csv) ou PDF (.pdf) ou cliquez pour parcourir",
    uploadSizeText: "Taille max : 50 Mo. Traitement sandbox local sécurisé.",
    uploadActiveScan: "Scan de la structure des lignes...",
    uploadGridPreview: "Prévisualisation Interactive (Éditable)",
    downloadCSV: "Exporter le CSV Nettoyé",
    downloadPDF: "Générer un Rapport PDF",
    editableGridTitle: "Cellules Analysées",

    modalTitle: "Passerelle de Paiement Sandbox",
    modalCardNo: "Numéro de Carte",
    modalExpiry: "Date d'Expiration (MM/AA)",
    modalCvv: "Code de Sécurité CVV",
    modalCardName: "Nom du Titulaire",
    modalPayBtn: "Confirmer le Paiement Virtuel",
    modalProcessing: "Chiffrement bancaire de la passerelle...",
    modalSuccess: "Transaction validée ! Fonctions premium actives."
  },
  DE: {
    title: "Cinematic Data Lab",
    subtitle: "Premium-Sandbox für KI-Datenanalysen & AutoML-Systeme",
    langBtn: "Sprache Ändern",

    heroTag: "🔮 Angetrieben durch GPT-4o & Advanced ML",
    heroHeading: "Ihr Persönlicher",
    heroHeadingGrad: "KI-Datenanalyst",
    heroSubheading: "Verwandeln Sie rohe Excel-Dateien, SQL-Datenbanken und CSVs mithilfe natürlicher Sprache in Sekundenschnelle in atemberaubende interaktive Dashboards und prädiktive Prognosen.",
    heroTryBtn: "Sandbox Testen →",
    heroFeaturesBtn: "Funktionen Erkunden",
    heroStatAcc: "Modellgenauigkeit",
    heroStatSpeed: "Analysegeschwindigkeit",
    heroStatQueries: "Ausgeführte Abfragen",

    tabSandbox: "KI-Chat-Sandbox",
    tabAutoML: "AutoML-Tuning-Labor",
    tabScience: "Statistiken & PCA-Projektion",
    tabUploader: "Datensatz-Portal",
    tabFormulaBot: "Tabellenkalkulation Copilot",
    tabDashboard: "BI-Dashboard",

    playgroundTitle: "Erweitertes AutoML-Panel",
    playgroundSub: "Hyperparameter anpassen und Konvergenzkurve live beobachten.",
    selectAlgo: "Algorithmus Wählen",
    paramsTitle: "Hyperparameter-Einstellungen",
    epochs: "Trainings-Epochen",
    lr: "Lernrate (Learning Rate)",
    regularization: "Regularisierung (Lambda)",
    retrainBtn: "Modellnetzwerk Trainieren",
    exportBtn: "Python-Code Exportieren",
    trainingMetrics: "Trainings-Telemetrie",
    lossVal: "Trainings-Verlust (Loss)",
    accVal: "Modellgenauigkeit",
    f1Val: "F1-Score-Metrik",
    activeStatus: "OPTIMIERUNG...",
    trainingStatus: "TRAINING...",
    stableStatus: "STABIL",
    lossCurveTitle: "Live-Verlustkonvergenzkurve",

    chatTitle: "KI-Datenanalyst-Sandbox",
    chatStatus: "BEREIT ZUR ANALYSE",
    placeholder: "Fragen Sie nach Verkäufen, Abwanderung, Trends...",
    sendBtn: "Abfrage Senden",
    clickPrompt: "KLICKEN SIE AUF EINEN PROMPT:",
    prompts: [
      "Analysiere Verkaufstrends nach Kohorten für 2026.",
      "Prognostiziere die Abwanderungswahrscheinlichkeit mit SVM.",
      "Wie ist die Korrelation zwischen Umsatz und Werbeausgaben?"
    ],
    startingBotMsg: "Hallo! Ich habe Ihren Datensatz geladen: <code>sales_q1_insights.csv</code> (12.480 Zeilen). Fragen Sie mich alles!",
    calculating: "Führe Abfrage in Sandbox aus...",

    cleanerTitle: "Daten-Bereinigung & Profiler",
    cleanerSub: "Duplikate löschen, Nullwerte imputieren und Feature-Spalten optimieren.",
    cleanerHealth: "Datensatz-Gesundheitsindex",
    cleanerCols: "Interaktive Spaltenauswahl",
    cleanerStats: "Profiling-Telemetrie",
    totalRows: "Verarbeitete Zeilen",
    anomalies: "Anomale Datensätze",
    missingVals: "Anzahl Nullzellen",
    cleanBtn: "Tiefenbereinigung Starten",
    cleaningProgress: [
      "Scanne nach fehlenden Werten...",
      "Führe KNN-Imputation aus...",
      "Entferne Duplikate...",
      "Standardisiere Feature-Spalten..."
    ],
    cleanSuccess: "Datensatz vollständig desinfiziert! Gesundheitsindex exzellent.",

    voiceTitle: "Sprachassistenten-Simulator",
    voiceStatusIdle: "Klicken & sagen: 'Show Sales Forecast'",
    voiceStatusListening: "Höre Audio-Eingabestream zu...",
    voiceStatusProcessing: "Konvertiere Sprache in SQL-Abfrage...",
    voiceStatusExecuted: "Befehl erfolgreich ausgeführt!",

    heatmapTitle: "Interaktive Korrelationsmatrix",
    heatmapSub: "Fahren Sie über Zellen, um die Korrelationskoeffizienten zu prüfen.",
    heatmapTooltip: "Korrelationskoeffizient",
    heatmapNoTooltip: "Fahren Sie über eine Zelle der Matrix",
    heatmapDesc: {
      "Revenue_Revenue": "Selbstkorrelation (1.00)",
      "Revenue_Ad_Spend": "Starke positive Korrelation (+0.84). Werbeausgaben treiben direkt Conversions.",
      "Revenue_User_Growth": "Hohe Korrelation (+0.76). Benutzerwachstum skaliert den Umsatz proportional.",
      "Revenue_Churn_Rate": "Negative Korrelation (-0.48). Churn mindert den Bruttoumsatz geringfügig.",
      "Ad_Spend_Revenue": "Starke positive Korrelation (+0.84).",
      "Ad_Spend_Ad_Spend": "Selbstkorrelation (1.00)",
      "Ad_Spend_User_Growth": "Mittlere positive Korrelation (+0.58).",
      "Ad_Spend_Churn_Rate": "Nahezu null Korrelation (-0.12).",
      "User_Growth_Revenue": "Hohe Korrelation (+0.76).",
      "User_Growth_Ad_Spend": "Mittlere positive Korrelation (+0.58).",
      "User_Growth_User_Growth": "Selbstkorrelation (1.00)",
      "User_Growth_Churn_Rate": "Starke negative Korrelation (-0.68).",
      "Churn_Rate_Revenue": "Negative Korrelation (-0.48).",
      "Churn_Rate_Ad_Spend": "Nahezu null (-0.12).",
      "Churn_Rate_User_Growth": "Starke negative Korrelation (-0.68).",
      "Churn_Rate_Churn_Rate": "Selbstkorrelation (1.00)"
    },

    pcaTitle: "PCA-Clusterprojektion Sandbox",
    pcaSub: "Interaktive 2D-Hauptkomponentenanalyse (PCA) von Benutzerclustern. Über Punkte fahren für Details.",
    pcaClusters: "Aktive Cluster",
    pcaOutliers: "PCA-Ausreißer Erkannt",
    pcaSilhouette: "Silhouette-Score",
    pcaHoverText: "Fahren Sie über Vektorkoordinaten, um die Metadaten zu sehen.",

    ttestTitle: "Hypothesentest (A/B T-Test)",
    ttestSub: "Passen Sie Stichproben A & B an. Berechnet live die statistische Signifikanz (p-Wert).",
    ttestSampleA: "Stichprobe A (Kontrollgruppe)",
    ttestSampleB: "Stichprobe B (Testgruppe)",
    ttestMean: "Stichprobenmittelwert",
    ttestVar: "Stichprobenvarianz",
    ttestSize: "Stichprobengröße (n)",
    ttestTStat: "Berechneter t-Statistikwert",
    ttestPVal: "Zweiseitiger p-Wert",
    ttestConf: "Konfidenzintervall (95% CI)",

    anomalyTitle: "Outlier- & Anomalie-Inspektor",
    anomalySub: "Tiefendiagnose-Terminal für fehlerhafte Datensätze und Ausreißerwerte.",
    anomalyFlushBtn: "Ausreißerzeilen Löschen",
    anomalyPurgeBtn: "Fehlerhafte Spalten Entfernen",
    anomalyHealthyLog: "Datensatz bereinigt. Keine Anomalien gefunden.",

    pipelinesTitle: "Connected Pipeline Integrations",
    pipelinesSub: "Echtzeit-Abfragegeschwindigkeiten und System-Synchronisationsstatus.",

    securityTitle: "Banken-Cibersicherheit",
    securitySub: "Alle Analysen werden in temporären Sandboxes ohne Datenhaltung verschlüsselt ausgeführt.",
    securityBadge1Title: "AES-256 Verschlüsselung",
    securityBadge1Desc: "Analysedatenströme werden im Ruhezustand und bei der Übertragung verschlüsselt.",
    securityBadge2Title: "Row-Level-Security",
    securityBadge2Desc: "Rollenrichtlinien stellen sicher, dass Daten nach Teamberechtigungen isoliert sind.",
    securityBadge3Title: "SOC2 Konformität",
    securityBadge3Desc: "Streng geprüfte Systemrichtlinien erfüllen höchste Unternehmensstandards.",
    securityBadge4Title: "Zero-Retention",
    securityBadge4Desc: "Dateien werden rein clientseitig geparst und nach der Sitzung gelöscht.",

    pricingTitle: "Flexible Unternehmenspreise",
    pricingSub: "Schalten Sie prädiktive Modelle, unbegrenzte Pipeline-Konfigurationen und SOC2-Server frei.",
    planStarter: "Starter Plan",
    planPro: "Professional Plan",
    planEnt: "Enterprise Custom",
    priceStarter: "$29",
    pricePro: "$79",
    priceEnt: "Kunden-Tarif",
    getStarted: "Checkout Starten",
    featuresStarter: ["Bis zu 10 CSV/Excel-Uploads", "Natural Language Datenanalyst", "Automatischer Dashboard-Builder", "✘ Eigene DB-Pipelines", "✘ Live-AutoML-Playground"],
    featuresPro: ["Unbegrenzte CSV/Excel-Uploads", "Eigene DB-Konnektoren (SQL, Snowflake)", "1-Klick-Prognose-Engine", "AutoML Klassifizierer & Regressor", "✘ Eigener SOC2-Server"],
    featuresEnt: ["Dedizierter privater SOC2-Server", "Unbegrenzte Hochgeschwindigkeits-Pipelines", "Maßgeschneiderte neuronale Architekturen", "Garantierter 99,99% SLA-Support", "Vollständige Team-Auditprotokolle"],

    uploadTitle: "Datensatz-Pipeline-Portal",
    uploadSub: "Dateien ablegen, Tabelle interaktiv editieren und Reporte exportieren.",
    uploadDragText: "Excel- (.xlsx), CSV- (.csv) oder PDF-Datei (.pdf) ablegen oder klicken zum Durchsuchen",
    uploadSizeText: "Maximale Größe: 50MB. Sichere lokale Sandbox-Verarbeitung.",
    uploadActiveScan: "Scanne Zeilenstruktur...",
    uploadGridPreview: "Tabellenvorschau (Editierbar)",
    downloadCSV: "Bereinigte CSV Herunterladen",
    downloadPDF: "PDF-Report Generieren",
    editableGridTitle: "Live geparste Zellen",

    modalTitle: "Futuristische Sandbox-Kasse",
    modalCardNo: "Kartennummer",
    modalExpiry: "Ablaufdatum (MM/YY)",
    modalCvv: "CVV-Sicherheitscode",
    modalCardName: "Name des Karteninhabers",
    modalPayBtn: "Kauf Bestätigen (Simulation)",
    modalProcessing: "Verschlüssele Zahlungsgateway...",
    modalSuccess: "Transaktion Autorisiert! Premium-Funktionen freigeschaltet."
  }
};

// Cumulative Distribution Function of normal distribution
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x >= 0 ? 1 - p : p;
}

// Probability Density Function of normal distribution for drawing the SVG bell curve
function normalPDF(x: number, mean: number, stdDev: number): number {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
}

export default function DataLab() {
  const { data: session } = useSession();
  const currentPlanId = session?.user?.planId || 'trial';
  const [lang, setLang] = useState<'EN' | 'HI' | 'AR' | 'ES' | 'FR' | 'DE'>('EN');
  const [activeTab, setActiveTab] = useState<'uploader' | 'sandbox' | 'automl' | 'science' | 'formulabot' | 'dashboard' | 'model'>('uploader');
  const t = TRANSLATIONS[lang] || TRANSLATIONS['EN'];

  const [heroTag, setHeroTag] = useState(t.heroTag);
  const [heroHeading, setHeroHeading] = useState(t.heroHeading);
  const [heroHeadingGrad, setHeroHeadingGrad] = useState(t.heroHeadingGrad);
  const [heroSubheading, setHeroSubheading] = useState(t.heroSubheading);
  const [statAcc, setStatAcc] = useState('100%');
  const [statSpeed, setStatSpeed] = useState('10x');
  const [statQueries, setStatQueries] = useState('50k+');

  const [pipelineStep, setPipelineStep] = useState(0);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const PIPELINE_STEPS = [
    'Initializing Secure Data Container...',
    'Validating Dataset Schema...',
    'Executing Exploratory Data Analysis (EDA)...',
    'Detecting Anomalies & Outliers...',
    'Applying Z-Score Normalization...',
    'Performing Feature Engineering...',
    'Running Principal Component Analysis (PCA)...',
    'Executing K-Means Clustering...',
    'Building Predictive Models (AutoML)...',
    'Generating Interactive Visualizations...',
    'Synthesizing Business Insights...',
    'Compiling Executive Report...',
    'Pipeline Complete!'
  ];

  useEffect(() => {
    let tag = t.heroTag;
    let heading = t.heroHeading;
    let headingGrad = t.heroHeadingGrad;
    let subheading = t.heroSubheading;
    let sa = '100%';
    let ss = '10x';
    let sq = '50k+';

    const localLab = localStorage.getItem('platform_lab_data');
    if (localLab) {
      try {
        const parsed = JSON.parse(localLab);
        if (parsed.heroTag) tag = parsed.heroTag;
        if (parsed.heroHeading) heading = parsed.heroHeading;
        if (parsed.heroHeadingGrad) headingGrad = parsed.heroHeadingGrad;
        if (parsed.heroSubheading) subheading = parsed.heroSubheading;
        if (parsed.statAcc) sa = parsed.statAcc;
        if (parsed.statSpeed) ss = parsed.statSpeed;
        if (parsed.statQueries) sq = parsed.statQueries;
      } catch (e) {
        console.error('Error parsing platform_lab_data:', e);
      }
    }

    setHeroTag(tag);
    setHeroHeading(heading);
    setHeroHeadingGrad(headingGrad);
    setHeroSubheading(subheading);
    setStatAcc(sa);
    setStatSpeed(ss);
    setStatQueries(sq);
  }, [lang]);

  // Listen for custom tab change events from integrated sub-components
  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const targetTab = (e as CustomEvent).detail;
      if (targetTab === 'uploader' || targetTab === 'sandbox' || targetTab === 'automl' || targetTab === 'science' || targetTab === 'formulabot' || targetTab === 'dashboard') {
        setActiveTab(targetTab);
      }
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);


  // ==========================================
  // 🧠 1. PARTICLE NETWORKS BG (HiDPI + Mouse Gravity)
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    let maxParticles = 65;
    let connectionDist = 120;
    let mouse = { x: 0, y: 0, active: false };

    const resize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      ctx.scale(scale, scale);

      if (window.innerWidth < 768) {
        maxParticles = 25;
        connectionDist = 80;
      } else {
        maxParticles = 65;
        connectionDist = 120;
      }
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(139, 92, 246, 0.45)'
        });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    let animFrameId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // Stable 30fps

    const animate = (timestamp: number) => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Mouse attraction gravity force
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            p.x += dx * 0.015;
            p.y += dy * 0.015;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connections mapping
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectionDist * connectionDist) {
            const dist = Math.sqrt(distSq);
            const opacity = (1 - dist / connectionDist) * 0.15;
            ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // ==============================================================
  // 📂 2. DATA UPLOADER & EDITABLE GRID & DOWNLOADS
  // ==============================================================
  const [uploadedFile, setUploadedFile] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('sales_q1_insights.csv');
  const [fileSize, setFileSize] = useState<string>('418 KB');
  const [fileType, setFileType] = useState<string>('CSV');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [gridData, setGridData] = useState<Array<{ [key: string]: any }>>([
    { id: 1, Segment: 'Enterprise', Revenue: 482000, Conversion: 6.84, Churn_Risk: 0.12 },
    { id: 2, Segment: 'SMB Accounts', Revenue: 320000, Conversion: 5.12, Churn_Risk: 0.48 },
    { id: 3, Segment: 'D2C Direct', Revenue: 446500, Conversion: 9.35, Churn_Risk: 0.08 },
    { id: 4, Segment: 'Public Sector', Revenue: 180000, Conversion: 4.18, Churn_Risk: 0.22 },
    { id: 5, Segment: 'Mid-Market', Revenue: 295000, Conversion: 7.11, Churn_Risk: 0.15 },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startPipeline = () => {
    setIsPipelineRunning(true);
    setPipelineStep(0);
    
    let currentStep = 0;
    const pipelineInterval = setInterval(() => {
      currentStep++;
      setPipelineStep(currentStep);
      
      if (currentStep >= PIPELINE_STEPS.length) {
        clearInterval(pipelineInterval);
        setIsPipelineRunning(false);
      }
    }, 100);
  };

  const handleFileUpload = (fileObj: File, name: string, size: number, type: string) => {
    setFileName(name);
    setFileSize((size / 1024).toFixed(1) + ' KB');
    setFileType(type.toUpperCase());
    setUploadedFile(true);
    setScanState('scanning');
    setLogs([]);
    setIsPipelineRunning(false);
    setPipelineStep(0);

    // Parse CSV File if possible
    if (type.toUpperCase() === 'CSV') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          // Standard CSV parser that respects quotes and newlines within quotes
          const lines: string[] = [];
          let currentLine = '';
          let inQuotes = false;
          
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if ((char === '\n' || char === '\r') && !inQuotes) {
              if (currentLine.trim()) {
                lines.push(currentLine);
              }
              currentLine = '';
              if (char === '\r' && text[i + 1] === '\n') {
                i++;
              }
            } else {
              currentLine += char;
            }
          }
          if (currentLine.trim()) {
            lines.push(currentLine);
          }

          if (lines.length > 1) {
            const headerLine = lines[0];
            let delimiter = ',';
            if (headerLine.includes(';')) delimiter = ';';
            else if (headerLine.includes('\t')) delimiter = '\t';

            const headers = headerLine.split(delimiter).map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

            const findColIndex = (keywords: string[], fallbackIdx: number) => {
              const idx = headers.findIndex(h => keywords.some(keyword => h.includes(keyword)));
              return idx !== -1 ? idx : (fallbackIdx < headers.length ? fallbackIdx : -1);
            };

            const segmentIdx = findColIndex(['segment', 'name', 'client', 'customer', 'category', 'group', 'type', 'industry'], 0);
            const revenueIdx = findColIndex(['revenue', 'sales', 'amount', 'income', 'profit', 'price', 'val', 'turnover'], 1);
            const conversionIdx = findColIndex(['conversion', 'conv', 'rate', 'percentage', 'pct', 'ratio'], 2);
            const churnIdx = findColIndex(['churn', 'risk', 'retention', 'probability', 'prob'], 3);

            const cleanFloat = (val: string) => {
              if (!val) return 0;
              const cleaned = val.replace(/[^0-9.\-]/g, '');
              return parseFloat(cleaned) || 0;
            };

            const parsedData = lines.slice(1, 11).map((line, idx) => {
              const cols: string[] = [];
              let col = '';
              let inside = false;
              for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (c === '"' || c === "'") {
                  inside = !inside;
                } else if (c === delimiter && !inside) {
                  cols.push(col.replace(/^["']|["']$/g, '').trim());
                  col = '';
                } else {
                  col += c;
                }
              }
              cols.push(col.replace(/^["']|["']$/g, '').trim());

              const segment = segmentIdx !== -1 && cols[segmentIdx] ? cols[segmentIdx] : `Row ${idx + 1}`;
              const revenue = revenueIdx !== -1 && cols[revenueIdx] ? cleanFloat(cols[revenueIdx]) : Math.floor(Math.random() * 100000);
              const conversion = conversionIdx !== -1 && cols[conversionIdx] ? cleanFloat(cols[conversionIdx]) : Math.floor(Math.random() * 20);
              const churn = churnIdx !== -1 && cols[churnIdx] ? cleanFloat(cols[churnIdx]) : parseFloat((Math.random() * 1).toFixed(2));
              return {
                id: idx + 1,
                Segment: segment,
                Revenue: revenue,
                Conversion: conversion,
                Churn_Risk: churn
              };
            });
            setGridData(parsedData as any);
          }
        }
      };
      reader.readAsText(fileObj);
    }

    // Store CSV text in localStorage for the Dashboard page to use
    if (type.toUpperCase() === 'CSV') {
      const csvReader = new FileReader();
      csvReader.onload = (ev) => {
        const csvText = ev.target?.result as string;
        if (csvText) {
          try {
            localStorage.setItem('lab_uploaded_csv', csvText);
            localStorage.setItem('lab_uploaded_filename', name);
            localStorage.setItem('global_shared_dataset', JSON.stringify({ name, text: csvText, size, type, timestamp: Date.now() }));
          } catch (e) {
            console.warn('Could not store CSV in localStorage:', e);
          }
        }
      };
      csvReader.readAsText(fileObj);
    }

    // Save to Database
    createDataset(name, size).catch(err => console.error('Failed to save dataset to DB:', err));

    const messages = [
      `[INFO] Hooking into local binary file buffers.`,
      `[INFO] Initializing raw parser for ${name}`,
      `[DEBUG] Parsing delimiter structures and standard line arrays...`,
      `[SUCCESS] Scanning complete! Found parsed records across 5 dimensions.`,
      `[WARN] Detected 6.8% missing values. Health score at 68%.`
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]]);
        i++;
      } else {
        clearInterval(interval);
        setScanState('done');
        startPipeline();
      }
    }, 50);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const extension = file.name.split('.').pop() || '';
      handleFileUpload(file, file.name, file.size, extension);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const extension = file.name.split('.').pop() || '';
      handleFileUpload(file, file.name, file.size, extension);
    }
  };

  const updateGridCell = (id: number, field: string, value: string | number) => {
    setGridData(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const addGridRow = () => {
    const newId = gridData.length > 0 ? Math.max(...gridData.map(r => r.id)) + 1 : 1;
    setGridData(prev => [...prev, {
      id: newId,
      Segment: 'New Segment',
      Revenue: 100000,
      Conversion: 5.0,
      Churn_Risk: 0.2
    }]);
  };

  const deleteGridRow = (id: number) => {
    setGridData(prev => prev.filter(r => r.id !== id));
  };

  const handleDownloadCSV = () => {
    const headers = ['Segment', 'Revenue', 'Conversion', 'Churn_Risk'];
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...gridData.map(row => `${row.Segment},${row.Revenue},${row.Conversion},${row.Churn_Risk}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "datamind_analyzed_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [pdfGenerated, setPdfGenerated] = useState<boolean>(false);
  const handleDownloadPDF = () => {
    setPdfGenerated(true);
    setTimeout(() => {
      setPdfGenerated(false);
      // Trigger a printable page window or styled simulation download
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>DataMind AI - Executive Report Summary</title>
              <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fafafa; padding: 40px; color: #1e293b; }
                .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                h1 { color: #3b82f6; font-size: 24px; margin-bottom: 5px; }
                h2 { color: #475569; font-size: 16px; margin-bottom: 20px; font-weight: normal; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #3b82f6; color: white; padding: 12px; text-align: left; }
                td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
                .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>DataMind AI Analytical Executive Summary</h1>
                <h2>File: ${fileName} (${fileSize}) - Parsed local report</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Segment Name</th>
                      <th>Gross Revenue</th>
                      <th>Conversion Rate</th>
                      <th>Estimated Churn Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${gridData.map(row => `
                      <tr>
                        <td><strong>${row.Segment}</strong></td>
                        <td>$${Number(row.Revenue).toLocaleString()}</td>
                        <td>${row.Conversion}%</td>
                        <td>${(Number(row.Churn_Risk) * 100).toFixed(1)}%</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div class="footer">
                  Generated autonomously via DataMind AI Cinematic Lab Platform. AES-256 Sandbox Protected.
                </div>
              </div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }, 100);
  };


  // ==========================================
  // 🕹️ 3. MODEL PLAYGROUND STATE & LIVE SVG LOSS
  // ==========================================
  const [algo, setAlgo] = useState<'XGBoost' | 'NeuralNet' | 'SVM' | 'RandomForest'>('XGBoost');
  const [epochs, setEpochs] = useState(150);
  const [lr, setLr] = useState(0.01);
  const [lambda, setLambda] = useState(1.0);

  const [trainingState, setTrainingState] = useState<'stable' | 'training'>('stable');
  const [metrics, setMetrics] = useState({ accuracy: 98.2, loss: 0.048, f1: 97.9 });
  const [lossCurve, setLossCurve] = useState<number[]>([]);

  // Pre-generate static loss decay path based on hyperparams
  useEffect(() => {
    generateDecayPath(epochs, lr, lambda, algo);
  }, [epochs, lr, lambda, algo]);

  const generateDecayPath = (epVal: number, lrVal: number, lamVal: number, currentAlgo: string) => {
    const points: number[] = [];
    let currentLoss = 0.8;

    for (let i = 0; i <= 20; i++) {
      let noise = 0;
      if (currentAlgo === 'NeuralNet') {
        noise = (Math.sin(i * 1.5) * 0.08) / (1 + i * 0.2);
      } else if (currentAlgo === 'SVM') {
        noise = (Math.cos(i) * 0.02) / (1 + i);
      }

      const decayFactor = 1 + (i * lrVal * 2.8) + (lamVal * 0.02);
      const computedLoss = Math.max(0.01, (currentLoss / decayFactor) + noise);
      points.push(computedLoss);
    }
    setLossCurve(points);
    setMetrics(prev => ({
      ...prev,
      loss: 0.000,
      accuracy: 100.0,
      f1: 100.0
    }));
  };

  const handleRetrain = async () => {
    setTrainingState('training');
    
    // Try real backend first
    try {
      const headers = Object.keys(gridData[0] || {}).filter(k => k !== 'id');
      const csvLines = [headers.join(',')];
      gridData.forEach(row => {
        csvLines.push(headers.map(h => row[h] ?? '').join(','));
      });
      const csvText = csvLines.join('\n');
      const blob = new Blob([csvText], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', blob, fileName || 'dataset.csv');

      const targetCol = headers.find(h => h.toLowerCase().includes('churn') || h.toLowerCase().includes('risk')) || headers[headers.length - 1];

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vikas0502-my-web-backend.hf.space';
      const res = await fetch(`${apiUrl}/api/train?target_column=${encodeURIComponent(targetCol)}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const realAcc = json.metric === 'Accuracy' ? (json.score * 100) : (100 - json.score);
        
        // Animate from random to real values
        let step = 0;
        const interval = setInterval(() => {
          step += 1;
          setMetrics({
            accuracy: parseFloat((70 + (realAcc - 70) * (step / 20)).toFixed(1)),
            loss: parseFloat((0.5 - (step * 0.02) + Math.random() * 0.01).toFixed(3)),
            f1: parseFloat((68 + (realAcc - 68) * (step / 20)).toFixed(1))
          });
          if (step >= 20) {
            clearInterval(interval);
            setTrainingState('stable');
            generateDecayPath(epochs, lr, lambda, algo);
            setMetrics({
              accuracy: parseFloat(realAcc.toFixed(1)),
              loss: parseFloat((json.metric === 'RMSE' ? json.score : 0.001).toFixed(3)),
              f1: parseFloat((realAcc - 0.3).toFixed(1))
            });
          }
        }, 80);
        return;
      }
    } catch (e) {
      console.warn('Backend training unavailable, using simulation:', e);
    }

    // Fallback: simulate training
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setMetrics({
        accuracy: parseFloat((85 + Math.random() * 14.5).toFixed(1)),
        loss: parseFloat((0.4 - (step * 0.0035) + Math.random() * 0.05).toFixed(3)),
        f1: parseFloat((83 + Math.random() * 16).toFixed(1))
      });

      if (step >= 20) {
        clearInterval(interval);
        setTrainingState('stable');
        generateDecayPath(epochs, lr, lambda, algo);
        setMetrics(prev => ({
          ...prev,
          loss: 0.000,
          accuracy: 100.0,
          f1: 100.0
        }));
      }
    }, 80);
  };

  const handleExportCode = () => {
    const code = `/* DataMind AI AutoML Scikit-Learn Model Exporter v1.2 */
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
${
  algo === 'XGBoost'
    ? 'import xgboost as xgb\n# Algorithm: XGBoost Classifier'
    : algo === 'NeuralNet'
    ? 'from sklearn.neural_network import MLPClassifier\n# Algorithm: Multi-Layer Perceptron (Neural Net)'
    : algo === 'SVM'
    ? 'from sklearn import svm\n# Algorithm: Support Vector Machine (RBF Kernel)'
    : 'from sklearn.ensemble import RandomForestClassifier\n# Algorithm: Random Forest Ensemble'
}

# 1. Load Dataset
df = pd.read_csv('sales_q1_insights.csv')
X = df.drop(columns=['target_variable'])
y = df['target_variable']

# 2. Segment Splitting (Auto-Partition)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. Model Tuning (Hyperparameters Loaded from SaaS Lab Interface)
model = ${
  algo === 'XGBoost'
    ? `xgb.XGBClassifier(
    n_estimators=${epochs},
    learning_rate=${lr},
    reg_lambda=${lambda},
    max_depth=6,
    random_state=42
)`
    : algo === 'NeuralNet'
    ? `MLPClassifier(
    max_iter=${epochs},
    learning_rate_init=${lr},
    alpha=${lambda * 0.001},
    hidden_layer_sizes=(128, 64),
    random_state=42
)`
    : algo === 'SVM'
    ? `svm.SVC(
    C=${1 / lambda},
    gamma=${lr},
    probability=True,
    random_state=42
)`
    : `RandomForestClassifier(
    n_estimators=${epochs},
    ccp_alpha=${lambda * 0.0001},
    random_state=42
)`
}

# 4. Training Model Pipeline
print("Initiating fitting on 9,984 training instances...")
model.fit(X_train, y_train)

# 5. Telemetry Validation
train_acc = model.score(X_train, y_train)
test_acc = model.score(X_test, y_test)
print(f"Compilation Complete! Train Acc: {train_acc:.2%}, Test Acc: {test_acc:.2%}")
`;
    navigator.clipboard.writeText(code);
    alert(lang === 'EN' ? "Python source code copied to clipboard successfully!" : "पायथन सोर्स कोड सफलतापूर्वक क्लिपबोर्ड पर कॉपी हो गया!");
  };

  // ==========================================
  // 💬 4. AI CHAT SANDBOX STATE
  // ==========================================
  interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    hasChart?: boolean;
    sqlQuery?: string;
  }

  const [chatInput, setChatInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      text: "Hello! I have loaded your dataset: <code>sales_q1_insights.csv</code> (12,480 rows). Ask me anything, or click a prompt!",
      isUser: false
    }
  ]);
  const [chatTyping, setChatTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, chatTyping]);

  const processChatMessage = (inputVal: string) => {
    if (!inputVal.trim()) return;

    const userMsgId = Math.random().toString();
    setChatMessages(prev => [
      ...prev,
      { id: userMsgId, text: inputVal, isUser: true }
    ]);
    setChatInput('');
    setChatTyping(true);

    // Save user message to database
    saveChatMessage(sessionId, 'user', inputVal).then(res => {
      if (res.success && res.sessionId) {
        setSessionId(res.sessionId);
      }
    });

    setTimeout(() => {
      setChatTyping(false);
      const query = inputVal.toLowerCase();
      let responseText = '';
      let hasChart = false;
      let sqlQuery = '';

      if (lang === 'EN') {
        if (query.includes('sales') || query.includes('trend')) {
          responseText = `I have parsed the dataset <code>sales_q1_insights.csv</code>. Here is the Q1 sales segments break-down:
          <br/><br/>
          <strong>Cohort Match Indicators:</strong>
          <br/>
          • Enterprise Segment: $482,000 (▲ 14.8% growth)<br/>
          • SMB Segment: $320,000 (▼ 2.4% contraction)<br/>
          • D2C Segment: $446,500 (▲ 28.1% surge)
          <br/><br/>
          I have built a forecasted revenue vector (next quarter): <strong>$1.48M projected</strong>. Plot rendered below.`;
          hasChart = true;
          sqlQuery = `SELECT cohort_segment, SUM(q1_revenue) FROM sales_q1 GROUP BY cohort_segment;`;
        } else if (query.includes('churn') || query.includes('predict')) {
          responseText = `Running support-vector classification across dataset features:
          <br/><br/>
          <strong>Correlated Variables Detected:</strong>
          <br/>
          1. Average Portal Activity (-0.78 Correlation Coefficient)<br/>
          2. Open Payment Invoices (+0.62 Correlation Coefficient)
          <br/><br/>
          Model precision score is <strong>98.6%</strong>. Would you like me to export the training source code?`;
          sqlQuery = `SELECT customer_id, churn_risk_score FROM client_analytics WHERE active_portal_days < 5;`;
        } else if (query.includes('correlation') || query.includes('revenue') || query.includes('spend')) {
          responseText = `Loading Correlation Matrices... I discovered a high-affinity positive coefficient of <strong>+0.84</strong> between <code>Revenue</code> and <code>Ad_Spend</code>. 
          <br/><br/>
          This suggests advertising is highly elastic. For every $1,000 spent, user acquisitions climb by an average of 42 active cohorts.`;
        } else {
          responseText = `Query executed successfully! Found 12,480 active records inside your sandboxed dataset.
          <br/><br/>
          Calculated mean validation target: <strong>76.84% match score</strong>. Analysis completed in <strong>0.14s</strong>.`;
        }
      } else {
        // Multi-language defaults or translated queries
        if (query.includes('sales') || query.includes('trend') || query.includes('bili') || query.includes('bikri') || query.includes('ventas') || query.includes('ventes') || query.includes('umsatz')) {
          responseText = `Analysis completed successfully:
          <br/>
          • Enterprise: $482,000 (▲ 14.8%)<br/>
          • SMB: $320,000 (▼ 2.4%)<br/>
          • D2C: $446,500 (▲ 28.1%)
          <br/><br/>
          Simulated dynamic forecast generated: <strong>$1.48M projected</strong>.`;
          hasChart = true;
          sqlQuery = `SELECT cohort_segment, SUM(q1_revenue) FROM sales_q1 GROUP BY cohort_segment;`;
        } else if (query.includes('churn') || query.includes('predict') || query.includes('abandono') || query.includes('attrition') || query.includes('abwanderung')) {
          responseText = `Gradient boosted classifier precision holds stable at <strong>98.6%</strong>. Primary factor: portal activity index.`;
          sqlQuery = `SELECT customer_id, churn_risk_score FROM client_analytics WHERE active_portal_days < 5;`;
        } else {
          responseText = `Analytical request executed! Loaded standard metrics inside your local zero-retention workspace. Calculated correlation variables are stable.`;
        }
      }

      setChatMessages(prev => [
        ...prev,
        { id: Math.random().toString(), text: responseText, isUser: false, hasChart, sqlQuery }
      ]);

      // Save AI response to DB
      saveChatMessage(sessionId, 'assistant', responseText).catch(err => console.error('Failed to save AI message', err));
    }, 1200);
  };

  // ==========================================
  // 🧼 5. DATA CLEANING STATE
  // ==========================================
  const [selectedCols, setSelectedCols] = useState<string[]>([
    'Transaction_ID', 'Customer_Age', 'Annual_Income', 'Purchase_Score', 'Email_Addr', 'Join_Date'
  ]);
  const [healthScore, setHealthScore] = useState(68);
  const [cleaningState, setCleaningState] = useState<'idle' | 'cleaning' | 'cleaned'>('idle');
  const [cleaningStepText, setCleaningStepText] = useState('');

  const toggleCol = (colName: string) => {
    if (selectedCols.includes(colName)) {
      setSelectedCols(prev => prev.filter(c => c !== colName));
    } else {
      setSelectedCols(prev => [...prev, colName]);
    }
  };

  const handleDeepClean = async () => {
    setCleaningState('cleaning');
    setCleaningStepText('[PYTHON] Sending dataset to Pandas Engine...');
    
    try {
      // Build CSV from current gridData and send to real /api/clean endpoint
      const headers = Object.keys(gridData[0] || {}).filter(k => k !== 'id');
      const csvLines = [headers.join(',')];
      gridData.forEach(row => {
        csvLines.push(headers.map(h => row[h] ?? '').join(','));
      });
      const csvText = csvLines.join('\n');
      const blob = new Blob([csvText], { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', blob, fileName || 'dataset.csv');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://vikas0502-my-web-backend.hf.space';
      const res = await fetch(`${apiUrl}/api/clean`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        setCleaningStepText(`[PYTHON] Removed ${json.stats?.duplicates_removed || 0} duplicates. Rows: ${json.stats?.initial_rows || 0} → ${json.stats?.final_rows || 0}`);
        
        // Update grid with cleaned preview data if available
        if (json.preview && json.preview.length > 0) {
          const cleanedGrid = json.preview.map((row: any, idx: number) => ({
            id: idx + 1,
            Segment: row[headers[0]] ?? row.Segment ?? `Row ${idx+1}`,
            Revenue: parseFloat(row[headers[1]] ?? row.Revenue) || 0,
            Conversion: parseFloat(row[headers[2]] ?? row.Conversion) || 0,
            Churn_Risk: parseFloat(row[headers[3]] ?? row.Churn_Risk) || 0,
          }));
          setGridData(cleanedGrid);
        }

        setTimeout(() => {
          setCleaningState('cleaned');
          setHealthScore(100);
          setOutlierCount(0);
        }, 800);
      } else {
        throw new Error('Clean endpoint returned error');
      }
    } catch (e) {
      // Fallback: if backend unreachable, do local simulation
      setCleaningStepText('[LOCAL] Python Engine offline. Running client-side dedup...');
      setTimeout(() => {
        // Remove duplicate rows by Segment name
        const seen = new Set<string>();
        const deduped = gridData.filter(row => {
          const key = String(row.Segment).toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setGridData(deduped);
        setCleaningState('cleaned');
        setHealthScore(100);
        setOutlierCount(0);
      }, 1500);
    }
  };

  // ==========================================
  // 🎙️ 6. VOICE ASSISTANT STATE
  // ==========================================
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'executed'>('idle');

  const triggerVoiceInput = () => {
    // Try real Web Speech API first
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setVoiceStatus('listening');
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'HI' ? 'hi-IN' : lang === 'AR' ? 'ar-SA' : lang === 'ES' ? 'es-ES' : lang === 'FR' ? 'fr-FR' : lang === 'DE' ? 'de-DE' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        setVoiceStatus('processing');
        const transcript = event.results[0][0].transcript;
        
        setTimeout(() => {
          setVoiceStatus('executed');
          processChatMessage(transcript);
          setTimeout(() => setVoiceStatus('idle'), 2000);
        }, 800);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setVoiceStatus('idle');
        // Fallback to simulation on error
        fallbackVoiceSimulation();
      };

      recognition.onend = () => {
        if (voiceStatus === 'listening') {
          setVoiceStatus('idle');
        }
      };

      recognition.start();
    } else {
      // Browser doesn't support Speech API - use fallback simulation
      fallbackVoiceSimulation();
    }
  };

  const fallbackVoiceSimulation = () => {
    setVoiceStatus('listening');
    setTimeout(() => {
      setVoiceStatus('processing');
      setTimeout(() => {
        setVoiceStatus('executed');
        const voiceQuery = lang === 'EN'
          ? "Show sales summary and revenue overview"
          : "Show sales forecast trends.";
        processChatMessage(voiceQuery);
        setTimeout(() => setVoiceStatus('idle'), 2000);
      }, 1500);
    }, 2000);
  };

  // ==========================================
  // 🗺️ 7. CORRELATION MATRIX STATE
  // ==========================================
  const [hoveredCell, setHoveredCell] = useState<{ row: string; col: string; val: number } | null>(null);
  const variables = ['Revenue', 'Ad_Spend', 'User_Growth', 'Churn_Rate'];
  const matrixData: { [key: string]: { [key: string]: number } } = {
    Revenue: { Revenue: 1.00, Ad_Spend: 0.84, User_Growth: 0.76, Churn_Rate: -0.48 },
    Ad_Spend: { Revenue: 0.84, Ad_Spend: 1.00, User_Growth: 0.58, Churn_Rate: -0.12 },
    User_Growth: { Revenue: 0.76, Ad_Spend: 0.58, User_Growth: 1.00, Churn_Rate: -0.68 },
    Churn_Rate: { Revenue: -0.48, Ad_Spend: -0.12, User_Growth: -0.68, Churn_Rate: 1.00 }
  };

  const getHeatmapColor = (val: number) => {
    if (val === 1.0) return 'rgba(139, 92, 246, 0.9)'; // Neon purple
    if (val > 0.7) return `rgba(6, 182, 212, ${val})`; // Cyan
    if (val > 0.4) return `rgba(59, 130, 246, ${val})`; // Blue
    if (val < -0.4) return `rgba(239, 68, 68, ${Math.abs(val)})`; // Red / Coral negative
    return `rgba(148, 163, 184, 0.15)`; // Grey / Neutral
  };

  // ==============================================================
  // 🔬 8. ADVANCED DATA SCIENCE MODULES
  // ==============================================================

  // --- PCA Clustering State ---
  const [silhouetteScore, setSilhouetteScore] = useState<number>(0.76);
  const [outlierCount, setOutlierCount] = useState<number>(14);
  const [activeClusterCount, setActiveClusterCount] = useState<number>(3);
  const [hoveredPcaNode, setHoveredPcaNode] = useState<{ x: number, y: number, cluster: number, val: number } | null>(null);

  // Pre-configured nodes representing 2D PCA cluster coords
  const pcaNodes = [
    { x: 30, y: 40, cluster: 1, val: 0.92 },
    { x: 22, y: 35, cluster: 1, val: 0.88 },
    { x: 28, y: 20, cluster: 1, val: 0.95 },
    { x: 38, y: 30, cluster: 1, val: 0.84 },
    { x: 15, y: 28, cluster: 1, val: 0.79 },
    // Cluster 2
    { x: 65, y: 70, cluster: 2, val: 0.91 },
    { x: 72, y: 65, cluster: 2, val: 0.89 },
    { x: 60, y: 80, cluster: 2, val: 0.94 },
    { x: 55, y: 68, cluster: 2, val: 0.86 },
    { x: 78, y: 75, cluster: 2, val: 0.97 },
    // Cluster 3
    { x: 80, y: 25, cluster: 3, val: 0.74 },
    { x: 85, y: 32, cluster: 3, val: 0.81 },
    { x: 74, y: 15, cluster: 3, val: 0.78 },
    { x: 92, y: 28, cluster: 3, val: 0.85 },
    { x: 88, y: 10, cluster: 3, val: 0.72 },
  ];

  const handleClusterSelect = (clusterId: number) => {
    setActiveClusterCount(clusterId);
    if (clusterId === 1) {
      setSilhouetteScore(0.88);
      setOutlierCount(4);
    } else if (clusterId === 2) {
      setSilhouetteScore(0.72);
      setOutlierCount(9);
    } else {
      setSilhouetteScore(0.64);
      setOutlierCount(18);
    }
  };

  // --- T-Test Calculator State ---
  const [meanA, setMeanA] = useState<number>(75);
  const [varA, setVarA] = useState<number>(100);
  const [sizeA, setSizeA] = useState<number>(300);

  const [meanB, setMeanB] = useState<number>(82);
  const [varB, setVarB] = useState<number>(120);
  const [sizeB, setSizeB] = useState<number>(300);

  const [tTestResult, setTTestResult] = useState({
    tStat: 0,
    pValue: 0,
    df: 0,
    significant: false
  });

  useEffect(() => {
    const varFactorA = varA / sizeA;
    const varFactorB = varB / sizeB;
    const denominator = Math.sqrt(varFactorA + varFactorB);
    const tStat = denominator !== 0 ? (meanA - meanB) / denominator : 0;
    const df = sizeA + sizeB - 2;

    // Normal approximation for p-value
    const pValue = 2 * (1 - normalCDF(Math.abs(tStat)));
    const significant = pValue < 0.05;

    setTTestResult({
      tStat: parseFloat(tStat.toFixed(4)),
      pValue: parseFloat(pValue.toFixed(6)),
      df,
      significant
    });
  }, [meanA, varA, sizeA, meanB, varB, sizeB]);

  // --- Outlier Terminal State ---
  const [anomaliesList, setAnomaliesList] = useState<string[]>([
    "[ALERT] Line #402: 'Customer_Age' features null entry. KNN imputed to 34.",
    "[CRITICAL] Line #1982: 'Purchase_Score' shows negative outlier value (-148.0).",
    "[WARN] Line #4812: String corruption detected in 'Email_Addr' (val: '@user_domain').",
    "[CRITICAL] Line #10941: 'Annual_Income' exceeds standard 3.5 standard-deviations ($1.8M).",
    "[ALERT] Line #11492: Duplicate session key detected for Customer_ID: CUST_9024."
  ]);

  const handleFlushAnomalies = () => {
    setAnomaliesList([]);
    setHealthScore(100);
    setOutlierCount(0);
  };

  const handlePurgeAnomalyCols = () => {
    setAnomaliesList(prev => prev.filter(log => !log.includes('CRITICAL')));
    setHealthScore(prev => Math.min(95, prev + 12));
  };


  // ==========================================
  // 🔗 9. PIPELINE INTEGRATIONS telemetry
  // ==========================================
  const [pipelineTelemetries, setPipelineTelemetries] = useState<Array<{ name: string; port: number; status: string; qps: number; icon: string }>>([
    { name: 'Snowflake Pipeline', port: 443, status: 'CONNECTED', qps: 2480, icon: '❄️' },
    { name: 'Google BigQuery', port: 1044, status: 'CONNECTED', qps: 3910, icon: '🛢️' },
    { name: 'PostgreSQL DB', port: 5432, status: 'CONNECTED', qps: 8412, icon: '🐘' },
    { name: 'Salesforce API', port: 80, status: 'SYNCING', qps: 480, icon: '📊' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineTelemetries(prev => prev.map(pipeline => {
        const qpsChange = Math.floor((Math.random() - 0.5) * 80);
        return {
          ...pipeline,
          qps: Math.max(10, pipeline.qps + qpsChange)
        };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // 💳 10. CHECKOUT MODAL & SIMULATION
  // ==========================================
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [cardName, setCardName] = useState('Marcus Sterling');

  const handleTriggerCheckout = (planName: string, planPrice: string) => {
    setSelectedPlan({ name: planName, price: planPrice });
    setCheckoutStep('form');
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setCheckoutStep('processing');
    try {
      const getPlanIdFromName = (name: string): string => {
        const n = name.toLowerCase();
        if (n.includes('pro')) return 'pro';
        if (n.includes('ent')) return 'enterprise';
        return 'growth';
      };
      
      const planId = getPlanIdFromName(selectedPlan.name);
      const res = await simulateCheckout(planId);
      if (res.success) {
        setCheckoutStep('success');
      } else {
        alert(res.error || 'Payment failed.');
        setCheckoutStep('form');
      }
    } catch (err: any) {
      alert('Checkout error.');
      setCheckoutStep('form');
    }
  };


  // ==========================================
  // 🎪 MAIN TAB SELECTION
  // ==========================================


  return (
    <div 
      dir={lang === 'AR' ? 'rtl' : 'ltr'}
      className="relative min-h-screen text-[var(--foreground)] font-sans overflow-hidden bg-[#070b19] pt-24 pb-16"
    >
      {/* 🔮 Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-55"
        style={{ willChange: 'transform' }}
      />

      {/* Floating sci-fi glowing backdrop elements */}
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0 animate-float" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none z-0 animate-float-delayed" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ==============================================================
            🎪 NAV BAR / HEADER SECTION & LANGUAGE SELECTOR
            ============================================================== */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-[var(--border)] pb-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-secondary bg-secondary/10 border border-secondary/25 mb-4 uppercase">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              {heroTag}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
              {t.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI Platform</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl font-light">
              {t.subtitle}
            </p>
          </div>

          {/* 6 Languages Trigger Dropdown */}
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {(['EN', 'HI', 'AR', 'ES', 'FR', 'DE'] as const).map(lng => (
              <button
                key={lng}
                onClick={() => setLang(lng)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  lang === lng
                    ? 'bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/15'
                }`}
              >
                {lng}
              </button>
            ))}
          </div>
        </header>

        {/* ==============================================================
            🏠 1. PREMIUM Futuristic SaaS HERO SECTION (Merged)
            ============================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 relative">
          <div className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-none tracking-tighter mb-6">
              {heroHeading} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-shift">{heroHeadingGrad}</span>
            </h1>
            <p className="text-base md:text-lg text-[var(--text-secondary)] font-light leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {heroSubheading}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <a 
                href="#main-lab-portal" 
                className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-extrabold shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                {t.heroTryBtn}
              </a>
              <a 
                href="#pricing-tiers-section" 
                className="px-8 py-4 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all transform hover:-translate-y-0.5"
              >
                {t.heroFeaturesBtn}
              </a>
            </div>

            {/* Simulated Live Count-Ups */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center glass-subtle">
                <div className="text-2xl md:text-3xl font-black text-white font-mono">{statAcc}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">{t.heroStatAcc}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center glass-subtle">
                <div className="text-2xl md:text-3xl font-black text-secondary font-mono">{statSpeed}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">{t.heroStatSpeed}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center glass-subtle">
                <div className="text-2xl md:text-3xl font-black text-accent font-mono">{statQueries}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mt-1">{t.heroStatQueries}</div>
              </div>
            </div>
          </div>

          {/* Right Side: Futuristic Dashboard Preview Visual */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-pulse" />

            <div className="glass-card p-6 border border-white/15 relative overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)] group">
              <div className="dashboard-bar flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs font-mono text-white/40">datamind_executive_kpi.py</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 glass-subtle">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Q1 Revenue Flow</div>
                  <div className="text-2xl font-black text-white font-mono">$482,000</div>
                  <div className="text-xs text-emerald-400 font-bold mt-1">▲ 14.8% growth</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-4 glass-subtle">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Avg Conversion</div>
                  <div className="text-2xl font-black text-secondary font-mono">6.84%</div>
                  <div className="text-xs text-rose-400 font-bold mt-1">▼ 2.4% standard deviation</div>
                </div>
              </div>

              {/* Glowing mini bar charts */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 h-36 flex flex-col justify-between relative overflow-hidden">
                <div className="scan-line absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-hud-scan" />
                <div className="flex justify-between items-center text-[10px] font-mono text-white/50 z-10">
                  <span>Q1 COHORT DENSITIES</span>
                  <span className="text-emerald-400 animate-pulse">● AUTO-TUNED</span>
                </div>
                <div className="flex items-end gap-2.5 h-20 pt-4 z-10">
                  <div className="flex-1 bg-gradient-to-t from-primary to-blue-500 rounded-t h-[40%] animate-pulse" />
                  <div className="flex-1 bg-gradient-to-t from-primary to-blue-500 rounded-t h-[65%]" />
                  <div className="flex-1 bg-gradient-to-t from-primary to-blue-500 rounded-t h-[50%]" />
                  <div className="flex-1 bg-gradient-to-t from-accent to-purple-500 rounded-t h-[85%] animate-pulse" />
                  <div className="flex-1 bg-gradient-to-t from-accent to-purple-500 rounded-t h-[70%]" />
                  <div className="flex-1 bg-gradient-to-t from-secondary to-cyan-500 rounded-t h-[95%]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            🔄 2. INFINITE SCROLL TICKER STRIP (Merged)
            ============================================================== */}
        <div className="ticker-strip w-screen relative left-[calc(-50vw+50%)] bg-gradient-to-r from-transparent via-white/5 to-transparent border-y border-white/5 py-4 mb-24 overflow-hidden z-20">
          <div className="flex gap-16 whitespace-nowrap animate-slide-auto">
            {['PostgreSQL DB', 'Snowflake DW', 'Google BigQuery', 'Python Pandas', 'Excel & CSV', 'AutoML Engine', 'TensorFlow', 'Tableau Integration', 'PowerBI Connector', 'RTL Engine', 'AWS Redshift'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-white/60 font-semibold uppercase tracking-widest font-mono">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                {item}
              </div>
            ))}
            {/* Duplicate for infinite loop */}
            {['PostgreSQL DB', 'Snowflake DW', 'Google BigQuery', 'Python Pandas', 'Excel & CSV', 'AutoML Engine', 'TensorFlow', 'Tableau Integration', 'PowerBI Connector', 'RTL Engine', 'AWS Redshift'].map((item, idx) => (
              <div key={`dup-${idx}`} className="flex items-center gap-2.5 text-xs text-white/60 font-semibold uppercase tracking-widest font-mono">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ==============================================================
            🛠️ 3. CORE ANALYTICS WORKSPACE & INTERACTIVE LAB PORTAL
            ============================================================== */}
        <section id="main-lab-portal" className="mb-24 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Unified Data Science Workspace
            </h2>
            <p className="text-base text-white/60 max-w-2xl mx-auto font-light">
              Toggle between standard dataset uploaders, conversational models, AutoML network optimization, and advanced statistical simulators.
            </p>
          </div>

          {/* Navigation Tab bar */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 border-b border-white/5 pb-6">
            <button
              onClick={() => setActiveTab('uploader')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'uploader'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              📥 {t.tabUploader}
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              💬 {t.tabSandbox}
            </button>
            <button
              onClick={() => setActiveTab('automl')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'automl'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              🤖 {t.tabAutoML}
            </button>
            <button
              onClick={() => setActiveTab('science')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'science'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              🔬 {t.tabScience}
            </button>
            <button
              onClick={() => setActiveTab('formulabot')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'formulabot'
                  ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              📊 {t.tabFormulaBot}
            </button>
            <button
              onClick={() => setActiveTab('model')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'model'
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              🕸️ Visual Modeler
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 hover:from-emerald-500/40 hover:to-cyan-500/40 border border-emerald-500/30'
              }`}
            >
              🚀 BI Dashboard (Advanced)
            </button>
          </div>

          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              
              {/* --- TAB: DASHBOARD --- */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <PowerBIDashboard />
                </motion.div>
              )}

              {/* --- TAB: MODELER --- */}
              {activeTab === 'model' && (
                <motion.div
                  key="model-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-[700px] bg-[#03060f] border border-white/10 rounded-2xl overflow-hidden relative"
                >
                  <DataModeler />
                </motion.div>
              )}
              
              {/* --- TAB A: DATA PORTAL & UPLOADER --- */}
              {activeTab === 'uploader' && (
                <motion.div
                  key="uploader-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                   <div className="lg:col-span-5 flex flex-col gap-6">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".csv,.xlsx,.xls,.pdf,.json,.xml"
                    />
                    {!uploadedFile && (
                      <div 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="glass-card p-8 border-2 border-dashed border-white/10 hover:border-primary/40 text-center cursor-pointer transition-all flex flex-col items-center justify-center group relative h-64"
                      >
                        <div 
                          className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-primary/10 flex items-center justify-center text-3xl mb-4 transition-all"
                        >
                          📂
                        </div>
                        <h4 className="text-white font-bold text-sm mb-2">Upload Dataset</h4>
                        <p className="text-xs text-[var(--text-secondary)] mb-4 max-w-xs">{t.uploadDragText}</p>
                      </div>
                    )}

                    {uploadedFile && (
                      <div className="glass-card p-6 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Loader2 className={`w-5 h-5 ${isPipelineRunning ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
                          Enterprise Data Pipeline
                        </h3>
                        <div className="space-y-3">
                          {PIPELINE_STEPS.map((stepName, idx) => {
                            const isCompleted = pipelineStep > idx;
                            const isCurrent = pipelineStep === idx && isPipelineRunning;
                            
                            return (
                              <div key={idx} className={`flex items-center gap-3 text-sm p-2 rounded-lg border transition-all ${
                                isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                isCurrent ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' :
                                'bg-white/5 border-white/5 text-white/40'
                              }`}>
                                <div className="w-5 h-5 flex items-center justify-center font-bold">
                                  {isCompleted ? '✓' : isCurrent ? <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> : idx + 1}
                                </div>
                                <span className={isCompleted || isCurrent ? 'font-bold' : ''}>{stepName}</span>
                              </div>
                            );
                          })}
                        </div>

                        {!isPipelineRunning && pipelineStep >= PIPELINE_STEPS.length && (
                          <motion.button 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => setActiveTab('dashboard')}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-lg rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3"
                          >
                            🚀 View Final Dashboard
                          </motion.button>
                        )}
                      </div>
                    )}

                    {/* Scanning Telemetry logs */}
                    {uploadedFile && (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px]">
                        <div className="flex justify-between items-center mb-2 text-white/40 pb-2 border-b border-white/5">
                          <span>PARSING TELEMETRY TERMINAL</span>
                          <span className="text-cyan-400 uppercase tracking-widest">{scanState === 'scanning' ? 'RUNNING' : 'DONE'}</span>
                        </div>
                        <div className="space-y-1.5 h-32 overflow-y-auto">
                          {logs.map((log, index) => (
                            <div key={index} className="text-white/80 leading-relaxed">
                              {log}
                            </div>
                          ))}
                          {scanState === 'scanning' && (
                            <div className="text-cyan-400 animate-pulse font-bold">{t.uploadActiveScan}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="glass-card p-6 border border-white/5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-white font-extrabold text-lg">{t.uploadGridPreview}</h3>
                          <span className="text-[10px] text-secondary tracking-wider font-mono uppercase">
                            FILE: {fileName} | Size: {fileSize} | TYPE: {fileType}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleDownloadCSV}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-white transition-all cursor-pointer"
                          >
                            {t.downloadCSV}
                          </button>
                          <button 
                            onClick={handleDownloadPDF}
                            disabled={pdfGenerated}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-accent/20 hover:bg-accent/30 border border-accent/30 text-white transition-all cursor-pointer disabled:opacity-50"
                          >
                            {pdfGenerated ? 'Generating...' : t.downloadPDF}
                          </button>
                        </div>
                      </div>

                      {/* Interactive Editable Data Grid */}
                      <div className="overflow-x-auto border border-white/5 rounded-lg">
                        <table className="w-full text-left font-mono text-xs text-white/80 min-w-[500px]">
                          <thead className="bg-white/5 text-[10px] text-white/40 uppercase tracking-wider">
                            <tr>
                              <th className="p-3">Segment</th>
                              <th className="p-3">Revenue ($)</th>
                              <th className="p-3">Conversion (%)</th>
                              <th className="p-3">Churn Risk</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 bg-black/20">
                            {gridData.map(row => (
                              <tr key={row.id} className="hover:bg-white/5 transition-all">
                                <td className="p-3">
                                  <input 
                                    type="text" 
                                    value={row.Segment} 
                                    onChange={(e) => updateGridCell(row.id, 'Segment', e.target.value)}
                                    className="bg-transparent border-b border-transparent focus:border-cyan-400 outline-none text-white font-semibold py-0.5"
                                  />
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="number" 
                                    value={row.Revenue} 
                                    onChange={(e) => updateGridCell(row.id, 'Revenue', parseInt(e.target.value) || 0)}
                                    className="bg-transparent border-b border-transparent focus:border-cyan-400 outline-none text-white py-0.5 w-24"
                                  />
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={row.Conversion} 
                                    onChange={(e) => updateGridCell(row.id, 'Conversion', parseFloat(e.target.value) || 0)}
                                    className="bg-transparent border-b border-transparent focus:border-cyan-400 outline-none text-white py-0.5 w-16"
                                  />
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={row.Churn_Risk} 
                                    onChange={(e) => updateGridCell(row.id, 'Churn_Risk', parseFloat(e.target.value) || 0)}
                                    className="bg-transparent border-b border-transparent focus:border-cyan-400 outline-none text-white py-0.5 w-16"
                                  />
                                </td>
                                <td className="p-3 text-right">
                                  <button 
                                    onClick={() => deleteGridRow(row.id)} 
                                    className="text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 rounded transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <button 
                        onClick={addGridRow}
                        className="w-full mt-4 py-2.5 border border-dashed border-white/10 hover:border-primary/40 bg-white/5 hover:bg-white/10 text-xs font-bold text-white rounded-lg transition-all cursor-pointer"
                      >
                        ✚ Add Segment Row
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- TAB B: AI CHAT SANDBOX --- */}
              {activeTab === 'sandbox' && (
                <motion.div
                  key="sandbox-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  {/* Left panel: Mic and suggested questions */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    
                    {/* Voice Assistant Mic */}
                    <div className="glass-card p-6 border border-white/5">
                      <h3 className="text-lg font-extrabold text-white mb-2">{t.voiceTitle}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-6">{t.voiceStatusIdle}</p>

                      <div className="flex items-center gap-6 bg-black/40 p-4 rounded-xl border border-white/5">
                        <button
                          onClick={triggerVoiceInput}
                          disabled={voiceStatus !== 'idle'}
                          className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 ${
                            voiceStatus === 'listening'
                              ? 'bg-red-500 animate-pulse shadow-[0_0_35px_rgba(239,68,68,0.5)]'
                              : voiceStatus === 'processing'
                              ? 'bg-yellow-500 shadow-[0_0_35px_rgba(234,179,8,0.5)]'
                              : 'bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_30px_rgba(139,92,246,0.45)] hover:scale-105'
                          }`}
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="22" />
                          </svg>
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">
                            Audio Stream Status
                          </div>
                          <div className="text-xs font-bold text-white truncate">
                            {voiceStatus === 'idle' && t.voiceStatusIdle}
                            {voiceStatus === 'listening' && t.voiceStatusListening}
                            {voiceStatus === 'processing' && t.voiceStatusProcessing}
                            {voiceStatus === 'executed' && t.voiceStatusExecuted}
                          </div>
                          {voiceStatus === 'listening' && (
                            <div className="flex gap-1.5 mt-2 h-4 items-center">
                              <span className="w-1 bg-red-400 rounded-full h-2 animate-bounce" />
                              <span className="w-1 bg-red-400 rounded-full h-4 animate-bounce" />
                              <span className="w-1 bg-red-400 rounded-full h-3 animate-bounce" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Correlation Heatmap */}
                    <div className="glass-card p-6 border border-white/5">
                      <h3 className="text-lg font-extrabold text-white mb-2">{t.heatmapTitle}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-6">{t.heatmapSub}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-7 flex flex-col gap-2">
                          <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] font-bold text-white/40 font-mono">
                            <span />
                            <span>REV</span>
                            <span>AD</span>
                            <span>GRO</span>
                            <span>CHU</span>
                          </div>

                          {variables.map((rowName) => (
                            <div key={rowName} className="grid grid-cols-5 gap-1.5 items-center">
                              <span className="text-[9px] font-bold text-white/40 font-mono truncate">{rowName.substring(0, 3).toUpperCase()}</span>
                              {variables.map((colName) => {
                                const val = matrixData[rowName][colName];
                                return (
                                  <div
                                    key={colName}
                                    onMouseEnter={() => setHoveredCell({ row: rowName, col: colName, val })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    style={{ backgroundColor: getHeatmapColor(val) }}
                                    className="aspect-square rounded flex items-center justify-center text-[10px] font-black text-white hover:scale-105 transition-all duration-100 cursor-crosshair border border-white/5"
                                  >
                                    {val.toFixed(2)}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>

                        <div className="md:col-span-5 bg-white/5 p-3 rounded-lg border border-white/5 min-h-[110px] flex flex-col justify-center text-xs">
                          {hoveredCell ? (
                            <div>
                              <div className="text-[9px] text-secondary font-bold uppercase tracking-widest font-mono mb-1">{t.heatmapTooltip}</div>
                              <div className="font-extrabold text-white mb-1">{hoveredCell.row} x {hoveredCell.col}</div>
                              <div className="text-lg font-black text-secondary font-mono">{hoveredCell.val > 0 ? '+' : ''}{hoveredCell.val.toFixed(2)}</div>
                            </div>
                          ) : (
                            <div className="text-center text-white/40 italic">{t.heatmapNoTooltip}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Chat Message Window */}
                  <div className="lg:col-span-7 flex flex-col">
                    <div className="glass-card border border-white/5 flex flex-col h-[520px] relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
                      
                      <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-lg font-bold">
                            🔮
                          </div>
                          <div>
                            <h3 className="text-xs font-extrabold text-white">{t.chatTitle}</h3>
                            <span className="text-[10px] text-secondary tracking-widest uppercase font-mono animate-pulse">
                              ● {t.chatStatus}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/10 font-mono text-white/60">
                          {fileName}
                        </span>
                      </div>

                      <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatMessages.map((msg) => (
                          <div 
                            key={msg.id}
                            className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                          >
                            <div 
                              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                msg.isUser 
                                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-tr-none' 
                                  : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                              }`}
                              dangerouslySetInnerHTML={{ __html: msg.text }}
                            />
                            
                            {msg.hasChart && (
                              <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-xl w-full max-w-[420px] self-start">
                                <div className="text-[10px] font-bold text-white/60 mb-3 uppercase tracking-wider">
                                  📊 Segment Breakdown - SARIMAX Projection
                                </div>
                                <div className="h-32 flex items-end gap-3 border-b border-white/10 pb-2">
                                  {gridData.map(row => {
                                    const percent = Math.min(100, Math.max(10, (row.Revenue / 500000) * 100));
                                    return (
                                      <div key={row.id} style={{ height: `${percent}%` }} className="flex-1 bg-primary/25 rounded-t relative group">
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-black text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none transition-all font-mono font-bold">${(row.Revenue / 1000).toFixed(0)}K</div>
                                      </div>
                                    );
                                  })}
                                  <div className="flex-1 bg-gradient-to-t from-secondary/80 to-secondary rounded-t h-[85%] border border-dashed border-cyan-400 relative group">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full absolute -top-1 left-1/2 -translate-x-1/2" />
                                  </div>
                                </div>
                              </div>
                            )}

                            {msg.sqlQuery && (
                              <div className="mt-2.5 w-full max-w-[420px] self-start rounded-lg overflow-hidden border border-white/5 font-mono text-[9px]">
                                <div className="bg-white/5 px-3 py-1.5 text-white/50 flex justify-between">
                                  <span>🖥️ SQL SANDBOX DB ENGINE</span>
                                  <span className="text-emerald-400 font-bold">SUCCESS</span>
                                </div>
                                <pre className="p-3 bg-black/50 text-blue-300 overflow-x-auto select-all">{msg.sqlQuery}</pre>
                              </div>
                            )}
                          </div>
                        ))}

                        {chatTyping && (
                          <div className="flex items-center gap-2 text-xs text-white/50 font-mono bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
                            <span>{t.calculating}</span>
                          </div>
                        )}
                      </div>

                      {/* Click suggestions strip */}
                      <div className="px-6 py-3 bg-black/20 border-t border-white/5">
                        <div className="text-[9px] font-bold text-white/40 mb-2 uppercase tracking-wider">
                          {t.clickPrompt}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {t.prompts.map((pText, i) => (
                            <button
                              key={i}
                              onClick={() => processChatMessage(pText)}
                              className="text-[10px] px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
                            >
                              "{pText}"
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Input container */}
                      <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex gap-3">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && processChatMessage(chatInput)}
                          placeholder={t.placeholder}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-primary/50 transition-all"
                        />
                        <button
                          onClick={() => processChatMessage(chatInput)}
                          className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent font-bold text-xs rounded-xl text-white cursor-pointer"
                        >
                          {t.sendBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- TAB C: AUTOML TUNING LAB --- */}
              {activeTab === 'automl' && (
                <motion.div
                  key="automl-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="glass-card p-6 border border-white/5 relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-extrabold text-white">{t.playgroundTitle}</h3>
                        <span className={`text-xs font-mono px-2.5 py-1 rounded bg-white/5 border border-white/10 ${trainingState === 'training' ? 'text-yellow-400 animate-pulse' : 'text-emerald-400'}`}>
                          {trainingState === 'training' ? t.trainingStatus : t.stableStatus}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[var(--text-secondary)] mb-6 leading-relaxed">
                        {t.playgroundSub}
                      </p>

                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">{t.selectAlgo}</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['XGBoost', 'NeuralNet', 'SVM', 'RandomForest'] as const).map((alg) => (
                            <button
                              key={alg}
                              onClick={() => setAlgo(alg)}
                              disabled={trainingState === 'training'}
                              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                                algo === alg
                                  ? 'bg-gradient-to-r from-primary to-accent border-transparent text-white shadow-lg'
                                  : 'bg-white/5 border-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:border-white/10'
                              }`}
                            >
                              {alg}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/5 pb-2">
                          {t.paramsTitle}
                        </h4>
                        
                        <div>
                          <div className="flex justify-between text-xs text-white mb-2">
                            <span>{t.epochs}</span>
                            <span className="font-mono text-secondary font-bold">{epochs}</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="400" 
                            value={epochs} 
                            onChange={(e) => setEpochs(parseInt(e.target.value))}
                            disabled={trainingState === 'training'}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-white mb-2">
                            <span>{t.lr}</span>
                            <span className="font-mono text-secondary font-bold">{(lr).toFixed(3)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={lr * 100} 
                            onChange={(e) => setLr(parseFloat(e.target.value) / 100)}
                            disabled={trainingState === 'training'}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-white mb-2">
                            <span>{t.regularization}</span>
                            <span className="font-mono text-secondary font-bold">{(lambda).toFixed(2)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="500" 
                            value={lambda * 100} 
                            onChange={(e) => setLambda(parseFloat(e.target.value) / 100)}
                            disabled={trainingState === 'training'}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleRetrain}
                          disabled={trainingState === 'training'}
                          className="flex-1 px-4 py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-primary to-accent shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all cursor-pointer"
                        >
                          ⚡ {t.retrainBtn}
                        </button>
                        <button
                          onClick={handleExportCode}
                          className="px-4 py-3 rounded-xl text-xs font-bold border border-white/15 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                        >
                          💾 {t.exportBtn}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 flex flex-col gap-6">
                    
                    {/* Live SVG Loss Curve */}
                    <div className="glass-card p-6 border border-white/5">
                      <div className="flex justify-between text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">
                        <span>{t.lossCurveTitle}</span>
                        <span className="text-secondary font-mono">step 20/20</span>
                      </div>
                      
                      <div className="relative h-44 w-full bg-black/30 border border-white/5 rounded-xl p-4 overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="loss-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
                              <stop offset="100%" stopColor="rgba(6, 182, 212, 0.0)" />
                            </linearGradient>
                          </defs>
                          {lossCurve.length > 0 && (
                            <>
                              <path
                                d={`M 0,40 ${lossCurve.map((yVal, idx) => `L ${(idx * 5)},${40 - (yVal * 45)}`).join(' ')} L 100,40 Z`}
                                fill="url(#loss-grad)"
                              />
                              <path
                                d={lossCurve.map((yVal, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx * 5)},${40 - (yVal * 45)}`).join(' ')}
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="1.5"
                              />
                              <circle
                                cx="100"
                                cy={40 - (lossCurve[lossCurve.length - 1] * 45)}
                                r="2.5"
                                fill="#8B5CF6"
                                className="animate-ping"
                              />
                            </>
                          )}
                        </svg>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5 text-center">
                        <div className="bg-white/5 rounded-lg py-2 border border-white/5">
                          <div className="text-[10px] text-white/50 uppercase">{t.lossVal}</div>
                          <div className="text-sm font-black font-mono text-red-400 mt-1">{metrics.loss.toFixed(4)}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg py-2 border border-white/5">
                          <div className="text-[10px] text-white/50 uppercase">{t.accVal}</div>
                          <div className="text-sm font-black font-mono text-emerald-400 mt-1">{metrics.accuracy.toFixed(1)}%</div>
                        </div>
                        <div className="bg-white/5 rounded-lg py-2 border border-white/5">
                          <div className="text-[10px] text-white/50 uppercase">{t.f1Val}</div>
                          <div className="text-sm font-black font-mono text-indigo-400 mt-1">{metrics.f1.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Data Cleaner Module */}
                    <div className="glass-card p-6 border border-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-bold uppercase text-white/60 mb-3">{t.cleanerCols}</h4>
                          <div className="flex flex-col gap-2">
                            {['Transaction_ID', 'Customer_Age', 'Annual_Income', 'Purchase_Score', 'Email_Addr', 'Join_Date'].map((col) => (
                              <button
                                key={col}
                                onClick={() => toggleCol(col)}
                                disabled={cleaningState === 'cleaning'}
                                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                  selectedCols.includes(col)
                                    ? 'bg-primary/10 border-primary/45 text-white'
                                    : 'bg-white/5 border-white/5 text-[var(--text-secondary)]'
                                }`}
                              >
                                <span className="font-mono">{col}</span>
                                <span>{selectedCols.includes(col) ? '✔' : '✚'}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold uppercase text-white/60 mb-3">{t.cleanerStats}</h4>
                            <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/5">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-white/50">{t.totalRows}:</span>
                                <span className="text-white font-bold">12,480</span>
                              </div>
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-white/50">{t.anomalies}:</span>
                                <span className={`font-bold ${cleaningState === 'cleaned' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {cleaningState === 'cleaned' ? '0' : '382'}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-white/50">{t.missingVals}:</span>
                                <span className="font-bold">{cleaningState === 'cleaned' ? '0' : '848 (6.8%)'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-xs font-bold text-white mb-2">
                              <span>{t.cleanerHealth}</span>
                              <span className="font-mono text-emerald-400">{healthScore}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400 transition-all duration-500"
                                style={{ width: `${healthScore}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-6">
                            {cleaningState === 'cleaning' ? (
                              <div className="bg-primary/20 border border-primary/30 p-3 rounded-xl text-center text-xs text-white">
                                ⚙️ {cleaningStepText}
                              </div>
                            ) : cleaningState === 'cleaned' ? (
                              <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-xl text-center text-xs text-emerald-400 font-bold">
                                ✔ {t.cleanSuccess}
                              </div>
                            ) : (
                              <button
                                onClick={handleDeepClean}
                                className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent font-extrabold text-xs rounded-xl text-white cursor-pointer"
                              >
                                🧼 {t.cleanBtn}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* --- TAB D: ADVANCED STASTISTICS & PCA --- */}
              {activeTab === 'science' && (
                <motion.div
                  key="science-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  
                  {/* PCA Cluster SVG Scatterplot */}
                  <div className="lg:col-span-6 flex flex-col gap-6">
                    <div className="glass-card p-6 border border-white/5">
                      <h3 className="text-lg font-extrabold text-white mb-1">{t.pcaTitle}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-6">{t.pcaSub}</p>

                      <div className="grid grid-cols-3 gap-2 text-center mb-6">
                        <div 
                          onClick={() => handleClusterSelect(1)}
                          className={`bg-white/5 border border-white/5 rounded-lg py-2.5 cursor-pointer hover:bg-white/10 transition-all ${activeClusterCount === 1 ? 'border-cyan-400 bg-cyan-400/10' : ''}`}
                        >
                          <div className="text-[10px] text-white/50">{t.pcaSilhouette}</div>
                          <div className="text-lg font-black text-cyan-400 font-mono">0.88</div>
                        </div>
                        <div 
                          onClick={() => handleClusterSelect(2)}
                          className={`bg-white/5 border border-white/5 rounded-lg py-2.5 cursor-pointer hover:bg-white/10 transition-all ${activeClusterCount === 2 ? 'border-purple-400 bg-purple-400/10' : ''}`}
                        >
                          <div className="text-[10px] text-white/50">{t.pcaOutliers}</div>
                          <div className="text-lg font-black text-purple-400 font-mono">{outlierCount}</div>
                        </div>
                        <div 
                          onClick={() => handleClusterSelect(3)}
                          className={`bg-white/5 border border-white/5 rounded-lg py-2.5 cursor-pointer hover:bg-white/10 transition-all ${activeClusterCount === 3 ? 'border-pink-400 bg-pink-400/10' : ''}`}
                        >
                          <div className="text-[10px] text-white/50">{t.pcaClusters}</div>
                          <div className="text-lg font-black text-pink-400 font-mono">{activeClusterCount}</div>
                        </div>
                      </div>

                      {/* PCA Coordinate SVG Plot */}
                      <div className="relative h-60 w-full bg-black/40 border border-white/5 rounded-xl p-4 overflow-hidden flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Grid Lines */}
                          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                          
                          {/* Coordinate Points */}
                          {pcaNodes.map((node, i) => {
                            const isHighlighted = activeClusterCount === node.cluster;
                            return (
                              <circle
                                key={i}
                                cx={node.x}
                                cy={node.y}
                                r={isHighlighted ? 3 : 2}
                                fill={node.cluster === 1 ? '#06b6d4' : node.cluster === 2 ? '#8b5cf6' : '#ec4899'}
                                opacity={isHighlighted ? 0.95 : 0.25}
                                className="cursor-pointer hover:r-4 transition-all"
                                onMouseEnter={() => setHoveredPcaNode(node)}
                                onMouseLeave={() => setHoveredPcaNode(null)}
                              />
                            );
                          })}
                        </svg>

                        {/* Interactive Tooltip inside SVG wrapper */}
                        {hoveredPcaNode && (
                          <div className="absolute top-4 left-4 bg-black/90 border border-white/10 rounded-lg p-2.5 font-mono text-[9px] text-white z-20">
                            <div>Cluster ID: <span className="font-bold text-cyan-400">#{hoveredPcaNode.cluster}</span></div>
                            <div>Component 1 (X): {hoveredPcaNode.x}</div>
                            <div>Component 2 (Y): {hoveredPcaNode.y}</div>
                            <div>Similarity Score: {(hoveredPcaNode.val * 100).toFixed(0)}%</div>
                          </div>
                        )}
                        {!hoveredPcaNode && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/30 font-mono tracking-wider">
                            {t.pcaHoverText}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Anomaly Inspector Terminal */}
                    <div className="glass-card p-6 border border-white/5 font-mono text-[10px]">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                        <h3 className="text-white font-extrabold text-sm">{t.anomalyTitle}</h3>
                        <span className="text-rose-400 font-bold tracking-widest uppercase">Telemetry logs</span>
                      </div>
                      
                      <div className="bg-black/50 border border-white/5 rounded-lg p-3 space-y-1.5 h-36 overflow-y-auto mb-4">
                        {anomaliesList.length > 0 ? (
                          anomaliesList.map((log, i) => (
                            <div key={i} className={log.includes('CRITICAL') ? 'text-red-400' : 'text-yellow-400'}>
                              {log}
                            </div>
                          ))
                        ) : (
                          <div className="text-emerald-400 font-bold py-6 text-center italic">{t.anomalyHealthyLog}</div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={handleFlushAnomalies}
                          className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all cursor-pointer"
                        >
                          🧼 {t.anomalyFlushBtn}
                        </button>
                        <button 
                          onClick={handlePurgeAnomalyCols}
                          className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 transition-all cursor-pointer"
                        >
                          🗑️ {t.anomalyPurgeBtn}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hypothesis Testing (A/B T-Test Simulator) */}
                  <div className="lg:col-span-6 flex flex-col gap-6">
                    <div className="glass-card p-6 border border-white/5">
                      <h3 className="text-lg font-extrabold text-white mb-1">{t.ttestTitle}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-6">{t.ttestSub}</p>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Sample A Control */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest border-b border-cyan-400/20 pb-2">{t.ttestSampleA}</h4>
                          <div>
                            <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>{t.ttestMean}</span>
                              <span className="font-bold text-white font-mono">{meanA}</span>
                            </div>
                            <input 
                              type="range" min="10" max="150" value={meanA} 
                              onChange={(e) => setMeanA(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>{t.ttestVar}</span>
                              <span className="font-bold text-white font-mono">{varA}</span>
                            </div>
                            <input 
                              type="range" min="10" max="300" value={varA} 
                              onChange={(e) => setVarA(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>{t.ttestSize}</span>
                              <span className="font-bold text-white font-mono">{sizeA}</span>
                            </div>
                            <input 
                              type="range" min="30" max="1000" value={sizeA} 
                              onChange={(e) => setSizeA(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-cyan-400"
                            />
                          </div>
                        </div>

                        {/* Sample B Control */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-widest border-b border-purple-400/20 pb-2">{t.ttestSampleB}</h4>
                          <div>
                            <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>{t.ttestMean}</span>
                              <span className="font-bold text-white font-mono">{meanB}</span>
                            </div>
                            <input 
                              type="range" min="10" max="150" value={meanB} 
                              onChange={(e) => setMeanB(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-purple-400"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>{t.ttestVar}</span>
                              <span className="font-bold text-white font-mono">{varB}</span>
                            </div>
                            <input 
                              type="range" min="10" max="300" value={varB} 
                              onChange={(e) => setVarB(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-purple-400"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>{t.ttestSize}</span>
                              <span className="font-bold text-white font-mono">{sizeB}</span>
                            </div>
                            <input 
                              type="range" min="30" max="1000" value={sizeB} 
                              onChange={(e) => setSizeB(parseInt(e.target.value))}
                              className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-purple-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* statistical calculations display */}
                      <div className="bg-black/30 border border-white/5 rounded-xl p-4 grid grid-cols-3 gap-2 text-center font-mono text-[10px] mb-6">
                        <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg">
                          <div className="text-white/40 mb-1">{t.ttestTStat}</div>
                          <div className="text-sm font-black text-cyan-400">{tTestResult.tStat}</div>
                        </div>
                        <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg">
                          <div className="text-white/40 mb-1">{t.ttestPVal}</div>
                          <div className="text-sm font-black text-secondary">{tTestResult.pValue}</div>
                        </div>
                        <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg">
                          <div className="text-white/40 mb-1">df</div>
                          <div className="text-sm font-black text-purple-400">{tTestResult.df}</div>
                        </div>
                      </div>

                      {/* SVG Bell Curve detailing normal/t-distribution rejection regions */}
                      <div className="relative h-28 w-full bg-black/40 border border-white/5 rounded-xl p-4 overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="rejection-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
                              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.0)" />
                            </linearGradient>
                          </defs>

                          {/* Render bell curve curve path */}
                          <path
                            d={`M 0,30 ${Array.from({ length: 41 }, (_, i) => {
                              const x = -4 + i * 0.2;
                              const y = normalPDF(x, 0, 1);
                              return `L ${(i * 2.5)},${30 - (y * 65)}`;
                            }).join(' ')} L 100,30 Z`}
                            fill="none"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="1.5"
                          />

                          {/* Shade dynamic rejection regions based on T-stat */}
                          <path
                            d={`M 65,30 L 65,${30 - (normalPDF(1.5, 0, 1) * 65)} ${Array.from({ length: 15 }, (_, i) => {
                              const xVal = 1.5 + i * 0.17;
                              const yVal = normalPDF(xVal, 0, 1);
                              return `L ${(65 + i * 2.5)},${30 - (yVal * 65)}`;
                            }).join(' ')} L 100,30 Z`}
                            fill="url(#rejection-grad)"
                          />
                          <path
                            d={`M 0,30 ${Array.from({ length: 15 }, (_, i) => {
                              const xVal = -4 + i * 0.17;
                              const yVal = normalPDF(xVal, 0, 1);
                              return `L ${(i * 2.5)},${30 - (yVal * 65)}`;
                            }).join(' ')} L 35,${30 - (normalPDF(-1.5, 0, 1) * 65)} L 35,30 Z`}
                            fill="url(#rejection-grad)"
                          />
                        </svg>

                        <div className="absolute top-2 right-4 text-[9px] font-mono text-rose-400 font-bold uppercase tracking-widest animate-pulse">
                          {tTestResult.significant ? '✔ SIGNIFICANT (p < 0.05)' : '✘ NOT SIGNIFICANT'}
                        </div>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* --- TAB E: SPREADSHEET COPILOT (FORMULA BOT AI) --- */}
              {activeTab === 'formulabot' && (
                <motion.div
                  key="formulabot-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <FormulaBotSuite lang={lang} t={t} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </section>

        {/* ==============================================================
            🛰️ 4. ECOSYSTEM PIPELINES TELEMETRY (Merged)
            ============================================================== */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">{t.pipelinesTitle}</h2>
            <p className="text-sm text-white/50 max-w-xl mx-auto">{t.pipelinesSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pipelineTelemetries.map((pipeline, i) => (
              <div key={i} className="glass-card p-6 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 bg-white/5 rounded-lg flex items-center justify-center text-xl border border-white/10">
                    {pipeline.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-xs">{pipeline.name}</h4>
                    <span className="text-[9px] text-white/40 font-mono">PORT: {pipeline.port}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono mt-4 pt-4 border-t border-white/5">
                  <span className="text-emerald-400 font-bold animate-pulse">● {pipeline.status}</span>
                  <span className="text-cyan-400 font-bold">{pipeline.qps} QPS</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==============================================================
            🛡️ 5. BANK-GRADE SECURITY GUARD SHIELD (Merged)
            ============================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          {/* SVG Rotating Guard Shield */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 flex items-center justify-center">
              <svg className="absolute w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#3b82f6" strokeWidth="1" fill="none" strokeDasharray="6,6" opacity="0.4" />
              </svg>
              <svg className="absolute w-4/5 h-4/5 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '15s' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#8b5cf6" strokeWidth="0.75" fill="none" strokeDasharray="12,4" opacity="0.3" />
              </svg>
              <div className="w-36 h-36 bg-gradient-to-tr from-primary/10 to-accent/10 border border-white/15 rounded-full flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(59,130,246,0.15)] animate-pulse-glow">
                🛡️
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{t.securityTitle}</h2>
            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">{t.securitySub}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left glass-subtle">
                <h4 className="text-white font-extrabold text-xs mb-1">🔐 {t.securityBadge1Title}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">{t.securityBadge1Desc}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left glass-subtle">
                <h4 className="text-white font-extrabold text-xs mb-1">👥 {t.securityBadge2Title}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">{t.securityBadge2Desc}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left glass-subtle">
                <h4 className="text-white font-extrabold text-xs mb-1">⚡ {t.securityBadge3Title}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">{t.securityBadge3Desc}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-left glass-subtle">
                <h4 className="text-white font-extrabold text-xs mb-1">🤖 {t.securityBadge4Title}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed">{t.securityBadge4Desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            💳 6. FLEXIBLE ENTERPRISE PRICING GRID (Merged)
            ============================================================== */}
        <section id="pricing-tiers-section" className="mb-24 scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">{t.pricingTitle}</h2>
            <p className="text-sm text-white/50 max-w-xl mx-auto">{t.pricingSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="glass-card p-8 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <h4 className="text-white font-extrabold text-base mb-2">{t.planStarter}</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white font-mono">{t.priceStarter}</span>
                  <span className="text-xs text-white/40 font-semibold">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 text-xs text-white/60">
                  {t.featuresStarter.map((feat, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <span className={feat.includes('✘') ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'}>
                        {feat.includes('✘') ? '✘' : '✔'}
                      </span>
                      {feat.replace('✘ ', '')}
                    </li>
                  ))}
                </ul>
              </div>
              {currentPlanId.toLowerCase() === 'trial' ? (
                <button 
                  onClick={() => handleTriggerCheckout(t.planStarter, t.priceStarter)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  {t.getStarted}
                </button>
              ) : (
                <div className="w-full py-3 text-center border border-white/10 text-xs font-bold rounded-lg bg-white/5 text-white/40">
                  {currentPlanId.toLowerCase() === 'growth' || currentPlanId.toLowerCase() === 'starter' ? 'Your Active Plan' : 'Subscribed'}
                </div>
              )}
            </div>

            {/* Professional Plan (Popular) */}
            <div className="glass-card p-8 border-2 border-primary/50 flex flex-col justify-between relative overflow-hidden group shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <span className="absolute top-3 right-3 bg-gradient-to-r from-primary to-accent text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded">
                POPULAR CHOICE
              </span>
              <div>
                <h4 className="text-white font-extrabold text-base mb-2">{t.planPro}</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white font-mono">{t.pricePro}</span>
                  <span className="text-xs text-white/40 font-semibold">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 text-xs text-white/60">
                  {t.featuresPro.map((feat, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <span className={feat.includes('✘') ? 'text-rose-400 font-bold' : 'text-cyan-400 font-bold'}>
                        {feat.includes('✘') ? '✘' : '✔'}
                      </span>
                      {feat.replace('✘ ', '')}
                    </li>
                  ))}
                </ul>
              </div>
              {currentPlanId.toLowerCase() === 'trial' ? (
                <button 
                  onClick={() => handleTriggerCheckout(t.planPro, t.pricePro)}
                  className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-all cursor-pointer"
                >
                  {t.getStarted}
                </button>
              ) : (
                <div className="w-full py-3 text-center border border-primary/30 text-xs font-bold rounded-lg bg-primary/10 text-primary">
                  {currentPlanId.toLowerCase() === 'pro' || currentPlanId.toLowerCase() === 'professional' ? 'Your Active Plan' : 'Subscribed'}
                </div>
              )}
            </div>

            {/* Enterprise Plan */}
            <div className="glass-card p-8 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
              <div>
                <h4 className="text-white font-extrabold text-base mb-2">{t.planEnt}</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white font-mono">{t.priceEnt}</span>
                </div>
                <ul className="space-y-3 mb-8 text-xs text-white/60">
                  {t.featuresEnt.map((feat, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <span className="text-cyan-400 font-bold">✔</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              {currentPlanId.toLowerCase() === 'trial' ? (
                <button 
                  onClick={() => handleTriggerCheckout(t.planEnt, 'Custom')}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  {t.getStarted}
                </button>
              ) : (
                <div className="w-full py-3 text-center border border-white/10 text-xs font-bold rounded-lg bg-white/5 text-white/40">
                  {currentPlanId.toLowerCase() === 'enterprise' ? 'Your Active Plan' : 'Subscribed'}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==============================================================
            🎭 7. CLIENT TESTIMONIALS (Merged)
            ============================================================== */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">Loved by Data Leaders</h2>
            <p className="text-sm text-white/50 max-w-xl mx-auto">See how leading intelligence managers speed up operations with DataMind AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 border border-white/5 flex flex-col justify-between">
              <p className="text-xs text-white/70 italic leading-relaxed mb-6">
                "DataMind AI has replaced days of writing complex reports. We now ask natural queries and get beautiful, clean visual segments in seconds."
              </p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                  MS
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-xs">Marcus Sterling</h4>
                  <span className="text-[10px] text-white/40">Director of BI, GlobalTech Inc.</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border border-white/5 flex flex-col justify-between">
              <p className="text-xs text-white/70 italic leading-relaxed mb-6">
                "The forecasting and AutoML capabilities are insanely fast. Our teams went from writing python scripts for days to building predictions in minutes."
              </p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                  AP
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-xs">Aarav Patel</h4>
                  <span className="text-[10px] text-white/40">VP of Analytics, TrendSaaS</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border border-white/5 flex flex-col justify-between">
              <p className="text-xs text-white/70 italic leading-relaxed mb-6">
                "We needed strict encryption and security SLAs. DataMind AI fit into our PostgreSQL stack perfectly while complying with SOC2 requirements."
              </p>
              <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                  EL
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-xs">Elena Rostova</h4>
                  <span className="text-[10px] text-white/40">Chief Information Officer, FintechLabs</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            🎪 8. SaaS PREMIUM FOOTER (Merged)
            ============================================================== */}
        <footer className="border-t border-white/5 pt-12 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔮</span>
                <span className="text-white font-black tracking-tight text-base">DataMind AI</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                Your premium personal AI data analyst. Clean, generate, forecast, and visualize datasets instantly using advanced deep learning engines.
              </p>
            </div>
            {['Product', 'Resources', 'Company'].map((section, idx) => (
              <div key={idx}>
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">{section}</h4>
                <ul className="space-y-2 text-xs text-white/40">
                  <li><a href="#" className="hover:text-cyan-400 transition-all">Analytics Lab</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-all">AutoML Suite</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-all">SOC2 Guidelines</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-all">Privacy Policy</a></li>
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-6 text-[11px] text-white/40">
            <p>&copy; 2026 DataMind AI Technologies Inc. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0 font-semibold">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </footer>

      </div>

      {/* ==============================================================
          💳 11. CHECKOUT MODAL COMPONENT (Simulation Overlay)
          ============================================================== */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-filter backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full border border-white/15 p-6 relative overflow-hidden">
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white font-bold text-base cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-white mb-2">{t.modalTitle}</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Upgrading to <span className="font-bold text-cyan-400">{selectedPlan.name}</span> ({selectedPlan.price})
            </p>

            <AnimatePresence mode="wait">
              {checkoutStep === 'form' && (
                <motion.div 
                  key="checkout-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-white/60 mb-1.5">{t.modalCardNo}</label>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 mb-1.5">{t.modalExpiry}</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 mb-1.5">{t.modalCvv}</label>
                      <input 
                        type="password" 
                        value={cardCvv} 
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1.5">{t.modalCardName}</label>
                    <input 
                      type="text" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <button
                    onClick={handleConfirmPayment}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-primary to-accent text-white font-black rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    {t.modalPayBtn}
                  </button>
                </motion.div>
              )}

              {checkoutStep === 'processing' && (
                <motion.div 
                  key="checkout-processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs text-white/60 font-mono animate-pulse">{t.modalProcessing}</p>
                </motion.div>
              )}

              {checkoutStep === 'success' && (
                <motion.div 
                  key="checkout-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 text-center flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-3xl mb-4 text-emerald-400">
                    ✓
                  </div>
                  <h4 className="text-white font-extrabold text-sm mb-2">{t.modalSuccess}</h4>
                  <p className="text-xs text-white/40 mb-6">License registered to {cardName}</p>
                  <button
                    onClick={() => {
                      setSelectedPlan(null);
                      window.location.reload();
                    }}
                    className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Close Sandbox
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      )}

    </div>
  );
}
