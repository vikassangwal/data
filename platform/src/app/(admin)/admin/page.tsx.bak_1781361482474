'use client';

import { useState, useEffect, useRef } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { 
  Users, Eye, TrendingUp, DollarSign, Lock, Unlock, Database, Cpu, 
  Activity, Volume2, Globe, Flame, Save, RefreshCw, AlertTriangle, Play, Ban, ShieldAlert, Key,
  Shield, Plus, Trash2, CheckSquare, Square, Settings, CreditCard, UserCheck, RefreshCw as LoopIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAdminDashboardStats,
  getTeamMembers,
  inviteTeamMember,
  updateUserRole,
  revokeUserAccess,
  updatePlanPricing,
  getTransactions,
  processRefund,
  getAdminSessionDetails
} from '@/app/actions/admin-dashboard';
import { saveSystemSetting, getVaultKeysInfo } from '@/app/actions/vault';
import { getPlanFeaturesMatrix, updatePlanFeaturesMap } from '@/app/actions/auth';

// ==========================================
// 🚀 ORIGINAL PLATFORM DATA STRUCTURES
// ==========================================
const DEFAULT_SERVICES = [
  {
    slug: 'data-analytics',
    title: 'Data Analytics',
    desc: 'Transform raw data into actionable insights with advanced analytics, statistical modeling, and beautiful visualizations.',
    price: '$499',
    color: 'from-blue-500 to-cyan-500',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    features: ['Exploratory data analysis', 'Statistical modeling & forecasting', 'Custom data pipelines', 'Automated reporting'],
  },
  {
    slug: 'dashboard-development',
    title: 'Dashboard Development',
    desc: 'Interactive, real-time dashboards that turn complex datasets into clear visual stories for stakeholders.',
    price: '$799',
    color: 'from-emerald-500 to-teal-500',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    features: ['Real-time data visualization', 'KPI tracking & alerts', 'Multi-source integration', 'Mobile-responsive design'],
  },
  {
    slug: 'business-intelligence',
    title: 'Business Intelligence',
    desc: 'Strategic data-driven decisions powered by comprehensive BI solutions, KPI frameworks, and executive reporting.',
    price: '$999',
    color: 'from-violet-500 to-purple-500',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    features: ['KPI framework design', 'Executive dashboards', 'Competitive analysis', 'Market trend forecasting'],
  },
  {
    slug: 'ai-agent-services',
    title: 'AI Agent Services',
    desc: 'Intelligent automation agents that handle complex tasks, make decisions, and learn from interactions.',
    price: '$1,499',
    color: 'from-amber-500 to-orange-500',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    features: ['Custom AI agent development', 'Multi-agent orchestration', 'Tool & API integration', 'Self-learning capabilities'],
  },
  {
    slug: 'ai-chatbots',
    title: 'AI Chatbots',
    desc: 'Smart conversational bots powered by NLP that engage customers, answer queries, and drive conversions 24/7.',
    price: '$699',
    color: 'from-pink-500 to-rose-500',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    features: ['Natural language processing', 'Multi-platform deployment', 'Knowledge base integration', 'Analytics & insights'],
  },
  {
    slug: 'whatsapp-automation',
    title: 'WhatsApp Automation',
    desc: 'Automated messaging solutions for customer engagement, support, and marketing on WhatsApp Business.',
    price: '$399',
    color: 'from-green-500 to-emerald-500',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    features: ['Bulk message campaigns', 'Automated responses', 'CRM integration', 'Delivery analytics'],
  },
  {
    slug: 'web-automation',
    title: 'Web Automation',
    desc: 'Streamline repetitive workflows with intelligent web scraping, form filling, and process automation.',
    price: '$599',
    color: 'from-cyan-500 to-blue-500',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    features: ['Web scraping & data extraction', 'Browser automation', 'Workflow orchestration', 'Scheduled task execution'],
  },
  {
    slug: 'custom-software',
    title: 'Custom Software',
    desc: 'Tailored software solutions built from the ground up — web apps, APIs, internal tools, and SaaS products.',
    price: '$2,999',
    color: 'from-indigo-500 to-violet-500',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    features: ['Full-stack development', 'API design & integration', 'SaaS product development', 'Scalable architecture'],
  },
];

const DEFAULT_ALL_SERVICES: Record<string, any> = {
  'data-analytics': {
    title: 'Data Analytics', tagline: 'Transform data into insights', desc: 'Unlock the full potential of your data with advanced analytics, statistical modeling, predictive forecasting, and beautiful visualizations that drive smarter business decisions.', price: 499, color: 'from-blue-500 to-cyan-500',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    features: [
      { title: 'Exploratory Analysis', desc: 'Deep-dive into your datasets to uncover hidden patterns and correlations.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      { title: 'Predictive Modeling', desc: 'Machine learning models that forecast trends and future outcomes.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { title: 'Data Pipelines', desc: 'Automated ETL pipelines that clean, transform, and load your data.', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      { title: 'Visualization', desc: 'Interactive charts and dashboards that tell a compelling data story.', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
    ],
    tools: ['Python', 'Pandas', 'NumPy', 'SQL', 'Power BI', 'Tableau', 'Jupyter', 'Apache Spark'],
    addons: [{ name: 'Real-time streaming analytics', price: 300 }, { name: 'Custom ML model', price: 500 }, { name: 'Monthly reporting retainer', price: 200 }],
    testimonials: [
      { name: 'Sarah Chen', role: 'VP of Operations, TechCorp', text: 'The analytics dashboard Alex built increased our decision speed by 3x. Incredible work.', rating: 5 },
    ],
    cases: [
      { title: 'E-commerce Revenue Analytics', desc: 'Built a comprehensive analytics suite for a $10M e-commerce brand.', result: '+34% revenue increase' },
    ],
    faqs: [
      { q: 'What data formats do you work with?', a: 'I work with CSV, JSON, SQL databases, APIs, Excel, Google Sheets, and virtually any structured or semi-structured data source.' },
    ],
  },
  'dashboard-development': {
    title: 'Dashboard Development', tagline: 'Interactive visual dashboards', desc: 'Design and build real-time interactive dashboards that consolidate your key metrics, enable drill-down analysis, and empower stakeholders with self-service analytics.', price: 799, color: 'from-emerald-500 to-teal-500',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    features: [
      { title: 'Real-Time Data', desc: 'Live data feeds that update dashboards in real-time.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { title: 'KPI Tracking', desc: 'Custom KPI widgets with thresholds and alerts.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6' },
    ],
    tools: ['Power BI', 'Tableau', 'React', 'D3.js', 'Plotly', 'SQL'],
    addons: [{ name: 'Additional data source', price: 200 }],
    testimonials: [
      { name: 'Emily Zhang', role: 'COO, RetailMax', text: 'The dashboard transformed how our leadership team makes decisions.', rating: 5 },
    ],
    cases: [
      { title: 'Retail Performance Dashboard', desc: 'Multi-store KPI dashboard with real-time sales tracking.', result: '40% faster decisions' },
    ],
    faqs: [
      { q: 'Which dashboard tools do you use?', a: 'I build with Power BI, Tableau, or custom React-based dashboards.' },
    ],
  },
  'business-intelligence': {
    title: 'Business Intelligence', tagline: 'Strategic data-driven decisions', desc: 'Comprehensive BI solutions that combine executive reporting, competitive analysis, and strategic KPI frameworks to empower leadership with the insights they need.', price: 999, color: 'from-violet-500 to-purple-500',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    features: [
      { title: 'KPI Framework', desc: 'Design metrics that matter for your business goals.', icon: 'M9 19v-6a2 2 0 00-2-2H5v6' },
      { title: 'Executive Reports', desc: 'Board-ready reports with strategic insights.', icon: 'M9 12h6m-6 4h6' },
    ],
    tools: ['Power BI', 'Tableau', 'SQL', 'Looker', 'Snowflake'],
    addons: [{ name: 'Competitor tracking setup', price: 400 }],
    testimonials: [
      { name: 'Robert Williams', role: 'CEO, GrowthCo', text: 'Alex helped us define the KPIs that actually matter.', rating: 5 },
    ],
    cases: [
      { title: 'SaaS Growth Strategy', desc: 'End-to-end BI framework for a Series B SaaS company.', result: '2.5x ARR growth' },
    ],
    faqs: [
      { q: 'What\'s the difference between analytics and BI?', a: 'Analytics focuses on analyzing data, while BI encompasses the strategy.' },
    ],
  },
  'ai-agent-services': {
    title: 'AI Agent Services', tagline: 'Intelligent automation agents', desc: 'Build intelligent AI agents that automate complex workflows, make decisions, integrate with your tools, and continuously improve through learning.', price: 1499, color: 'from-amber-500 to-orange-500',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    features: [
      { title: 'Custom Agents', desc: 'Purpose-built agents for your specific use case.', icon: 'M9.75 17L9 20l-1 1h8' },
      { title: 'Multi-Agent Systems', desc: 'Orchestrated agent teams that collaborate.', icon: 'M17 20h5v-2' },
    ],
    tools: ['LangChain', 'OpenAI', 'Python', 'Pinecone', 'Redis'],
    addons: [{ name: 'Additional agent capability', price: 400 }],
    testimonials: [
      { name: 'James Liu', role: 'CTO, AutomateX', text: 'The AI agent Alex built handles 80% of our support tickets.', rating: 5 },
    ],
    cases: [
      { title: 'Support Agent', desc: 'AI agent handling customer support for an e-commerce platform.', result: '80% ticket resolution' },
    ],
    faqs: [
      { q: 'What LLMs do you use?', a: 'I work with OpenAI GPT-4, Claude, Gemini, and open-source models.' },
    ],
  },
  'ai-chatbots': {
    title: 'AI Chatbots', tagline: 'Smart conversational bots', desc: 'Deploy intelligent conversational AI that engages customers 24/7, answers questions accurately, books appointments, and drives conversions — across web, mobile, and messaging platforms.', price: 699, color: 'from-pink-500 to-rose-500',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    features: [
      { title: 'NLP Engine', desc: 'Understand natural language with high accuracy.', icon: 'M8 12h.01' },
      { title: 'Multi-Platform', desc: 'Deploy on web, WhatsApp, Slack, Telegram.', icon: 'M3 5a2 2 0 012-2h3.28' },
    ],
    tools: ['OpenAI', 'Dialogflow', 'Rasa', 'LangChain', 'Node.js'],
    addons: [{ name: 'Additional platform', price: 200 }],
    testimonials: [
      { name: 'Anna Roberts', role: 'Marketing Dir, ShopEase', text: 'Our chatbot handles 500+ conversations daily.', rating: 5 },
    ],
    cases: [
      { title: 'E-commerce Support Bot', desc: 'AI chatbot for product inquiries and order tracking.', result: '70% query resolution' },
    ],
    faqs: [
      { q: 'What platforms can the chatbot run on?', a: 'Web widget, WhatsApp, Telegram, Slack, Facebook Messenger.' },
    ],
  },
  'whatsapp-automation': {
    title: 'WhatsApp Automation', tagline: 'Automated messaging solutions', desc: 'Leverage WhatsApp Business API to automate customer communications, run marketing campaigns, provide instant support, and drive engagement at scale.', price: 399, color: 'from-green-500 to-emerald-500',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    features: [
      { title: 'Bulk Campaigns', desc: 'Send personalized messages at scale.', icon: 'M3 8l7.89' },
      { title: 'Auto-Replies', desc: 'Instant responses to common queries.', icon: 'M3 10h10' },
    ],
    tools: ['WhatsApp API', 'Twilio', 'Node.js', 'HubSpot', 'Zapier'],
    addons: [{ name: 'CRM integration', price: 200 }],
    testimonials: [
      { name: 'Priya Sharma', role: 'Marketing Head, FashionBay', text: 'Our WhatsApp campaigns now reach 50K customers.', rating: 5 },
    ],
    cases: [
      { title: 'Fashion Brand Campaigns', desc: 'Automated promotional campaigns for a D2C brand.', result: '85% open rate' },
    ],
    faqs: [
      { q: 'Do I need a WhatsApp Business account?', a: 'Yes, I\'ll help you set up and verify your WhatsApp Business API account.' },
    ],
  },
  'web-automation': {
    title: 'Web Automation', tagline: 'Streamline your workflows', desc: 'Eliminate repetitive manual tasks with intelligent web automation — from data scraping and form filling to workflow orchestration and scheduled processes.', price: 599, color: 'from-cyan-500 to-blue-500',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    features: [
      { title: 'Web Scraping', desc: 'Extract data from any website at scale.', icon: 'M4 7v10' },
      { title: 'Form Automation', desc: 'Automate form filling and submissions.', icon: 'M9 5H7' },
    ],
    tools: ['Selenium', 'Puppeteer', 'Playwright', 'Python', 'Node.js'],
    addons: [{ name: 'Anti-detection setup', price: 200 }],
    testimonials: [
      { name: 'Kevin Smith', role: 'Data Lead, PriceTrack', text: 'We scrape 100K product prices daily with zero issues.', rating: 5 },
    ],
    cases: [
      { title: 'Price Monitoring', desc: 'Real-time price tracking across 50+ competitor sites.', result: '100K daily scrapes' },
    ],
    faqs: [
      { q: 'Is web scraping legal?', a: 'Web scraping of publicly available data is generally legal.' },
    ],
  },
  'custom-software': {
    title: 'Custom Software', tagline: 'Tailored software solutions', desc: 'End-to-end custom software development — from web applications and APIs to internal tools and full SaaS products. Built with modern tech stacks for scale, performance, and maintainability.', price: 2999, color: 'from-indigo-500 to-violet-500',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    features: [
      { title: 'Full-Stack Dev', desc: 'Frontend + backend + database — the complete package.', icon: 'M10 20l4' },
      { title: 'API Development', desc: 'RESTful and GraphQL APIs with documentation.', icon: 'M8 9l3' },
    ],
    tools: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL'],
    addons: [{ name: 'Authentication system', price: 500 }],
    testimonials: [
      { name: 'Daniel Wright', role: 'Founder, TaskFlow', text: 'Alex built our entire SaaS platform from scratch.', rating: 5 },
    ],
    cases: [
      { title: 'Project Management SaaS', desc: 'Full-featured PM tool with real-time collaboration.', result: '2K+ active users' },
    ],
    faqs: [
      { q: 'What tech stack do you use?', a: 'Primarily React/Next.js + Node.js + PostgreSQL.' },
    ],
  },
};

export default function AdminDashboardPage() {
  // Main state hooks
  const [services, setServices] = useState<any[]>(DEFAULT_SERVICES);
  const [allServices, setAllServices] = useState<any>(DEFAULT_ALL_SERVICES);
  
  // Real DB Stats
  const [dbStats, setDbStats] = useState({ services: 0, documents: 0, chunks: 0, users: 0, revenue: 0, visits: 0 });

  // Security Locking & Session
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [authError, setAuthError] = useState('');
  const [sessionUser, setSessionUser] = useState<{ id?: string; email?: string | null; name?: string | null; role?: string | null } | null>(null);

  // Team Management states
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamRole, setNewTeamRole] = useState('SUPPORT');
  const [newTeamPassword, setNewTeamPassword] = useState('');

  // Plan Builder matrix states
  const [masterFeatures, setMasterFeatures] = useState<any[]>([]);
  const [planFeatureMappings, setPlanFeatureMappings] = useState<any[]>([]);

  // Pricing Manager states (Extending pricingTiers)
  const [pricingPlansFromDb, setPricingPlansFromDb] = useState<any[]>([]);
  const [pricingManagerAlert, setPricingManagerAlert] = useState('');

  // Revenue Dashboard states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTxIdForRefund, setSelectedTxIdForRefund] = useState<string | null>(null);

  // Security Vault states
  const [vaultKeys, setVaultKeys] = useState<any[]>([]);
  const [newSecretKey, setNewSecretKey] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');

  // CMS Brand Settings
  const [ownerName, setOwnerName] = useState('Alex Sterling');
  const [brandLogo, setBrandLogo] = useState('🔥 DEVFORGE');
  const [supportEmail, setSupportEmail] = useState('alex@devforge.ai');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 911-CYBER');

  // Active CMS Tab (Extended to new admin consoles)
  const [activeCmsTab, setActiveCmsTab] = useState<'services' | 'about' | 'pricing' | 'lab' | 'team' | 'plans' | 'revenue' | 'vault'>('services');

  // Service Name Editor settings
  const [selectedServiceSlug, setSelectedServiceSlug] = useState('data-analytics');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedTagline, setEditedTagline] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedPrice, setEditedPrice] = useState(499);
  const [editedFeatures, setEditedFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [cmsAlert, setCmsAlert] = useState('');

  // About Page CMS States
  const [aboutName, setAboutName] = useState('Alex Kumar');
  const [aboutTitles, setAboutTitles] = useState('Data Analyst · AI Engineer · Full-Stack Developer');
  const [aboutHeroDesc, setAboutHeroDesc] = useState("I transform raw data into strategic insights, build intelligent AI systems, and create premium digital experiences that drive real business growth. My journey is one of constant evolution — from spreadsheets to neural networks, from dashboards to fully autonomous AI agents.");
  
  const [aboutStats, setAboutStats] = useState<any[]>([
    { value: '7+', label: 'Years Experience', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: '150+', label: 'Projects Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: '80+', label: 'Clients Served', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { value: '30+', label: 'Technologies', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ]);

  const [aboutMilestones, setAboutMilestones] = useState<any[]>([
    { year: '2018', title: 'Started Coding Journey', desc: 'Dove into Python and data science, building my first analytics dashboards and discovering the power of data-driven decision making.' },
    { year: '2020', title: 'First Enterprise Client', desc: 'Delivered a business intelligence platform for a Fortune 500 company, processing over 2M records daily with real-time insights.' },
    { year: '2021', title: 'AI & Automation Pivot', desc: 'Built intelligent automation systems and AI chatbots, helping businesses save 40+ hours per week on repetitive tasks.' },
    { year: '2023', title: 'Launched SaaS Products', desc: 'Created and launched multiple SaaS products serving 500+ users, generating recurring revenue and solving real-world problems.' },
    { year: '2025', title: 'Full-Stack AI Studio', desc: 'Established a full-service AI consultancy, combining data analytics, custom AI agents, and scalable web platforms.' },
  ]);

  // Pricing Page CMS States
  const [pricingTiers, setPricingTiers] = useState<any[]>([
    {
      name: 'Starter',
      monthly: 499,
      annual: 399,
      desc: 'Essential analytics for lean teams getting started.',
      features: [
        'Basic analytics suite',
        '1 custom dashboard',
        'Email support (48h response)',
        '5 revisions per month',
        'CSV data export',
      ],
    },
    {
      name: 'Professional',
      monthly: 999,
      annual: 799,
      desc: 'AI-powered intelligence for scaling operations.',
      features: [
        'Everything in Starter',
        'AI-powered agents & automations',
        '5 custom dashboards',
        'Priority support (4h response)',
        'Unlimited revisions',
        'Advanced visualizations',
        'API access & webhooks',
      ],
    },
    {
      name: 'Enterprise',
      monthly: 2499,
      annual: 1999,
      desc: 'Full-stack custom solutions with white-glove service.',
      features: [
        'Everything in Professional',
        'Custom AI solutions & models',
        'Unlimited dashboards',
        'Dedicated account manager',
        '99.9% uptime SLA',
        'White-label branding',
        'On-premise deployment option',
        'Advanced SSO & compliance',
      ],
    },
  ]);
  const [selectedTierIndex, setSelectedTierIndex] = useState(1);

  // Selected pricing tier editing states
  const [editedTierName, setEditedTierName] = useState('Professional');
  const [editedTierMonthly, setEditedTierMonthly] = useState(999);
  const [editedTierAnnual, setEditedTierAnnual] = useState(799);
  const [editedTierDesc, setEditedTierDesc] = useState('AI-powered intelligence for scaling operations.');
  const [editedTierFeatures, setEditedTierFeatures] = useState<string[]>([]);
  const [newTierFeatureText, setNewTierFeatureText] = useState('');

  // Data Lab Page CMS States
  const [labHeroTag, setLabHeroTag] = useState('🧪 Advanced Analytics Playground');
  const [labHeroHeading, setLabHeroHeading] = useState('Data Lab');
  const [labHeroHeadingGrad, setLabHeroHeadingGrad] = useState('Simulators');
  const [labHeroSubheading, setLabHeroSubheading] = useState('Test natural language spreadsheet AI, train deep learning models client-side, and explore live Pearson correlation arrays.');
  const [labStatAcc, setLabStatAcc] = useState('99.4%');
  const [labStatSpeed, setLabStatSpeed] = useState('10x');
  const [labStatQueries, setLabStatQueries] = useState('50k+');

  // Master platform settings
  const [isFrozen, setIsFrozen] = useState(false);
  const [isShutdown, setIsShutdown] = useState(false);
  const [shutdownStep, setShutdownStep] = useState<'idle' | 'warning' | 'freezing' | 'frozen'>('idle');
  const [llmModel, setLlmModel] = useState('GPT-4o');
  const [llmTemp, setLlmTemp] = useState(0.2);
  const [quotaLimit, setQuotaLimit] = useState(50000);
  const [banIpInput, setBanIpInput] = useState('');
  const [bannedIps, setBannedIps] = useState<string[]>(['192.168.4.15', '45.22.89.102']);

  // SQL explorer console settings
  const [sqlQueryInput, setSqlQueryInput] = useState('SELECT * FROM users LIMIT 3;');
  const [sqlConsoleLogs, setSqlConsoleLogs] = useState<string[]>([
    'DevForge Database Cluster SQL CLI - Ready.',
    'Connected to cold-storage postgres replica.',
    'Type standard commands to explore tables: users, sales, services, logs.'
  ]);
  const [sqlQueryResults, setSqlQueryResults] = useState<any[]>([]);
  const [sqlColumns, setSqlColumns] = useState<string[]>([]);

  // Telemetry widgets
  const [activeConnections, setActiveConnections] = useState(482);
  const [cpuUsage, setCpuUsage] = useState(14.5);
  const [dbOps, setDbOps] = useState(992);
  const [ramUsage, setRamUsage] = useState(38);

  // Voice Assistant simulator
  const [voiceCommandText, setVoiceCommandText] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('Voice agent is online. Awaiting commands.');

  // Load from local storage upon mounting (Client only)
  useEffect(() => {
    const localSrv = localStorage.getItem('platform_services');
    const localAllSrv = localStorage.getItem('platform_all_services');
    
    if (localSrv) {
      setServices(JSON.parse(localSrv));
    } else {
      localStorage.setItem('platform_services', JSON.stringify(DEFAULT_SERVICES));
    }

    if (localAllSrv) {
      setAllServices(JSON.parse(localAllSrv));
    } else {
      localStorage.setItem('platform_all_services', JSON.stringify(DEFAULT_ALL_SERVICES));
    }

    // Fetch real stats from DB
    getAdminDashboardStats().then(stats => setDbStats(stats));

    const localAbout = localStorage.getItem('platform_about_data');
    if (localAbout) {
      const parsed = JSON.parse(localAbout);
      setAboutName(parsed.name || 'Alex Kumar');
      setAboutTitles(parsed.titles || 'Data Analyst · AI Engineer · Full-Stack Developer');
      setAboutHeroDesc(parsed.heroDesc || '');
      setAboutStats(parsed.stats || []);
      setAboutMilestones(parsed.milestones || []);
    } else {
      localStorage.setItem('platform_about_data', JSON.stringify({
        name: 'Alex Kumar',
        titles: 'Data Analyst · AI Engineer · Full-Stack Developer',
        heroDesc: "I transform raw data into strategic insights, build intelligent AI systems, and create premium digital experiences that drive real business growth. My journey is one of constant evolution — from spreadsheets to neural networks, from dashboards to fully autonomous AI agents.",
        stats: [
          { value: '7+', label: 'Years Experience', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { value: '150+', label: 'Projects Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { value: '80+', label: 'Clients Served', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
          { value: '30+', label: 'Technologies', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
        ],
        milestones: [
          { year: '2018', title: 'Started Coding Journey', desc: 'Dove into Python and data science, building my first analytics dashboards and discovering the power of data-driven decision making.' },
          { year: '2020', title: 'First Enterprise Client', desc: 'Delivered a business intelligence platform for a Fortune 500 company, processing over 2M records daily with real-time insights.' },
          { year: '2021', title: 'AI & Automation Pivot', desc: 'Built intelligent automation systems and AI chatbots, helping businesses save 40+ hours per week on repetitive tasks.' },
          { year: '2023', title: 'Launched SaaS Products', desc: 'Created and launched multiple SaaS products serving 500+ users, generating recurring revenue and solving real-world problems.' },
          { year: '2025', title: 'Full-Stack AI Studio', desc: 'Established a full-service AI consultancy, combining data analytics, custom AI agents, and scalable web platforms.' }
        ]
      }));
    }

    const localPricing = localStorage.getItem('platform_pricing_data');
    if (localPricing) {
      setPricingTiers(JSON.parse(localPricing));
    } else {
      localStorage.setItem('platform_pricing_data', JSON.stringify([
        {
          name: 'Starter',
          monthly: 499,
          annual: 399,
          desc: 'Essential analytics for lean teams getting started.',
          features: [
            'Basic analytics suite',
            '1 custom dashboard',
            'Email support (48h response)',
            '5 revisions per month',
            'CSV data export',
          ],
        },
        {
          name: 'Professional',
          monthly: 999,
          annual: 799,
          desc: 'AI-powered intelligence for scaling operations.',
          features: [
            'Everything in Starter',
            'AI-powered agents & automations',
            '5 custom dashboards',
            'Priority support (4h response)',
            'Unlimited revisions',
            'Advanced visualizations',
            'API access & webhooks',
          ],
        },
        {
          name: 'Enterprise',
          monthly: 2499,
          annual: 1999,
          desc: 'Full-stack custom solutions with white-glove service.',
          features: [
            'Everything in Professional',
            'Custom AI solutions & models',
            'Unlimited dashboards',
            'Dedicated account manager',
            '99.9% uptime SLA',
            'White-label branding',
            'On-premise deployment option',
            'Advanced SSO & compliance',
          ],
        },
      ]));
    }

    const localLab = localStorage.getItem('platform_lab_data');
    if (localLab) {
      const parsed = JSON.parse(localLab);
      setLabHeroTag(parsed.heroTag || '🧪 Advanced Analytics Playground');
      setLabHeroHeading(parsed.heroHeading || 'Data Lab');
      setLabHeroHeadingGrad(parsed.heroHeadingGrad || 'Simulators');
      setLabHeroSubheading(parsed.heroSubheading || 'Test natural language spreadsheet AI, train deep learning models client-side, and explore live Pearson correlation arrays.');
      setLabStatAcc(parsed.statAcc || '99.4%');
      setLabStatSpeed(parsed.statSpeed || '10x');
      setLabStatQueries(parsed.statQueries || '50k+');
    } else {
      localStorage.setItem('platform_lab_data', JSON.stringify({
        heroTag: '🧪 Advanced Analytics Playground',
        heroHeading: 'Data Lab',
        heroHeadingGrad: 'Simulators',
        heroSubheading: 'Test natural language spreadsheet AI, train deep learning models client-side, and explore live Pearson correlation arrays.',
        statAcc: '99.4%',
        statSpeed: '10x',
        statQueries: '50k+',
      }));
    }

    // Interval to simulate live server telemetry
    const timer = setInterval(() => {
      if (shutdownStep === 'freezing' || shutdownStep === 'frozen') {
        setCpuUsage(0.0);
        setActiveConnections(0);
        setRamUsage(1.2);
        return;
      }
      setActiveConnections(prev => prev + Math.floor(Math.random() * 9) - 4);
      setCpuUsage(prev => {
        const val = prev + (Math.random() * 2) - 1;
        return parseFloat(Math.min(Math.max(val, 8.0), 25.0).toFixed(1));
      });
      setDbOps(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);

    return () => clearInterval(timer);
  }, [shutdownStep]);

  // Load pricing tier details when tier selection changes
  useEffect(() => {
    const currentTier = pricingTiers[selectedTierIndex];
    if (currentTier) {
      setEditedTierName(currentTier.name);
      setEditedTierMonthly(currentTier.monthly);
      setEditedTierAnnual(currentTier.annual);
      setEditedTierDesc(currentTier.desc);
      setEditedTierFeatures(currentTier.features || []);
    }
  }, [selectedTierIndex, pricingTiers]);

  // Load service fields into the editor form whenever the selected dropdown service changes
  useEffect(() => {
    const srvBrief = services.find(s => s.slug === selectedServiceSlug);
    const srvDetailed = allServices[selectedServiceSlug] || {};

    if (srvBrief) {
      setEditedTitle(srvBrief.title);
      setEditedDesc(srvBrief.desc);
      const parsedPrice = parseFloat(srvBrief.price.replace(/[^0-9]/g, ''));
      setEditedPrice(isNaN(parsedPrice) ? 499 : parsedPrice);
    }
    if (srvDetailed) {
      setEditedTagline(srvDetailed.tagline || '');
      setEditedFeatures(srvBrief ? srvBrief.features : []);
    }
  }, [selectedServiceSlug, services, allServices]);

  // Standard KPI cards matching existing layout
  const kpis = [
    { title: 'Total Revenue (Est)', value: dbStats.revenue || 45231, suffix: '', prefix: '$', icon: DollarSign, change: '+20.1%' },
    { title: 'Active Services', value: dbStats.services || services.length, suffix: '', prefix: '', icon: TrendingUp, change: '+2.4%' },
    { title: 'Data Uploads (Chunks)', value: dbStats.chunks || 0, suffix: '', prefix: '', icon: Database, change: '+12.5%' },
    { title: 'Website Visits', value: (dbStats.visits || 0) + (activeConnections * 25), suffix: '', prefix: '', icon: Eye, change: '+15.2%' },
  ];

  // Backend database preload action
  const loadAllDatabaseData = async () => {
    try {
      const sessionRes = await getAdminSessionDetails();
      if (sessionRes.authenticated && sessionRes.user) {
        setSessionUser(sessionRes.user);
        
        // 1. Fetch live metrics
        const stats = await getAdminDashboardStats();
        setDbStats(stats);
        
        // 2. Fetch plans from DB
        const planMatrix = await getPlanFeaturesMatrix();
        if (planMatrix.masterFeatures) {
          setMasterFeatures(planMatrix.masterFeatures);
          setPlanFeatureMappings(planMatrix.mappings);
        }

        // Fetch db pricing tiers
        const localPricing = localStorage.getItem('platform_pricing_data');
        if (localPricing) {
          const parsed = JSON.parse(localPricing);
          setPricingPlansFromDb(parsed);
        }

        // 3. Fetch Super Admin specific items
        if (sessionRes.user.role === 'SUPER-ADMIN') {
          const teamRes = await getTeamMembers();
          if (teamRes.members) setTeamMembers(teamRes.members);
          
          const vaultRes = await getVaultKeysInfo();
          if (vaultRes.keys) setVaultKeys(vaultRes.keys);
        }

        // 4. Fetch Super Admin or Finance items
        if (sessionRes.user.role === 'SUPER-ADMIN' || sessionRes.user.role === 'FINANCE') {
          const txRes = await getTransactions();
          if (txRes.transactions) setTransactions(txRes.transactions);
        }
      }
    } catch (err) {
      console.error("Failed loading admin panel database configurations:", err);
    }
  };

  // Run on mount or when locked state changes
  useEffect(() => {
    if (!isLocked) {
      loadAllDatabaseData();
    }
  }, [isLocked]);

  // TTS audio voice helper
  const speakVoiceOutput = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel active speaking to avoid overlap
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Cyber Pin keypad input
  const handleKeypadPress = (num: string) => {
    const next = pinInput + num;
    setPinInput(next);

    if (next.length === 4) {
      if (next === '1337') {
        setIsLocked(false);
        setPinInput('');
        setAuthError('');
        speakVoiceOutput("Welcome back, Master Owner. Service controls unlocked.");
        loadAllDatabaseData();
      } else {
        setAuthError('INVALID ACCESS CREDENTIALS');
        speakVoiceOutput("Access denied. Intruder alert simulated.");
        setTimeout(() => setPinInput(''), 1000);
      }
    }
  };

  // FaceID scanner simulator
  const triggerFaceScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setAuthError('');
    speakVoiceOutput("Initiating neural face ID scanner.");

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setScanProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setIsLocked(false);
        speakVoiceOutput("Biometric fingerprint matching complete. Welcome Alex.");
        loadAllDatabaseData();
      }
    }, 200);
  };

  // Dynamic Service Name Save Function (LocalStorage Synchronization)
  const handleSaveServiceCMSEntity = () => {
    // 1. Map values for services brief listing (used in services index)
    const updatedServices = services.map(s => {
      if (s.slug === selectedServiceSlug) {
        return {
          ...s,
          title: editedTitle,
          desc: editedDesc,
          price: `$${editedPrice}`,
          features: editedFeatures
        };
      }
      return s;
    });

    // 2. Map detailed values (used in services/[slug]/page.tsx)
    const currentDetailed = allServices[selectedServiceSlug] || {};
    const updatedDetailedFeatures = editedFeatures.map((f, i) => {
      // preserve icons of existing features if available
      const oldFeature = currentDetailed.features?.[i];
      return {
        title: f,
        desc: oldFeature?.desc || `Tailored execution module for ${f}.`,
        icon: oldFeature?.icon || 'M9 12l2 2 4-4'
      };
    });

    const updatedAllServices = {
      ...allServices,
      [selectedServiceSlug]: {
        ...currentDetailed,
        title: editedTitle,
        tagline: editedTagline,
        desc: editedDesc,
        price: editedPrice,
        features: updatedDetailedFeatures
      }
    };

    // 3. Set states and save in LocalStorage immediately
    setServices(updatedServices);
    setAllServices(updatedAllServices);
    localStorage.setItem('platform_services', JSON.stringify(updatedServices));
    localStorage.setItem('platform_all_services', JSON.stringify(updatedAllServices));

    // Display telemetry toast and speak confirmation
    setCmsAlert(`AUTHORIZED UPDATE: Service "${editedTitle}" updated and committed globally.`);
    speakVoiceOutput(`Service ${editedTitle} successfully renamed and synchronized across active client web layouts.`);
    
    // Clear alert after 4 seconds
    setTimeout(() => setCmsAlert(''), 4000);
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setEditedFeatures(prev => [...prev, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setEditedFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  // About CMS Helpers
  const handleAddMilestone = () => {
    setAboutMilestones(prev => [
      ...prev,
      { year: '2026', title: 'New Milestone', desc: 'Describe this key milestone here.' }
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    setAboutMilestones(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateMilestone = (idx: number, field: string, val: string) => {
    setAboutMilestones(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };

  const handleUpdateStat = (idx: number, field: string, val: string) => {
    setAboutStats(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const handleSaveAboutCMS = () => {
    const updatedAbout = {
      name: aboutName,
      titles: aboutTitles,
      heroDesc: aboutHeroDesc,
      stats: aboutStats,
      milestones: aboutMilestones,
    };
    localStorage.setItem('platform_about_data', JSON.stringify(updatedAbout));
    setCmsAlert('AUTHORIZED UPDATE: About Page details synchronized globally.');
    speakVoiceOutput('About page details successfully updated.');
    setTimeout(() => setCmsAlert(''), 4000);
  };

  // Pricing CMS Helpers
  const handleAddPricingFeature = () => {
    if (newTierFeatureText.trim()) {
      setEditedTierFeatures(prev => [...prev, newTierFeatureText.trim()]);
      setNewTierFeatureText('');
    }
  };

  const handleRemovePricingFeature = (idx: number) => {
    setEditedTierFeatures(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePricingCMS = () => {
    const updatedTiers = pricingTiers.map((tier, idx) => {
      if (idx === selectedTierIndex) {
        return {
          ...tier,
          name: editedTierName,
          monthly: editedTierMonthly,
          annual: editedTierAnnual,
          desc: editedTierDesc,
          features: editedTierFeatures,
        };
      }
      return tier;
    });
    setPricingTiers(updatedTiers);
    localStorage.setItem('platform_pricing_data', JSON.stringify(updatedTiers));
    setCmsAlert(`AUTHORIZED UPDATE: Pricing Tier "${editedTierName}" updated and committed globally.`);
    speakVoiceOutput(`Pricing tier ${editedTierName} successfully updated.`);
    setTimeout(() => setCmsAlert(''), 4000);
  };

  // Data Lab CMS Helpers
  const handleSaveLabCMS = () => {
    const updatedLab = {
      heroTag: labHeroTag,
      heroHeading: labHeroHeading,
      heroHeadingGrad: labHeroHeadingGrad,
      heroSubheading: labHeroSubheading,
      statAcc: labStatAcc,
      statSpeed: labStatSpeed,
      statQueries: labStatQueries,
    };
    localStorage.setItem('platform_lab_data', JSON.stringify(updatedLab));
    setCmsAlert('AUTHORIZED UPDATE: Data Lab configurations updated and committed globally.');
    speakVoiceOutput('Data Lab configurations successfully updated.');
    setTimeout(() => setCmsAlert(''), 4000);
  };

  const handleRestoreDefaults = () => {
    setServices(DEFAULT_SERVICES);
    setAllServices(DEFAULT_ALL_SERVICES);
    localStorage.setItem('platform_services', JSON.stringify(DEFAULT_SERVICES));
    localStorage.setItem('platform_all_services', JSON.stringify(DEFAULT_ALL_SERVICES));
    
    // Also reset about, pricing, and lab to standard states
    const defaultAbout = {
      name: 'Alex Kumar',
      titles: 'Data Analyst · AI Engineer · Full-Stack Developer',
      heroDesc: "I transform raw data into strategic insights, build intelligent AI systems, and create premium digital experiences that drive real business growth. My journey is one of constant evolution — from spreadsheets to neural networks, from dashboards to fully autonomous AI agents.",
      stats: [
        { value: '7+', label: 'Years Experience', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { value: '150+', label: 'Projects Completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { value: '80+', label: 'Clients Served', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { value: '30+', label: 'Technologies', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
      ],
      milestones: [
        { year: '2018', title: 'Started Coding Journey', desc: 'Dove into Python and data science, building my first analytics dashboards and discovering the power of data-driven decision making.' },
        { year: '2020', title: 'First Enterprise Client', desc: 'Delivered a business intelligence platform for a Fortune 500 company, processing over 2M records daily with real-time insights.' },
        { year: '2021', title: 'AI & Automation Pivot', desc: 'Built intelligent automation systems and AI chatbots, helping businesses save 40+ hours per week on repetitive tasks.' },
        { year: '2023', title: 'Launched SaaS Products', desc: 'Created and launched multiple SaaS products serving 500+ users, generating recurring revenue and solving real-world problems.' },
        { year: '2025', title: 'Full-Stack AI Studio', desc: 'Established a full-service AI consultancy, combining data analytics, custom AI agents, and scalable web platforms.' }
      ]
    };
    setAboutName(defaultAbout.name);
    setAboutTitles(defaultAbout.titles);
    setAboutHeroDesc(defaultAbout.heroDesc);
    setAboutStats(defaultAbout.stats);
    setAboutMilestones(defaultAbout.milestones);
    localStorage.setItem('platform_about_data', JSON.stringify(defaultAbout));

    const defaultPricing = [
      {
        name: 'Starter',
        monthly: 499,
        annual: 399,
        desc: 'Essential analytics for lean teams getting started.',
        features: ['Basic analytics suite', '1 custom dashboard', 'Email support (48h response)', '5 revisions per month', 'CSV data export'],
      },
      {
        name: 'Professional',
        monthly: 999,
        annual: 799,
        desc: 'AI-powered intelligence for scaling operations.',
        features: ['Everything in Starter', 'AI-powered agents & automations', '5 custom dashboards', 'Priority support (4h response)', 'Unlimited revisions', 'Advanced visualizations', 'API access & webhooks'],
      },
      {
        name: 'Enterprise',
        monthly: 2499,
        annual: 1999,
        desc: 'Full-stack custom solutions with white-glove service.',
        features: ['Everything in Professional', 'Custom AI solutions & models', 'Unlimited dashboards', 'Dedicated account manager', '99.9% uptime SLA', 'White-label branding', 'On-premise deployment option', 'Advanced SSO & compliance'],
      }
    ];
    setPricingTiers(defaultPricing);
    localStorage.setItem('platform_pricing_data', JSON.stringify(defaultPricing));

    const defaultLab = {
      heroTag: '🧪 Advanced Analytics Playground',
      heroHeading: 'Data Lab',
      heroHeadingGrad: 'Simulators',
      heroSubheading: 'Test natural language spreadsheet AI, train deep learning models client-side, and explore live Pearson correlation arrays.',
      statAcc: '99.4%',
      statSpeed: '10x',
      statQueries: '50k+',
    };
    setLabHeroTag(defaultLab.heroTag);
    setLabHeroHeading(defaultLab.heroHeading);
    setLabHeroHeadingGrad(defaultLab.heroHeadingGrad);
    setLabHeroSubheading(defaultLab.heroSubheading);
    setLabStatAcc(defaultLab.statAcc);
    setLabStatSpeed(defaultLab.statSpeed);
    setLabStatQueries(defaultLab.statQueries);
    localStorage.setItem('platform_lab_data', JSON.stringify(defaultLab));

    setCmsAlert("TELEMETRY: Reverted database and service configurations to factory default models.");
    speakVoiceOutput("System service directory successfully rolled back to default state.");
    setTimeout(() => setCmsAlert(''), 3000);
  };

  // SQL Explorer simulation
  const handleExecuteSql = () => {
    const q = sqlQueryInput.trim().toUpperCase();
    setSqlConsoleLogs(prev => [...prev, `devforge_sql_root@replica:~$ ${sqlQueryInput}`]);

    setTimeout(() => {
      if (q.includes('SELECT') && q.includes('USERS')) {
        setSqlColumns(['id', 'username', 'email', 'status', 'role']);
        setSqlQueryResults([
          { id: 101, username: 'marcus_cyber', email: 'marcus@devforge.ai', status: 'Active', role: 'Developer' },
          { id: 102, username: 'sarah_chen', email: 'sarah.c@techcorp.com', status: 'Active', role: 'Client' },
          { id: 103, username: 'johndoe_99', email: 'j.doe@gmail.com', status: 'Banned', role: 'Visitor' }
        ]);
        setSqlConsoleLogs(prev => [...prev, 'Returned 3 rows successfully from table: users.']);
      } else if (q.includes('SELECT') && q.includes('SERVICES')) {
        setSqlColumns(['slug', 'title', 'price', 'color']);
        setSqlQueryResults(
          services.map(s => ({ slug: s.slug, title: s.title, price: s.price, color: s.color }))
        );
        setSqlConsoleLogs(prev => [...prev, `Returned ${services.length} rows successfully from table: services.`]);
      } else if (q.includes('SELECT') && q.includes('SALES')) {
        setSqlColumns(['sale_id', 'client', 'amount', 'timestamp']);
        setSqlQueryResults([
          { sale_id: 'TX-9901', client: 'RetailMax LLC', amount: '$799', timestamp: '2026-05-22 09:20' },
          { sale_id: 'TX-9902', client: 'GrowthCo SaaS', amount: '$999', timestamp: '2026-05-22 08:14' },
          { sale_id: 'TX-9903', client: 'Sarah Chen', amount: '$499', timestamp: '2026-05-21 16:45' }
        ]);
        setSqlConsoleLogs(prev => [...prev, 'Returned 3 rows successfully from table: sales.']);
      } else if (q.includes('DESC') || q.includes('SHOW')) {
        setSqlColumns(['table_name', 'row_count', 'indexes', 'engine']);
        setSqlQueryResults([
          { table_name: 'users', row_count: '1,452', indexes: 'primary_key, email_idx', engine: 'InnoDB' },
          { table_name: 'services', row_count: '8', indexes: 'primary_key', engine: 'InnoDB' },
          { table_name: 'sales', row_count: '12,480', indexes: 'primary_key, timestamp_idx', engine: 'InnoDB' },
          { table_name: 'logs', row_count: '439,010', indexes: 'primary_key', engine: 'Aria' }
        ]);
        setSqlConsoleLogs(prev => [...prev, 'Described active relational database schema successfully.']);
      } else {
        setSqlColumns(['Error_Report', 'Severity']);
        setSqlQueryResults([{ Error_Report: `SQL Syntax Error near "${sqlQueryInput.split(' ')[0]}"`, Severity: 'MEDIUM' }]);
        setSqlConsoleLogs(prev => [...prev, 'Syntax parsing warning: command not fully cached inside visual simulator.']);
      }
    }, 300);
  };

  // Database actions simulators
  const handleBackupDatabase = () => {
    setSqlConsoleLogs(prev => [
      ...prev,
      'Executing secure backup checklist...',
      'Dumping table structure schema...',
      'Compressing records data columns to cold vault zip format...',
      '✓ Complete backup successfully written to: c:\\Users\\HP\\.gemini\\antigravity\\backups\\df_backup_20260522.zip (1.2 GB)'
    ]);
    speakVoiceOutput("Complete system database backup compiled and stored successfully in local cold vault.");
  };

  const handleRepairDatabase = () => {
    setSqlConsoleLogs(prev => [
      ...prev,
      'Initializing database diagnostic sweeps...',
      'Scanning indices structure integrity...',
      'Clearing corrupt temporary cache blocks...',
      '✓ System Database repaired successfully. Index matches 100% stable.'
    ]);
    speakVoiceOutput("Database integrity checked. Zero corrupt logs reported. All pipelines operational.");
  };

  // Firewall banning action
  const handleAddBannedIp = () => {
    if (banIpInput.trim() && !bannedIps.includes(banIpInput.trim())) {
      setBannedIps(prev => [...prev, banIpInput.trim()]);
      speakVoiceOutput(`IP address ${banIpInput.trim()} immediately restricted by hardware firewall.`);
      setBanIpInput('');
    }
  };

  const handleRemoveBannedIp = (ip: string) => {
    setBannedIps(prev => prev.filter(item => item !== ip));
    speakVoiceOutput(`IP address ${ip} restored to global allowlist.`);
  };

  // Simulated voice assistant executing commands
  const handleVoiceCommand = () => {
    const cmd = voiceCommandText.trim().toLowerCase();
    setIsListeningVoice(true);
    speakVoiceOutput("Listening");

    setTimeout(() => {
      setIsListeningVoice(false);
      
      if (cmd.includes('backup') || cmd.includes('dump')) {
        setVoiceFeedback("Action Executed: Backup Compiled.");
        handleBackupDatabase();
      } else if (cmd.includes('repair') || cmd.includes('optimize')) {
        setVoiceFeedback("Action Executed: Deep Repair Completed.");
        handleRepairDatabase();
      } else if (cmd.includes('freeze') || cmd.includes('lock')) {
        setIsFrozen(true);
        setVoiceFeedback("Action Executed: Database pipeline frozen.");
        speakVoiceOutput("System locked in read-only maintenance mode.");
      } else if (cmd.includes('unfreeze') || cmd.includes('unlock')) {
        setIsFrozen(false);
        setVoiceFeedback("Action Executed: Database un-frozen.");
        speakVoiceOutput("System database pipelines active.");
      } else if (cmd.includes('shutdown') || cmd.includes('freeze site')) {
        setShutdownStep('freezing');
        setVoiceFeedback("Action Executed: Emergency Platform Shutdown Initiated.");
        speakVoiceOutput("Warning. Initiating emergency shutdown protocol. Freezing CPU and network sockets.");
        setTimeout(() => {
          setShutdownStep('frozen');
          setIsShutdown(true);
        }, 3000);
      } else if (cmd.includes('active') || cmd.includes('stats') || cmd.includes('connections')) {
        setVoiceFeedback(`Platform Telemetry: ${activeConnections} socket tunnels active, CPU usage is ${cpuUsage} percent.`);
        speakVoiceOutput(`Active network socket connections is ${activeConnections}, running at ${cpuUsage} percent CPU intensity.`);
      } else {
        setVoiceFeedback("Voice query parsed. Command code not found in simulator keys.");
        speakVoiceOutput("Command parsed. Please say: backup, repair, stats, or freeze database.");
      }
    }, 1500);
  };

  // ==========================================
  // 👥 UI ACTION HANDLERS (ADMIN PORTAL)
  // ==========================================

  // 1. Team Invite
  const handleInviteTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !newTeamEmail || !newTeamPassword) {
      alert('Security Warning: All fields are required.');
      return;
    }
    const res = await inviteTeamMember(newTeamName, newTeamEmail, newTeamRole, newTeamPassword);
    if (res.error) {
      alert(`INVITATION FAILED: ${res.error}`);
    } else {
      alert(`AUTHORIZED REGISTRATION: ${res.message}`);
      setNewTeamName('');
      setNewTeamEmail('');
      setNewTeamPassword('');
      loadAllDatabaseData(); // refresh
    }
  };

  // 2. Team Role Mutate
  const handleRoleChange = async (userId: string, targetRole: string) => {
    const res = await updateUserRole(userId, targetRole);
    if (res.error) {
      alert(`MUTATION FAILED: ${res.error}`);
    } else {
      alert(`AUTHORIZED MODIFICATION: ${res.message}`);
      loadAllDatabaseData(); // refresh
    }
  };

  // 3. Team Access Revocation
  const handleRevokeAccess = async (userId: string) => {
    if (!confirm('CRITICAL ACTION: Are you sure you want to permanently delete this account? This action is irreversible.')) return;
    const res = await revokeUserAccess(userId);
    if (res.error) {
      alert(`REVOCATION FAILED: ${res.error}`);
    } else {
      alert(`AUTHORIZED TERMINATION: ${res.message}`);
      loadAllDatabaseData(); // refresh
    }
  };

  // 4. Plan Builder Dynamic Toggles
  const handleTogglePlanFeature = async (planId: string, featureCode: string) => {
    // Determine existing mapped feature codes for this specific plan
    const currentMapped = planFeatureMappings
      .filter(m => m.planId === planId)
      .map(m => m.featureCode);
    
    let nextMapped: string[];
    if (currentMapped.includes(featureCode)) {
      nextMapped = currentMapped.filter(c => c !== featureCode);
    } else {
      nextMapped = [...currentMapped, featureCode];
    }

    // Call server-side transaction mapping
    const res = await updatePlanFeaturesMap(planId, nextMapped);
    if (res.error) {
      alert(`MAPPING MUTATION FAILED: ${res.error}`);
    } else {
      // Optimistically update mapping state
      setPlanFeatureMappings(prev => {
        const filtered = prev.filter(m => !(m.planId === planId && m.featureCode === featureCode));
        if (currentMapped.includes(featureCode)) {
          return filtered; // removed
        } else {
          return [...filtered, { planId, featureCode }]; // added
        }
      });
      speakVoiceOutput(`Plan feature mapping mutated.`);
    }
  };

  // 5. Pricing Plan Updates
  const handleUpdatePlanPricingLocal = async (planId: string, basePrice: number, discount: number, isActive: boolean) => {
    const res = await updatePlanPricing(planId, basePrice, discount, isActive);
    if (res.error) {
      alert(`PRICING ERROR: ${res.error}`);
    } else {
      setPricingManagerAlert(`Plan "${planId}" pricing synced globally.`);
      loadAllDatabaseData(); // refresh
      setTimeout(() => setPricingManagerAlert(''), 4000);
      speakVoiceOutput(`Plan pricing synchronized successfully.`);
    }
  };

  // 6. Stripe/Razorpay Refund Simulator
  const handleProcessRefundLocal = async (txId: string) => {
    if (!confirm('CRITICAL ACTION: Process Stripe/Razorpay refund for this transaction?')) return;
    setSelectedTxIdForRefund(txId);
    
    const res = await processRefund(txId);
    setSelectedTxIdForRefund(null);

    if (res.error) {
      alert(`REFUND EXPORT FAILED: ${res.error}`);
    } else {
      alert(`REFUND COMPLETE: ${res.message}`);
      loadAllDatabaseData(); // refresh stats and ledger
    }
  };

  // 7. Security secrets vault CRUD
  const handleSaveSecretLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretKey || !newSecretValue) {
      alert('Vault Warning: Secret identifier key and value string are required.');
      return;
    }

    const res = await saveSystemSetting(newSecretKey, newSecretValue);
    if (res.error) {
      alert(`VAULT WRITE FAILED: ${res.error}`);
    } else {
      alert(`VAULT SECURED: ${res.message}`);
      setNewSecretKey('');
      setNewSecretValue('');
      loadAllDatabaseData(); // refresh vault list
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      
      {/* ==========================================
          🎪 STANDARD ADMIN INTERFACE & KPIS
          ========================================== */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Owner! Platform services are operating normally.</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={i} className="flex flex-col relative overflow-hidden group p-6 bg-white/5 border-white/10 rounded-2xl shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-success/20 text-success rounded-full">
                  {kpi.change}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-1">{kpi.title}</p>
              <div className="text-3xl font-bold text-white flex items-center">
                {kpi.prefix && <span>{kpi.prefix}</span>}
                <AnimatedCounter target={kpi.value} suffix={kpi.suffix} />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            </GlassCard>
          );
        })}
      </div>

      {/* Standard Charts & Controls Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Activity Logs</h2>
            <span className="text-xs text-primary font-medium uppercase font-mono tracking-wider">LIVE TELEMETRY</span>
          </div>
          <div className="space-y-4 font-mono text-xs">
            {[
              { text: `System database auto-vacuum completed. Optimized 439,010 log entries.`, time: '2 mins ago', type: 'system' },
              { text: `Admin identity verified from IP 192.168.1.50 using biometric gate.`, time: '1 hour ago', type: 'security' },
              { text: `Platform identity sync committed: 'Data Analytics' price modified to $499.`, time: '3 hours ago', type: 'cms' },
              { text: `Backup sequence authorized: cold repository zip created successfully.`, time: '5 hours ago', type: 'database' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 animate-ping" />
                <div className="flex-1">
                  <p className="font-light">{activity.text}</p>
                </div>
                <div className="text-[10px] text-white/40 whitespace-nowrap">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Live Active Server CPU Metrics Card */}
        <GlassCard className="p-6 bg-white/5 border border-white/10 rounded-2xl shadow-lg flex flex-col gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Infrastructure Health</span>
          </h2>
          <div className="space-y-4">
            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <div className="flex justify-between items-center text-xs text-white/60 mb-2">
                <span>Active WebSocket Connections</span>
                <span className="font-bold text-white font-mono">{activeConnections}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${Math.min(activeConnections / 6, 100)}%` }} />
              </div>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <div className="flex justify-between items-center text-xs text-white/60 mb-2">
                <span>Core CPU Core Load</span>
                <span className="font-bold text-white font-mono">{cpuUsage}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${cpuUsage}%` }} />
              </div>
            </div>

            <div className="bg-black/30 p-3 rounded-lg border border-white/5">
              <div className="flex justify-between items-center text-xs text-white/60 mb-2">
                <span>RAM Cache Utilization</span>
                <span className="font-bold text-white font-mono">{ramUsage}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 transition-all" style={{ width: `${ramUsage}%` }} />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>


      {/* ==========================================
          👑 SUPER ADMIN / SERVICE OWNER SELECTION (At the Bottom)
          ========================================== */}
      <div className="pt-10 border-t-2 border-white/10 relative">
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-4 bg-[#070b19] text-[10px] font-mono tracking-[0.35em] text-white/30 uppercase">
          Master Level Access Required
        </div>

        <AnimatePresence mode="wait">
          
          {/* 🔐 SECURE AUTH OVERLAY (LOCKED STATE) */}
          {isLocked ? (
            <motion.div
              key="auth-gate-locked"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto"
            >
              <GlassCard className="flex flex-col items-center justify-center p-12 text-center max-w-4xl w-full mx-4 bg-black/60 backdrop-blur-2xl border border-red-500/20 rounded-3xl shadow-[0_0_100px_rgba(239,68,68,0.15)] relative overflow-hidden">
                
                {/* Security Grid Background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
                
                <ShieldAlert className="w-20 h-20 text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse" />
                
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-3 tracking-widest uppercase">
                  Cyber Security Gate
                </h2>
                
                <p className="text-white/60 mb-10 text-sm max-w-lg font-mono leading-relaxed border border-red-500/10 p-4 rounded-xl bg-red-500/5">
                  <strong>RESTRICTED AREA:</strong> Super Admin access required. 
                  Please authenticate via Neural Biometric ID (Face/Touch) or Multi-Factor OTP. All unauthorized access attempts are logged and traced.
                </p>

                {/* Main Auth Screen split Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl border-t border-white/5 pt-8">
                  
                  {/* FaceID / Biometric scanner panel */}
                  <div className="flex flex-col items-center justify-center bg-black/40 border border-white/5 p-6 rounded-2xl relative group">
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-4">Biometric ID</h3>
                    
                    {/* Animated Holographic Scan circle */}
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-cyan-500/20 flex items-center justify-center relative mb-5 overflow-hidden">
                      {isScanning ? (
                        <>
                          <div className="absolute inset-0 border-2 border-cyan-500 rounded-full animate-spin border-t-transparent" />
                          <div className="h-0.5 bg-cyan-400 w-full absolute top-1/2 left-0 animate-bounce shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                          <span className="text-xs font-mono font-bold text-cyan-400 animate-pulse">{scanProgress}%</span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <Eye className="w-10 h-10 text-cyan-500/50 group-hover:text-cyan-400 transition-colors" />
                          <span className="text-[9px] font-mono text-cyan-500/40">CAMERA STANDBY</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={triggerFaceScan}
                      disabled={isScanning}
                      className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 rounded-xl text-[10px] font-black tracking-widest cursor-pointer uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    >
                      {isScanning ? 'Scanning...' : 'Trigger Face / Touch ID'}
                    </button>
                  </div>

                  {/* OTP / PIN Pad panel */}
                  <div className="flex flex-col items-center justify-center bg-black/40 border border-white/5 p-6 rounded-2xl">
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-3">OTP Verification</h3>
                    
                    <div className="text-[10px] text-white/40 mb-4 font-mono text-center">
                      Enter 4-digit Master OTP
                    </div>

                    {/* Glowing PIN status bubbles */}
                    <div className="flex gap-2.5 mb-5 h-7 items-center justify-center">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                            pinInput.length > idx 
                              ? 'bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] scale-110' 
                              : 'bg-transparent border-white/20'
                          }`} 
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 w-full max-w-[200px]">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                        <button
                          key={num}
                          onClick={() => handleKeypadPress(num)}
                          className="h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono font-bold text-sm cursor-pointer transition-all flex items-center justify-center"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={() => setPinInput('')}
                        className="h-10 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-mono font-black text-[10px] cursor-pointer transition-all flex items-center justify-center"
                      >
                        CLR
                      </button>
                      <button
                        onClick={() => handleKeypadPress('0')}
                        className="h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono font-bold text-sm cursor-pointer transition-all flex items-center justify-center"
                      >
                        0
                      </button>
                      <div className="h-10 flex items-center justify-center text-[10px] font-mono text-white/30 select-none">
                        PIN
                      </div>
                    </div>
                  </div>

                </div>

                {/* Display Auth Errors if present */}
                {authError && (
                  <div className="mt-6 text-xs text-red-500 font-mono font-bold animate-shake uppercase tracking-widest">
                    🚨 {authError} 🚨
                  </div>
                )}
                
                {/* Bypass hint visible only to owner */}
                <div className="mt-8 text-[9px] font-mono text-white/20 select-none">
                  INTEGRITY STATUS: COLD-BYPASS SECURITY TERMINAL active. HINT: {"`1337`"}
                </div>

              </GlassCard>
            </motion.div>
          ) : (
            
            // 👑 UNLOCKED SUPER ADMIN OWNER INTERFACE
            <motion.div
              key="auth-gate-unlocked"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              
              {/* Unlocked banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/15 via-[#0c2e28]/20 to-transparent border border-emerald-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.06)] relative overflow-hidden animate-pulse-slow">
                
                {/* Floating cyan cyber sparkles */}
                <span className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Unlock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-1.5">
                      <span>👑</span> <span>SYSTEM SECURED AND ONLINE</span>
                    </h3>
                    <p className="text-xs text-white/60 font-light leading-relaxed">
                      Logged in as master administrator: <span className="font-bold text-emerald-400">{ownerName}</span>. System telemetry synched.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsLocked(true);
                    speakVoiceOutput("Proprietor panel secured. System locked.");
                  }}
                  className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-extrabold cursor-pointer transition-all uppercase tracking-wider shadow-md hover:shadow-lg"
                >
                  Secured Lockout
                </button>
              </div>

              {/* Master Dashboard Module grids */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. DYNAMIC CMS SERVICE NAME EDITOR COLUMN */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  
                  <GlassCard className="border border-white/10 p-6 bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col gap-5">
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-cyan-400" />
                        <span>Unified Platform CMS Controller</span>
                      </h3>
                      <button
                        onClick={handleRestoreDefaults}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black tracking-widest rounded-lg cursor-pointer uppercase transition-all flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>

                    {cmsAlert && (
                      <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs font-bold text-cyan-300 font-mono animate-pulse">
                        {cmsAlert}
                      </div>
                    )}

                    {/* Futuristic Glassy CMS Tab Selector Bar */}
                    <div className="flex border-b border-white/5 pb-2 overflow-x-auto gap-1">
                      {[
                        { id: 'services', label: '📁 Services', color: 'text-cyan-400 border-cyan-400 bg-cyan-500/5' },
                        { id: 'about', label: '👤 About Page', color: 'text-indigo-400 border-indigo-400 bg-indigo-500/5' },
                        { id: 'pricing', label: '🏷️ Pricing Tiers', color: 'text-purple-400 border-purple-400 bg-purple-500/5' },
                        { id: 'lab', label: '🧪 Data Lab', color: 'text-emerald-400 border-emerald-400 bg-emerald-500/5' },
                        { id: 'team', label: '👥 Team Mgt', color: 'text-rose-400 border-rose-400 bg-rose-500/5' },
                        { id: 'plans', label: '🏗️ Plan Builder', color: 'text-amber-400 border-amber-400 bg-amber-500/5' },
                        { id: 'revenue', label: '💳 Revenue Ledger', color: 'text-teal-400 border-teal-400 bg-teal-500/5' },
                        { id: 'vault', label: '🔑 Key Vault', color: 'text-yellow-400 border-yellow-400 bg-yellow-500/5' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveCmsTab(tab.id as any)}
                          className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                            activeCmsTab === tab.id
                              ? `${tab.color} border-white/20 shadow-md`
                              : 'text-white/40 border-transparent hover:text-white/70 hover:bg-white/5'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {/* ==========================================
                          📁 TAB 1: SERVICES CMS EDITOR
                          ========================================== */}
                      {activeCmsTab === 'services' && (
                        <motion.div
                          key="cms-tab-services"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="flex flex-col gap-2">
                            <label className="text-xs text-white/50 font-bold uppercase tracking-wider">Select Platform Service to Customize:</label>
                            <select
                              value={selectedServiceSlug}
                              onChange={(e) => setSelectedServiceSlug(e.target.value)}
                              className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                            >
                              {services.map(s => (
                                <option key={s.slug} value={s.slug} className="bg-[#070b19] py-2 text-white">
                                  {s.title} ({s.slug})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs text-white/50 font-bold">Service Name (Title):</label>
                              <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                              />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <label className="text-xs text-white/50 font-bold">Starting Price (USD):</label>
                              <input
                                type="number"
                                value={editedPrice}
                                onChange={(e) => setEditedPrice(parseInt(e.target.value) || 0)}
                                className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-xs text-white/50 font-bold">Service Tagline (Subheading):</label>
                            <input
                              type="text"
                              value={editedTagline}
                              onChange={(e) => setEditedTagline(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-xs text-white/50 font-bold">Service Description:</label>
                            <textarea
                              value={editedDesc}
                              onChange={(e) => setEditedDesc(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono h-20 resize-none"
                            />
                          </div>

                          <div className="flex flex-col gap-2.5 border-t border-white/5 pt-4">
                            <label className="text-xs text-white/50 font-bold uppercase tracking-wider">Features Checklist:</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {editedFeatures.map((f, i) => (
                                <div 
                                  key={i} 
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 font-mono text-[10px]"
                                >
                                  <span>✓</span>
                                  <span>{f}</span>
                                  <button
                                    onClick={() => handleRemoveFeature(i)}
                                    className="text-red-400 hover:text-red-300 font-bold font-sans cursor-pointer pl-1 ml-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newFeatureText}
                                onChange={(e) => setNewFeatureText(e.target.value)}
                                placeholder="e.g. 24/7 dedicated system monitoring..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddFeature();
                                  }
                                }}
                              />
                              <button
                                onClick={handleAddFeature}
                                className="px-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={handleSaveServiceCMSEntity}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-lg hover:shadow-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4 animate-bounce" />
                            <span>Save Services CMS & Sync</span>
                          </button>
                        </motion.div>
                      )}

                      {/* ==========================================
                          👤 TAB 2: ABOUT PAGE CMS EDITOR
                          ========================================== */}
                      {activeCmsTab === 'about' && (
                        <motion.div
                          key="cms-tab-about"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs text-white/50 font-bold">Hero Profile Name:</label>
                              <input
                                type="text"
                                value={aboutName}
                                onChange={(e) => setAboutName(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-400 transition-all font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs text-white/50 font-bold">Hero Professional Titles:</label>
                              <input
                                type="text"
                                value={aboutTitles}
                                onChange={(e) => setAboutTitles(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-400 transition-all font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-xs text-white/50 font-bold">Hero Story Description:</label>
                            <textarea
                              value={aboutHeroDesc}
                              onChange={(e) => setAboutHeroDesc(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-400 transition-all font-mono h-24 resize-none"
                            />
                          </div>

                          {/* Statistics Editor */}
                          <div className="border-t border-white/5 pt-4">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider block mb-3">Core Performance Stats:</span>
                            <div className="grid grid-cols-2 gap-3">
                              {aboutStats.map((stat, idx) => (
                                <div key={idx} className="bg-black/30 border border-white/5 p-3 rounded-xl space-y-2">
                                  <span className="text-[10px] text-indigo-400 font-bold font-mono">STAT BLOCK #{idx + 1}</span>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={stat.value}
                                      placeholder="Value"
                                      onChange={(e) => handleUpdateStat(idx, 'value', e.target.value)}
                                      className="w-1/3 bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none font-mono text-center"
                                    />
                                    <input
                                      type="text"
                                      value={stat.label}
                                      placeholder="Label"
                                      onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                                      className="w-2/3 bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none font-mono"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Achievements Milestones Timeline Editor */}
                          <div className="border-t border-white/5 pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Achievements Timeline Milestones:</span>
                              <button
                                onClick={handleAddMilestone}
                                className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[9px] font-black uppercase transition-all"
                              >
                                + Add Milestone
                              </button>
                            </div>

                            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                              {aboutMilestones.map((m, idx) => (
                                <div key={idx} className="bg-black/40 border border-white/10 p-3 rounded-xl relative flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={m.year}
                                      onChange={(e) => handleUpdateMilestone(idx, 'year', e.target.value)}
                                      className="w-16 bg-black/50 border border-white/15 rounded px-2 py-1 text-xs text-indigo-300 font-bold font-mono text-center"
                                      placeholder="Year"
                                    />
                                    <input
                                      type="text"
                                      value={m.title}
                                      onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                                      className="flex-1 bg-black/50 border border-white/15 rounded px-2.5 py-1 text-xs text-white font-mono"
                                      placeholder="Milestone Title"
                                    />
                                    <button
                                      onClick={() => handleRemoveMilestone(idx)}
                                      className="text-red-400 hover:text-red-300 font-bold font-sans text-sm px-1.5 cursor-pointer"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <textarea
                                    value={m.desc}
                                    onChange={(e) => handleUpdateMilestone(idx, 'desc', e.target.value)}
                                    className="w-full bg-black/50 border border-white/15 rounded px-2 py-1 text-[11px] text-white/70 outline-none font-mono h-12 resize-none"
                                    placeholder="Describe this historical achievement event..."
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={handleSaveAboutCMS}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-lg hover:shadow-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4 animate-bounce" />
                            <span>Save About Page CMS & Sync</span>
                          </button>
                        </motion.div>
                      )}

                      {/* ==========================================
                          🏷️ TAB 3: PRICING TIERS CMS EDITOR
                          ========================================== */}
                      {activeCmsTab === 'pricing' && (
                        <motion.div
                          key="cms-tab-pricing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="flex border border-white/10 rounded-xl overflow-hidden bg-black/30 p-1">
                            {pricingTiers.map((tier, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedTierIndex(idx)}
                                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                                  selectedTierIndex === idx 
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                    : 'text-white/40 border-transparent hover:text-white/70'
                                }`}
                              >
                                {tier.name} Plan
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1.5 col-span-1">
                              <label className="text-[10px] text-white/50 font-bold">Tier Name:</label>
                              <input
                                type="text"
                                value={editedTierName}
                                onChange={(e) => setEditedTierName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400 font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5 col-span-1">
                              <label className="text-[10px] text-white/50 font-bold">Monthly Price ($):</label>
                              <input
                                type="number"
                                value={editedTierMonthly}
                                onChange={(e) => setEditedTierMonthly(parseInt(e.target.value) || 0)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400 font-mono text-center"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5 col-span-1">
                              <label className="text-[10px] text-white/50 font-bold">Annual Price ($):</label>
                              <input
                                type="number"
                                value={editedTierAnnual}
                                onChange={(e) => setEditedTierAnnual(parseInt(e.target.value) || 0)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-400 font-mono text-center"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-white/50 font-bold">Plan Tagline Description:</label>
                            <input
                              type="text"
                              value={editedTierDesc}
                              onChange={(e) => setEditedTierDesc(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-400 font-mono"
                            />
                          </div>

                          <div className="flex flex-col gap-2.5 border-t border-white/5 pt-4">
                            <label className="text-xs text-white/50 font-bold uppercase tracking-wider">Features Included ({editedTierFeatures.length}):</label>
                            
                            <div className="flex flex-wrap gap-2 mb-2 max-h-[140px] overflow-y-auto p-1 border border-white/5 rounded-xl bg-black/20">
                              {editedTierFeatures.map((f, i) => (
                                <div 
                                  key={i} 
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[9px]"
                                >
                                  <span>✓</span>
                                  <span>{f}</span>
                                  <button
                                    onClick={() => handleRemovePricingFeature(i)}
                                    className="text-red-400 hover:text-red-300 font-bold font-sans cursor-pointer pl-1 ml-1"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTierFeatureText}
                                onChange={(e) => setNewTierFeatureText(e.target.value)}
                                placeholder="e.g. Customizable ML predictions dashboard..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400 transition-all font-mono"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddPricingFeature();
                                  }
                                }}
                              />
                              <button
                                onClick={handleAddPricingFeature}
                                className="px-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={handleSavePricingCMS}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-lg hover:shadow-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4 animate-bounce" />
                            <span>Save Pricing Tiers CMS & Sync</span>
                          </button>
                        </motion.div>
                      )}

                      {/* ==========================================
                          🧪 TAB 4: DATA LAB CMS EDITOR
                          ========================================== */}
                      {activeCmsTab === 'lab' && (
                        <motion.div
                          key="cms-tab-lab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs text-white/50 font-bold">Hero Badge Tag:</label>
                              <input
                                type="text"
                                value={labHeroTag}
                                onChange={(e) => setLabHeroTag(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-400 transition-all font-mono"
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs text-white/50 font-bold font-mono">Hero Main Heading & Gradient Text:</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={labHeroHeading}
                                  onChange={(e) => setLabHeroHeading(e.target.value)}
                                  className="w-1/2 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-400 transition-all font-mono"
                                  placeholder="Hero Head"
                                />
                                <input
                                  type="text"
                                  value={labHeroHeadingGrad}
                                  onChange={(e) => setLabHeroHeadingGrad(e.target.value)}
                                  className="w-1/2 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-emerald-400 outline-none focus:border-emerald-400 transition-all font-mono"
                                  placeholder="Grad text"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-xs text-white/50 font-bold">Hero Subheading Description:</label>
                            <textarea
                              value={labHeroSubheading}
                              onChange={(e) => setLabHeroSubheading(e.target.value)}
                              className="bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-400 transition-all font-mono h-20 resize-none"
                            />
                          </div>

                          {/* Data Lab Sandbox KPIs */}
                          <div className="border-t border-white/5 pt-4">
                            <span className="text-xs text-white/50 font-bold uppercase tracking-wider block mb-3">Custom AI Sandbox KPIs:</span>
                            
                            <div className="grid grid-cols-3 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-white/40">Model Accuracy:</span>
                                <input
                                  type="text"
                                  value={labStatAcc}
                                  onChange={(e) => setLabStatAcc(e.target.value)}
                                  className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 outline-none focus:border-emerald-400 font-mono text-center font-bold"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-white/40">Training Speed:</span>
                                <input
                                  type="text"
                                  value={labStatSpeed}
                                  onChange={(e) => setLabStatSpeed(e.target.value)}
                                  className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 outline-none focus:border-emerald-400 font-mono text-center font-bold"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] text-white/40">Simulated Queries:</span>
                                <input
                                  type="text"
                                  value={labStatQueries}
                                  onChange={(e) => setLabStatQueries(e.target.value)}
                                  className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 outline-none focus:border-emerald-400 font-mono text-center font-bold"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleSaveLabCMS}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-lg hover:shadow-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            <Save className="w-4 h-4 animate-bounce" />
                            <span>Save Data Lab CMS & Sync</span>
                          </button>
                        </motion.div>
                      )}

                      {/* ==========================================
                          👥 TAB 5: TEAM MANAGEMENT COCKPIT
                          ========================================== */}
                      {activeCmsTab === 'team' && (
                        <motion.div
                          key="cms-tab-team"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          {sessionUser?.role !== 'SUPER-ADMIN' ? (
                            <div className="flex flex-col items-center justify-center p-8 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
                              <ShieldAlert className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
                              <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Access Restrict</h4>
                              <p className="text-xs text-white/50 max-w-sm mt-1 leading-relaxed">
                                Team Management requires SUPER-ADMIN credentials. Your current role is <span className="font-bold text-white uppercase">{sessionUser?.role || 'Guest'}</span>.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Roster list */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Active System Team Roster ({teamMembers.length})</h4>
                                <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 max-h-[220px] overflow-y-auto">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="bg-white/5 border-b border-white/10 text-white/60 font-mono text-[10px]">
                                        <th className="p-3 font-semibold uppercase">Name</th>
                                        <th className="p-3 font-semibold uppercase">Email</th>
                                        <th className="p-3 font-semibold uppercase">Role</th>
                                        <th className="p-3 font-semibold uppercase text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                                      {teamMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                          <td className="p-3 font-sans font-medium text-white">{member.name}</td>
                                          <td className="p-3 text-white/60">{member.email}</td>
                                          <td className="p-3">
                                            <select
                                              value={member.role}
                                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                              className="bg-black/60 border border-white/10 rounded-md px-2 py-1 text-[10px] text-emerald-400 outline-none cursor-pointer"
                                            >
                                              <option value="SUPER-ADMIN">SUPER-ADMIN</option>
                                              <option value="FINANCE">FINANCE</option>
                                              <option value="SUPPORT">SUPPORT</option>
                                              <option value="USER">USER</option>
                                            </select>
                                          </td>
                                          <td className="p-3 text-right">
                                            <button
                                              onClick={() => handleRevokeAccess(member.id)}
                                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors cursor-pointer inline-flex items-center"
                                              title="Revoke Member Access"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Invite Form */}
                              <form onSubmit={handleInviteTeam} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Plus className="w-4 h-4" />
                                  <span>Invite New Platform Operator</span>
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-white/50 font-bold">Full Name:</span>
                                    <input
                                      type="text"
                                      value={newTeamName}
                                      onChange={(e) => setNewTeamName(e.target.value)}
                                      placeholder="John Doe"
                                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-400 font-mono"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-white/50 font-bold">Email Address:</span>
                                    <input
                                      type="email"
                                      value={newTeamEmail}
                                      onChange={(e) => setNewTeamEmail(e.target.value)}
                                      placeholder="operator@company.com"
                                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-400 font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-white/50 font-bold">Account Access Role:</span>
                                    <select
                                      value={newTeamRole}
                                      onChange={(e) => setNewTeamRole(e.target.value)}
                                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-400 font-mono"
                                    >
                                      <option value="SUPER-ADMIN">SUPER-ADMIN (Full Access)</option>
                                      <option value="FINANCE">FINANCE (Analytics & Billing)</option>
                                      <option value="SUPPORT">SUPPORT (CMS & Service management)</option>
                                    </select>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] text-white/50 font-bold">Temporary Password:</span>
                                    <input
                                      type="password"
                                      value={newTeamPassword}
                                      onChange={(e) => setNewTeamPassword(e.target.value)}
                                      placeholder="••••••••"
                                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-rose-400 font-mono"
                                    />
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all tracking-wider uppercase"
                                >
                                  Register Active Team Operator
                                </button>
                              </form>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* ==========================================
                          🏗️ TAB 6: PLAN BUILDER & PRICING MANAGER
                          ========================================== */}
                      {activeCmsTab === 'plans' && (
                        <motion.div
                          key="cms-tab-plans"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          {pricingManagerAlert && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-300 font-mono animate-pulse">
                              {pricingManagerAlert}
                            </div>
                          )}

                          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {/* Left Col: Pricing Manager */}
                            <div className="xl:col-span-5 space-y-4">
                              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">SaaS Plans Manager</h4>
                              
                              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                                {pricingPlansFromDb.map((tier, idx) => (
                                  <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3.5 relative overflow-hidden group">
                                    <div className="flex justify-between items-center">
                                      <h5 className="font-bold text-white font-mono text-sm uppercase tracking-wider">{tier.name}</h5>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] text-white/40 font-mono">STATUS:</span>
                                        <button
                                          onClick={() => handleUpdatePlanPricingLocal(tier.id || tier.name.toLowerCase(), tier.monthly || tier.basePrice, tier.discount || 0, !tier.isActive)}
                                          className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase cursor-pointer ${
                                            tier.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                          }`}
                                        >
                                          {tier.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-white/40">Base Price ($):</span>
                                        <input
                                          type="number"
                                          defaultValue={tier.monthly || tier.basePrice || 0}
                                          onBlur={(e) => handleUpdatePlanPricingLocal(tier.id || tier.name.toLowerCase(), parseInt(e.target.value) || 0, tier.discount || 0, tier.isActive)}
                                          className="bg-black/50 border border-white/5 rounded px-2.5 py-1 text-white font-mono"
                                        />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-white/40">Discount (%):</span>
                                        <input
                                          type="number"
                                          defaultValue={tier.discount || 0}
                                          onBlur={(e) => handleUpdatePlanPricingLocal(tier.id || tier.name.toLowerCase(), tier.monthly || tier.basePrice, parseInt(e.target.value) || 0, tier.isActive)}
                                          className="bg-black/50 border border-white/5 rounded px-2.5 py-1 text-white font-mono text-center"
                                        />
                                      </div>
                                    </div>

                                    <div className="text-[10px] text-white/40 font-mono leading-relaxed border-t border-white/5 pt-2 flex justify-between">
                                      <span>Checkout Value:</span>
                                      <span className="font-bold text-amber-400">$ {Math.round((tier.monthly || tier.basePrice || 0) * (1 - (tier.discount || 0) / 100))} / mo</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right Col: Feature Matrix Checklist */}
                            <div className="xl:col-span-7 space-y-4">
                              <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Dynamic Feature Permissions Matrix</h4>
                              
                              <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-white/5 border-b border-white/10 text-white/60 font-mono text-[10px]">
                                      <th className="p-3 font-semibold uppercase">SaaS System Feature</th>
                                      {pricingPlansFromDb.map((p, i) => (
                                        <th key={i} className="p-3 font-semibold uppercase text-center">{p.name}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                                    {masterFeatures.map((feat) => (
                                      <tr key={feat.code} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3">
                                          <div className="font-sans font-medium text-white">{feat.name}</div>
                                          <div className="text-[10px] text-white/40 font-mono font-light mt-0.5">{feat.description}</div>
                                        </td>
                                        {pricingPlansFromDb.map((plan) => {
                                          const isMapped = planFeatureMappings.some(m => m.planId === (plan.id || plan.name.toLowerCase()) && m.featureCode === feat.code);
                                          return (
                                            <td key={plan.id} className="p-3 text-center">
                                              <button
                                                type="button"
                                                onClick={() => handleTogglePlanFeature(plan.id || plan.name.toLowerCase(), feat.code)}
                                                className="inline-flex items-center justify-center p-1 rounded hover:bg-white/10 text-white transition-all cursor-pointer"
                                              >
                                                {isMapped ? (
                                                  <CheckSquare className="w-5 h-5 text-amber-400" />
                                                ) : (
                                                  <Square className="w-5 h-5 text-white/20" />
                                                )}
                                              </button>
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* ==========================================
                          💳 TAB 7: REVENUE DASHBOARD & TRANSACTIONS
                          ========================================== */}
                      {activeCmsTab === 'revenue' && (
                        <motion.div
                          key="cms-tab-revenue"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          {/* Financial micro widgets */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-center font-mono">
                              <span className="text-[10px] text-white/40 block mb-1">REAL gross earnings</span>
                              <span className="text-xl font-bold text-teal-400">
                                $ {transactions.filter(t => t.status === 'SUCCESS').reduce((acc, curr) => acc + curr.amount, 0)}
                              </span>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-center font-mono">
                              <span className="text-[10px] text-white/40 block mb-1">TOTAL checkouts</span>
                              <span className="text-xl font-bold text-white">{transactions.length}</span>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-center font-mono">
                              <span className="text-[10px] text-white/40 block mb-1">REFUND rate</span>
                              <span className="text-xl font-bold text-red-400">
                                {transactions.length > 0 
                                  ? `${Math.round((transactions.filter(t => t.status === 'REFUNDED').length / transactions.length) * 100)}%` 
                                  : '0%'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Transaction Auditing Ledger</h4>
                            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 max-h-[260px] overflow-y-auto">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-white/5 border-b border-white/10 text-white/60 font-mono text-[10px]">
                                    <th className="p-3 font-semibold uppercase">Tx Reference ID</th>
                                    <th className="p-3 font-semibold uppercase">Client</th>
                                    <th className="p-3 font-semibold uppercase">Amount</th>
                                    <th className="p-3 font-semibold uppercase">Status</th>
                                    <th className="p-3 font-semibold uppercase text-right">Refund Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-white/80 font-mono">
                                  {transactions.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="p-8 text-center text-white/30 italic">
                                        No platform payment transactions simulated yet.
                                      </td>
                                    </tr>
                                  ) : (
                                    transactions.map((tx) => (
                                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-mono font-medium text-white">{tx.referenceId}</td>
                                        <td className="p-3">
                                          <div className="text-white/95 font-sans">{tx.clientName}</div>
                                          <div className="text-[9px] text-white/40">{tx.clientEmail}</div>
                                        </td>
                                        <td className="p-3 text-emerald-400 font-bold">$ {tx.amount}</td>
                                        <td className="p-3">
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase ${
                                            tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            tx.status === 'REFUNDED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                          }`}>
                                            {tx.status}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right">
                                          {tx.status === 'SUCCESS' ? (
                                            <button
                                              onClick={() => handleProcessRefundLocal(tx.id)}
                                              disabled={selectedTxIdForRefund === tx.id}
                                              className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[9px] font-black tracking-widest rounded cursor-pointer uppercase flex items-center gap-1.5 ml-auto disabled:opacity-50"
                                            >
                                              {selectedTxIdForRefund === tx.id ? (
                                                <div className="w-2.5 h-2.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                              ) : (
                                                <CreditCard className="w-3 h-3" />
                                              )}
                                              <span>REFUND</span>
                                            </button>
                                          ) : (
                                            <span className="text-[9px] text-white/20 italic select-none">VOID</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* ==========================================
                          🔑 TAB 8: CRYPTOGRAPHIC SECRETS VAULT
                          ========================================== */}
                      {activeCmsTab === 'vault' && (
                        <motion.div
                          key="cms-tab-vault"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          {sessionUser?.role !== 'SUPER-ADMIN' ? (
                            <div className="flex flex-col items-center justify-center p-8 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
                              <ShieldAlert className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
                              <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Access Restrict</h4>
                              <p className="text-xs text-white/50 max-w-sm mt-1 leading-relaxed">
                                Security Vault editing requires SUPER-ADMIN credentials. Your current role is <span className="font-bold text-white uppercase">{sessionUser?.role || 'Guest'}</span>.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left Col: Masked Secrets keys */}
                              <div className="lg:col-span-6 space-y-4">
                                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-1">
                                  <Shield className="w-4 h-4 text-emerald-400" />
                                  <span>Active Encrypted Keys Vault</span>
                                </h4>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                  {vaultKeys.length === 0 ? (
                                    <div className="p-6 bg-black/20 border border-white/5 rounded-xl text-center text-white/30 italic text-xs font-mono">
                                      Zero encrypted secrets in database store.
                                    </div>
                                  ) : (
                                    vaultKeys.map((k) => (
                                      <div key={k.key} className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between font-mono text-[10px]">
                                        <div className="space-y-1">
                                          <div className="text-white font-bold tracking-wider">{k.key}</div>
                                          <div className="text-[8px] text-white/30">Synced: {new Date(k.updatedAt).toLocaleString()}</div>
                                        </div>
                                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded font-black tracking-wider uppercase text-[8px]">
                                          AES-GCM SECURED
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Right Col: Save Secrets Form */}
                              <form onSubmit={handleSaveSecretLocal} className="lg:col-span-6 bg-white/5 border border-white/10 rounded-xl p-4 space-y-4 h-fit">
                                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Key className="w-4 h-4 animate-pulse" />
                                  <span>Encrypt and Store Secret Key</span>
                                </h4>
                                
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] text-white/50 font-bold">Key Identifier:</span>
                                  <input
                                    type="text"
                                    value={newSecretKey}
                                    onChange={(e) => setNewSecretKey(e.target.value.toUpperCase())}
                                    placeholder="e.g. STRIPE_SECRET_KEY"
                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-yellow-400 font-mono"
                                  />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] text-white/50 font-bold">Raw Value to Encrypt:</span>
                                  <input
                                    type="password"
                                    value={newSecretValue}
                                    onChange={(e) => setNewSecretValue(e.target.value)}
                                    placeholder="sk_live_••••••••"
                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-yellow-400 font-mono"
                                  />
                                </div>

                                <button
                                  type="submit"
                                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all tracking-wider uppercase flex items-center justify-center gap-2"
                                >
                                  <Shield className="w-4 h-4" />
                                  <span>Securely Commit to DB Vault</span>
                                </button>
                              </form>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </GlassCard>

                  {/* CMS BRAND OWNER IDENTITY FORM */}
                  <GlassCard className="border border-white/10 p-6 bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col gap-4">
                    <h3 className="text-md font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                      <Users className="w-5 h-5 text-indigo-400" />
                      <span>CMS Brand Identity & Settings</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest">Brand Logo Mark</span>
                        <input
                          type="text"
                          value={brandLogo}
                          onChange={(e) => setBrandLogo(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest">Master Owner Name</span>
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest">Master Support Email</span>
                        <input
                          type="text"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest">Emergency Alert Phone</span>
                        <input
                          type="text"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>
                  </GlassCard>

                </div>

                {/* 2. INFRASTRUCTURE & AI MASTER PLATFORM HUB COLUMN */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  
                  {/* MASTER PLATFORM & EMERGENCY SWITCHES */}
                  <GlassCard className="border border-white/10 p-6 bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl flex flex-col gap-5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                      <Cpu className="w-5 h-5 text-red-400" />
                      <span>Master Infrastructure & AI settings</span>
                    </h3>

                    {/* Site Maintenance Freeze Toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-black/40 rounded-xl border border-white/5">
                      <div>
                        <h4 className="text-xs font-bold text-white mb-0.5">Database Site-Freeze</h4>
                        <p className="text-[10px] text-white/40">Places all active databases and repositories in READ-ONLY sync.</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsFrozen(!isFrozen);
                          speakVoiceOutput(isFrozen ? "System database unfrozen." : "System frozen in read-only mode.");
                        }}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 relative cursor-pointer ${isFrozen ? 'bg-amber-500' : 'bg-white/10'}`}
                      >
                        <div className={`w-5.5 h-5.5 rounded-full bg-white transition-all shadow-md ${isFrozen ? 'translate-x-5.5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Emergency Platform Shutdown Toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-black/40 rounded-xl border border-red-500/10">
                      <div>
                        <h4 className="text-xs font-bold text-red-400 mb-0.5">Emergency System Freeze</h4>
                        <p className="text-[10px] text-white/40">Blocks active WebSockets and cuts CPU metrics to simulated safe-mode.</p>
                      </div>
                      
                      {shutdownStep === 'idle' && (
                        <button
                          onClick={() => setShutdownStep('warning')}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-[10px] font-black tracking-wider cursor-pointer uppercase transition-all"
                        >
                          Execute Freeze
                        </button>
                      )}

                      {shutdownStep === 'warning' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShutdownStep('freezing');
                              speakVoiceOutput("Warning. Shutdown protocol committed. Freezing CPU clusters.");
                              setTimeout(() => {
                                setShutdownStep('frozen');
                                setIsShutdown(true);
                              }, 3000);
                            }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-black tracking-wider cursor-pointer uppercase"
                          >
                            CONFIRM SHUTDOWN
                          </button>
                          <button
                            onClick={() => setShutdownStep('idle')}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-[9px] font-black tracking-wider cursor-pointer uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {shutdownStep === 'freezing' && (
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500 animate-pulse">
                          <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span>FREEZING CPU...</span>
                        </div>
                      )}

                      {shutdownStep === 'frozen' && (
                        <button
                          onClick={() => {
                            setShutdownStep('idle');
                            setIsShutdown(false);
                            speakVoiceOutput("Platform restored to normal levels. Networks online.");
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black tracking-wider cursor-pointer uppercase shadow-md animate-pulse"
                        >
                          RESTORE INFRASTRUCTURE
                        </button>
                      )}
                    </div>

                    {/* AI Settings Sliders */}
                    <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                      <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Active Model Orchestration</h4>

                      {/* Model Select */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-white/40">Default Core LLM</span>
                          <select
                            value={llmModel}
                            onChange={(e) => {
                              setLlmModel(e.target.value);
                            }}
                            className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                          >
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="claude-3-opus">Claude 3 Opus</option>
                            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </GlassCard>


                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

    </div>
  );
}
