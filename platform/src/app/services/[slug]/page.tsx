'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Container from '@/components/ui/Container';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';

/* ─── Full service data ─── */
const allServices: Record<string, {
  title: string; tagline: string; desc: string; price: number; color: string;
  icon: string;
  features: { title: string; desc: string; icon: string }[];
  tools: string[];
  faqs: { q: string; a: string }[];
  addons: { name: string; price: number }[];
  testimonials: { name: string; role: string; text: string; rating: number }[];
  cases: { title: string; desc: string; result: string }[];
}> = {
  'data-analytics': {
    title: 'Data Analytics', tagline: 'Transform data into insights', desc: 'Unlock the full potential of your data with advanced analytics, statistical modeling, predictive forecasting, and beautiful visualizations that drive smarter business decisions.', price: 499, color: 'from-blue-500 to-cyan-500',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    features: [
      { title: 'Exploratory Analysis', desc: 'Deep-dive into your datasets to uncover hidden patterns and correlations.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      { title: 'Predictive Modeling', desc: 'Machine learning models that forecast trends and future outcomes.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { title: 'Data Pipelines', desc: 'Automated ETL pipelines that clean, transform, and load your data.', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      { title: 'Visualization', desc: 'Interactive charts and dashboards that tell a compelling data story.', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
      { title: 'Statistical Testing', desc: 'Rigorous A/B testing and hypothesis validation for data-driven decisions.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { title: 'Reporting', desc: 'Automated reports delivered on schedule with key metrics and insights.', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ],
    tools: ['Python', 'Pandas', 'NumPy', 'SQL', 'Power BI', 'Tableau', 'Jupyter', 'Apache Spark'],
    addons: [{ name: 'Real-time streaming analytics', price: 300 }, { name: 'Custom ML model', price: 500 }, { name: 'Monthly reporting retainer', price: 200 }],
    testimonials: [
      { name: 'Sarah Chen', role: 'VP of Operations, TechCorp', text: 'The analytics dashboard Alex built increased our decision speed by 3x. Incredible work.', rating: 5 },
      { name: 'Michael Torres', role: 'CEO, DataFlow Inc', text: 'Finally, someone who understands both data and business. The insights were game-changing.', rating: 5 },
    ],
    cases: [
      { title: 'E-commerce Revenue Analytics', desc: 'Built a comprehensive analytics suite for a $10M e-commerce brand.', result: '+34% revenue increase' },
      { title: 'Supply Chain Optimization', desc: 'Reduced inventory costs through predictive demand forecasting.', result: '$2.1M saved annually' },
      { title: 'Customer Churn Prediction', desc: 'ML model that identifies at-risk customers before they leave.', result: '28% churn reduction' },
    ],
    faqs: [
      { q: 'What data formats do you work with?', a: 'I work with CSV, JSON, SQL databases, APIs, Excel, Google Sheets, and virtually any structured or semi-structured data source.' },
      { q: 'How long does a typical analytics project take?', a: 'Most projects are delivered within 2-4 weeks depending on complexity. Simple analyses can be completed in under a week.' },
      { q: 'Do you provide ongoing analytics support?', a: 'Yes! I offer monthly retainer packages for ongoing analytics, reporting, and model maintenance.' },
      { q: 'Can you work with our existing tools?', a: 'Absolutely. I integrate with your existing tech stack — Power BI, Tableau, Looker, or custom solutions.' },
      { q: 'What\'s included in the starting price?', a: 'The base price includes data audit, exploratory analysis, up to 3 visualizations, and a comprehensive insights report.' },
    ],
  },
  'dashboard-development': {
    title: 'Dashboard Development', tagline: 'Interactive visual dashboards', desc: 'Design and build real-time interactive dashboards that consolidate your key metrics, enable drill-down analysis, and empower stakeholders with self-service analytics.', price: 799, color: 'from-emerald-500 to-teal-500',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
    features: [
      { title: 'Real-Time Data', desc: 'Live data feeds that update dashboards in real-time.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { title: 'KPI Tracking', desc: 'Custom KPI widgets with thresholds and alerts.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z' },
      { title: 'Drill-Down Views', desc: 'Click-through analytics from overview to detail.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
      { title: 'Multi-Source Integration', desc: 'Connect databases, APIs, spreadsheets, and more.', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z' },
      { title: 'Responsive Design', desc: 'Perfect on desktop, tablet, and mobile devices.', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
      { title: 'Automated Alerts', desc: 'Get notified when metrics hit critical thresholds.', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ],
    tools: ['Power BI', 'Tableau', 'React', 'D3.js', 'Plotly', 'SQL', 'REST APIs', 'WebSocket'],
    addons: [{ name: 'Additional data source', price: 200 }, { name: 'Mobile app dashboard', price: 400 }, { name: 'White-label branding', price: 300 }],
    testimonials: [
      { name: 'Emily Zhang', role: 'COO, RetailMax', text: 'The dashboard transformed how our leadership team makes decisions. We can now see everything at a glance.', rating: 5 },
      { name: 'David Park', role: 'CTO, FinTech Solutions', text: 'Real-time data feeds and the alert system alone saved us from two major issues. Worth every penny.', rating: 5 },
    ],
    cases: [
      { title: 'Retail Performance Dashboard', desc: 'Multi-store KPI dashboard with real-time sales tracking.', result: '40% faster decisions' },
      { title: 'Financial Reporting Suite', desc: 'Automated compliance dashboards for a fintech startup.', result: '60 hrs/mo saved' },
      { title: 'Marketing Analytics Hub', desc: 'Cross-channel marketing performance dashboard.', result: '22% ROI improvement' },
    ],
    faqs: [
      { q: 'Which dashboard tools do you use?', a: 'I build with Power BI, Tableau, or custom React-based dashboards depending on your needs and existing tooling.' },
      { q: 'Can the dashboard connect to our database?', a: 'Yes — I support PostgreSQL, MySQL, BigQuery, Snowflake, MongoDB, and most SQL/NoSQL databases.' },
      { q: 'Do you offer dashboard maintenance?', a: 'Yes, I offer monthly maintenance packages to keep your dashboards running smoothly and up-to-date.' },
      { q: 'How many users can access the dashboard?', a: 'Unlimited users with role-based access controls. Enterprise licensing may apply for third-party tools.' },
      { q: 'Can we embed dashboards in our app?', a: 'Absolutely. I build embeddable dashboards using iframe or API-based integration approaches.' },
    ],
  },
  'business-intelligence': {
    title: 'Business Intelligence', tagline: 'Strategic data-driven decisions', desc: 'Comprehensive BI solutions that combine executive reporting, competitive analysis, and strategic KPI frameworks to empower leadership with the insights they need.', price: 999, color: 'from-violet-500 to-purple-500',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    features: [
      { title: 'KPI Framework', desc: 'Design metrics that matter for your business goals.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6' },
      { title: 'Executive Reports', desc: 'Board-ready reports with strategic insights.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { title: 'Competitive Analysis', desc: 'Benchmark against competitors with data.', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
      { title: 'Market Forecasting', desc: 'Predict market trends and opportunities.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
      { title: 'Data Governance', desc: 'Policies and practices for data quality.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { title: 'Strategy Workshops', desc: 'Collaborative sessions to align data strategy.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    ],
    tools: ['Power BI', 'Tableau', 'SQL', 'Python', 'Excel', 'Looker', 'dbt', 'Snowflake'],
    addons: [{ name: 'Competitor tracking setup', price: 400 }, { name: 'Quarterly strategy review', price: 600 }, { name: 'Data governance audit', price: 350 }],
    testimonials: [
      { name: 'Robert Williams', role: 'CEO, GrowthCo', text: 'Alex helped us define the KPIs that actually matter. Our board meetings are now data-driven.', rating: 5 },
      { name: 'Lisa Anderson', role: 'VP Strategy, Nexus Corp', text: 'The competitive analysis framework gave us a massive strategic advantage. Highly recommend.', rating: 5 },
    ],
    cases: [
      { title: 'SaaS Growth Strategy', desc: 'End-to-end BI framework for a Series B SaaS company.', result: '2.5x ARR growth' },
      { title: 'Healthcare Analytics', desc: 'Patient outcome analytics for a hospital network.', result: '15% better outcomes' },
      { title: 'Retail Expansion', desc: 'Market analysis to identify optimal expansion locations.', result: '8 new locations' },
    ],
    faqs: [
      { q: 'What\'s the difference between analytics and BI?', a: 'Analytics focuses on analyzing data, while BI encompasses the strategy, tools, and processes to drive business decisions.' },
      { q: 'Do you work with our existing BI tools?', a: 'Yes, I integrate with Power BI, Tableau, Looker, and other platforms.' },
      { q: 'How do you define the right KPIs?', a: 'Through a collaborative workshop process aligned with your business goals, we identify the metrics that truly drive growth.' },
      { q: 'Can you train our team?', a: 'Absolutely. I provide hands-on training and documentation for your team.' },
      { q: 'What size companies do you work with?', a: 'From startups to enterprise — the approach scales to your needs.' },
    ],
  },
  'ai-agent-services': {
    title: 'AI Agent Services', tagline: 'Intelligent automation agents', desc: 'Build intelligent AI agents that automate complex workflows, make decisions, integrate with your tools, and continuously improve through learning.', price: 1499, color: 'from-amber-500 to-orange-500',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    features: [
      { title: 'Custom Agents', desc: 'Purpose-built agents for your specific use case.', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18' },
      { title: 'Multi-Agent Systems', desc: 'Orchestrated agent teams that collaborate.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7' },
      { title: 'Tool Integration', desc: 'Connect agents to APIs, databases, and services.', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101' },
      { title: 'RAG Systems', desc: 'Retrieval-augmented generation for accuracy.', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { title: 'Memory & Context', desc: 'Agents that remember and learn over time.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
      { title: 'Monitoring', desc: 'Real-time monitoring and performance tracking.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z' },
    ],
    tools: ['LangChain', 'OpenAI', 'Python', 'Pinecone', 'Redis', 'FastAPI', 'Docker', 'n8n'],
    addons: [{ name: 'Additional agent capability', price: 400 }, { name: 'Vector database setup', price: 300 }, { name: 'Monthly agent tuning', price: 250 }],
    testimonials: [
      { name: 'James Liu', role: 'CTO, AutomateX', text: 'The AI agent Alex built handles 80% of our support tickets autonomously. Game changer.', rating: 5 },
      { name: 'Maria Garcia', role: 'Head of Ops, ScaleUp', text: 'Multi-agent orchestration was exactly what we needed. Our processes run 10x faster now.', rating: 5 },
    ],
    cases: [
      { title: 'Support Agent', desc: 'AI agent handling customer support for an e-commerce platform.', result: '80% ticket resolution' },
      { title: 'Research Agent', desc: 'Automated competitive research across 50+ sources.', result: '20hrs/week saved' },
      { title: 'Sales Agent', desc: 'Lead qualification and outreach automation.', result: '3x qualified leads' },
    ],
    faqs: [
      { q: 'What LLMs do you use?', a: 'I work with OpenAI GPT-4, Claude, Gemini, and open-source models depending on your requirements and budget.' },
      { q: 'Can agents access our internal data?', a: 'Yes, through secure RAG systems with proper access controls and encryption.' },
      { q: 'How do you ensure accuracy?', a: 'Through RAG, guardrails, human-in-the-loop reviews, and continuous monitoring.' },
      { q: 'What about data privacy?', a: 'All data processing follows strict privacy protocols. I can deploy on-premise if needed.' },
      { q: 'How long to build an agent?', a: 'Simple agents: 1-2 weeks. Complex multi-agent systems: 4-8 weeks.' },
    ],
  },
  'ai-chatbots': {
    title: 'AI Chatbots', tagline: 'Smart conversational bots', desc: 'Deploy intelligent conversational AI that engages customers 24/7, answers questions accurately, books appointments, and drives conversions — across web, mobile, and messaging platforms.', price: 699, color: 'from-pink-500 to-rose-500',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    features: [
      { title: 'NLP Engine', desc: 'Understand natural language with high accuracy.', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8' },
      { title: 'Multi-Platform', desc: 'Deploy on web, WhatsApp, Slack, Telegram & more.', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
      { title: 'Knowledge Base', desc: 'Trained on your docs, FAQs, and product info.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5' },
      { title: 'Lead Capture', desc: 'Qualify leads and collect info automatically.', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { title: 'Handoff', desc: 'Seamless escalation to human agents when needed.', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
      { title: 'Analytics', desc: 'Conversation analytics and sentiment tracking.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6' },
    ],
    tools: ['OpenAI', 'Dialogflow', 'Rasa', 'LangChain', 'Node.js', 'Python', 'Twilio', 'WebSocket'],
    addons: [{ name: 'Additional platform', price: 200 }, { name: 'Voice capabilities', price: 350 }, { name: 'Multilingual support', price: 300 }],
    testimonials: [
      { name: 'Anna Roberts', role: 'Marketing Dir, ShopEase', text: 'Our chatbot handles 500+ conversations daily and increased our conversion rate by 18%.', rating: 5 },
      { name: 'Tom Bradley', role: 'Founder, HealthHub', text: 'The appointment booking bot freed up our entire front desk team. Patients love it.', rating: 5 },
    ],
    cases: [
      { title: 'E-commerce Support Bot', desc: 'AI chatbot for product inquiries and order tracking.', result: '70% query resolution' },
      { title: 'Healthcare Booking Bot', desc: 'Appointment scheduling across 12 clinics.', result: '45% more bookings' },
      { title: 'Real Estate Lead Bot', desc: 'Property inquiry and lead qualification chatbot.', result: '200+ leads/month' },
    ],
    faqs: [
      { q: 'What platforms can the chatbot run on?', a: 'Web widget, WhatsApp, Telegram, Slack, Facebook Messenger, and custom apps.' },
      { q: 'Can the chatbot handle multiple languages?', a: 'Yes, with the multilingual add-on supporting 50+ languages.' },
      { q: 'How do you train the chatbot?', a: 'Using your existing FAQs, documents, and product data. I also set up continuous learning from conversations.' },
      { q: 'What if the bot can\'t answer a question?', a: 'It seamlessly escalates to a human agent with full conversation context.' },
      { q: 'Can I customize the chatbot\'s personality?', a: 'Absolutely — tone, language style, and personality are fully customizable.' },
    ],
  },
  'whatsapp-automation': {
    title: 'WhatsApp Automation', tagline: 'Automated messaging solutions', desc: 'Leverage WhatsApp Business API to automate customer communications, run marketing campaigns, provide instant support, and drive engagement at scale.', price: 399, color: 'from-green-500 to-emerald-500',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    features: [
      { title: 'Bulk Campaigns', desc: 'Send personalized messages at scale.', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8' },
      { title: 'Auto-Replies', desc: 'Instant responses to common queries.', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
      { title: 'CRM Integration', desc: 'Sync contacts and conversations with your CRM.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857' },
      { title: 'Template Messages', desc: 'Pre-approved templates for quick deployment.', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5' },
      { title: 'Delivery Analytics', desc: 'Track delivery, read, and response rates.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6' },
      { title: 'Drip Sequences', desc: 'Automated follow-up message sequences.', icon: 'M19 14l-7 7m0 0l-7-7m7 7V3' },
    ],
    tools: ['WhatsApp API', 'Twilio', 'Node.js', 'Python', 'HubSpot', 'Zapier', 'Make', 'n8n'],
    addons: [{ name: 'CRM integration', price: 200 }, { name: 'Chatbot add-on', price: 300 }, { name: 'Multi-number setup', price: 150 }],
    testimonials: [
      { name: 'Priya Sharma', role: 'Marketing Head, FashionBay', text: 'Our WhatsApp campaigns now reach 50K customers with 85% open rates. Incredible ROI.', rating: 5 },
      { name: 'Carlos Martinez', role: 'Owner, LocalEats', text: 'Automated order confirmations and delivery updates saved us hours every day.', rating: 5 },
    ],
    cases: [
      { title: 'Fashion Brand Campaigns', desc: 'Automated promotional campaigns for a D2C brand.', result: '85% open rate' },
      { title: 'Restaurant Orders', desc: 'WhatsApp ordering and delivery tracking system.', result: '30% more orders' },
      { title: 'Customer Onboarding', desc: 'Automated onboarding sequence for a fintech app.', result: '2x activation rate' },
    ],
    faqs: [
      { q: 'Do I need a WhatsApp Business account?', a: 'Yes, I\'ll help you set up and verify your WhatsApp Business API account.' },
      { q: 'Is there a message limit?', a: 'WhatsApp has tier-based messaging limits. I help you scale gradually to unlimited messaging.' },
      { q: 'Can I segment my audience?', a: 'Yes, with custom tags, labels, and dynamic segmentation based on user behavior.' },
      { q: 'Is it compliant with WhatsApp policies?', a: 'Absolutely. All automations follow WhatsApp Business policy guidelines.' },
      { q: 'Can users opt out?', a: 'Yes, built-in opt-out handling ensures compliance and good user experience.' },
    ],
  },
  'web-automation': {
    title: 'Web Automation', tagline: 'Streamline your workflows', desc: 'Eliminate repetitive manual tasks with intelligent web automation — from data scraping and form filling to workflow orchestration and scheduled processes.', price: 599, color: 'from-cyan-500 to-blue-500',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    features: [
      { title: 'Web Scraping', desc: 'Extract data from any website at scale.', icon: 'M4 7v10c0 2.21 1.79 3 4 3h8c2.21 0 4-.79 4-3V7c0-2.21-1.79-3-4-3H8C5.79 4 4 4.79 4 7z' },
      { title: 'Form Automation', desc: 'Automate form filling and submissions.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      { title: 'Workflow Orchestration', desc: 'Chain multiple automations together.', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9' },
      { title: 'Scheduled Tasks', desc: 'Run automations on custom schedules.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { title: 'Error Handling', desc: 'Robust retry logic and error notifications.', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
      { title: 'Data Export', desc: 'Export scraped data in any format you need.', icon: 'M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
    ],
    tools: ['Selenium', 'Puppeteer', 'Playwright', 'Python', 'Node.js', 'n8n', 'Make', 'Zapier'],
    addons: [{ name: 'Anti-detection setup', price: 200 }, { name: 'Proxy rotation', price: 150 }, { name: 'Daily monitoring', price: 100 }],
    testimonials: [
      { name: 'Kevin Smith', role: 'Data Lead, PriceTrack', text: 'We scrape 100K product prices daily with zero issues. Alex built a bulletproof system.', rating: 5 },
      { name: 'Rachel Kim', role: 'HR Manager, TalentFlow', text: 'Automated our entire candidate sourcing process. Saved 30 hours per week.', rating: 5 },
    ],
    cases: [
      { title: 'Price Monitoring', desc: 'Real-time price tracking across 50+ competitor sites.', result: '100K daily scrapes' },
      { title: 'Lead Generation', desc: 'Automated B2B lead extraction and enrichment.', result: '5K leads/month' },
      { title: 'Report Automation', desc: 'Automated government filing and compliance reports.', result: '95% time saved' },
    ],
    faqs: [
      { q: 'Is web scraping legal?', a: 'Web scraping of publicly available data is generally legal. I ensure compliance with robots.txt and ToS.' },
      { q: 'How do you handle CAPTCHAs?', a: 'I implement multiple strategies including CAPTCHA solving services and browser fingerprint management.' },
      { q: 'Can you scrape JavaScript-heavy sites?', a: 'Yes, using headless browsers (Puppeteer/Playwright) that fully render JavaScript content.' },
      { q: 'How often can automations run?', a: 'From once daily to every minute — fully configurable based on your needs.' },
      { q: 'What data formats do you export to?', a: 'CSV, JSON, Excel, database, API — whatever your downstream systems need.' },
    ],
  },
  'custom-software': {
    title: 'Custom Software', tagline: 'Tailored software solutions', desc: 'End-to-end custom software development — from web applications and APIs to internal tools and full SaaS products. Built with modern tech stacks for scale, performance, and maintainability.', price: 2999, color: 'from-indigo-500 to-violet-500',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    features: [
      { title: 'Full-Stack Dev', desc: 'Frontend + backend + database — the complete package.', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
      { title: 'API Development', desc: 'RESTful and GraphQL APIs with documentation.', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { title: 'SaaS Products', desc: 'Multi-tenant SaaS with auth, billing, and more.', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
      { title: 'Internal Tools', desc: 'Custom admin panels and internal dashboards.', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0' },
      { title: 'Database Design', desc: 'Optimized schemas for performance and scale.', icon: 'M4 7v10c0 2.21 1.79 3 4 3h8c2.21 0 4-.79 4-3V7c0-2.21-1.79-3-4-3H8C5.79 4 4 4.79 4 7z' },
      { title: 'Testing & CI/CD', desc: 'Automated testing and deployment pipelines.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
    tools: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS'],
    addons: [{ name: 'Authentication system', price: 500 }, { name: 'Payment integration', price: 400 }, { name: 'DevOps & CI/CD setup', price: 600 }],
    testimonials: [
      { name: 'Daniel Wright', role: 'Founder, TaskFlow', text: 'Alex built our entire SaaS platform from scratch. It\'s fast, beautiful, and scales perfectly.', rating: 5 },
      { name: 'Sophie Lee', role: 'CTO, MedConnect', text: 'The custom internal tools Alex built replaced 4 separate spreadsheets and saved us $50K/year.', rating: 5 },
    ],
    cases: [
      { title: 'Project Management SaaS', desc: 'Full-featured PM tool with real-time collaboration.', result: '2K+ active users' },
      { title: 'Healthcare Portal', desc: 'Patient portal with booking, records, and telemedicine.', result: 'HIPAA compliant' },
      { title: 'E-commerce Platform', desc: 'Custom e-commerce with inventory and analytics.', result: '$1M+ GMV' },
    ],
    faqs: [
      { q: 'What tech stack do you use?', a: 'Primarily React/Next.js + Node.js + PostgreSQL. I choose the best tools for each project.' },
      { q: 'Do you provide source code?', a: 'Yes, you own 100% of the source code and IP upon project completion.' },
      { q: 'How long does a custom build take?', a: 'Simple apps: 4-6 weeks. Complex platforms: 3-6 months. We\'ll define scope together.' },
      { q: 'Do you offer maintenance?', a: 'Yes, monthly maintenance packages for bug fixes, updates, and feature additions.' },
      { q: 'Can you work with our existing codebase?', a: 'Absolutely. I can extend, refactor, or rebuild parts of your existing system.' },
    ],
  },
};

const processSteps = [
  { step: '01', title: 'Discover', desc: 'Deep dive into your requirements, goals, and constraints. We map out the problem space together.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { step: '02', title: 'Design', desc: 'Architecture, wireframes, and technical specifications. You approve the blueprint before we build.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { step: '03', title: 'Develop', desc: 'Agile development with weekly demos. You see progress and provide feedback throughout.', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
  { step: '04', title: 'Deploy', desc: 'Launch, monitoring, and handoff. You get documentation, training, and ongoing support.', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
];

/* ─── FAQ Accordion ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left cursor-pointer group"
      >
        <span className="font-medium text-foreground group-hover:text-primary transition-colors pr-4">{q}</span>
        <svg className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-4' : 'max-h-0'}`}>
        <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─── Stars ─── */
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? 'text-warning' : 'text-muted'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
    </div>
  );
}

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [dynamicService, setDynamicService] = useState<typeof allServices[string] | null>(null);

  // Resolve the params promise and load localStorage
  useEffect(() => {
    params.then(p => {
      setResolvedParams(p);
      try {
        const storedAll = localStorage.getItem('platform_all_services');
        if (storedAll) {
          const parsedAll = JSON.parse(storedAll);
          if (parsedAll[p.slug]) {
            const baseDefaults = allServices[p.slug];
            const storedItem = parsedAll[p.slug];
            setDynamicService({
              ...baseDefaults,
              ...storedItem,
              features: storedItem.features || baseDefaults.features,
              tools: storedItem.tools || baseDefaults.tools,
              faqs: storedItem.faqs || baseDefaults.faqs,
              addons: storedItem.addons || baseDefaults.addons,
              testimonials: storedItem.testimonials || baseDefaults.testimonials,
              cases: storedItem.cases || baseDefaults.cases,
            });
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
      setDynamicService(allServices[p.slug] || null);
    });
  }, [params]);

  if (!resolvedParams || !dynamicService) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin-slow w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  const service = dynamicService;
  if (!service) return notFound();

  const basePrice = service.price;
  const totalAddon = Object.entries(addons).reduce((sum, [key, checked]) => {
    if (!checked) return sum;
    const a = service.addons.find((ad) => ad.name === key);
    return sum + (a?.price ?? 0);
  }, 0);
  const total = basePrice + totalAddon;

  return (
    <main className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <Container className="relative z-10">
          <ScrollReveal>
            <Link href="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Services
            </Link>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0`}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={service.icon} /></svg>
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-2">{service.title}</h1>
                <p className="text-muted-foreground text-lg">{service.tagline}</p>
              </div>
              <Badge variant="success" className="md:ml-auto text-base px-5 py-2">Starting at ${service.price.toLocaleString()}</Badge>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed mt-6 max-w-3xl">{service.desc}</p>
          </ScrollReveal>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <Container>
          <ScrollReveal><h2 className="text-2xl font-bold mb-8 gradient-text">What&apos;s Included</h2></ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <GlassCard className="h-full">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Tools & Technologies */}
      <section className="py-16 bg-card/30">
        <Container>
          <ScrollReveal><h2 className="text-2xl font-bold mb-8 gradient-text">Tools & Technologies</h2></ScrollReveal>
          <ScrollReveal>
            <div className="flex flex-wrap gap-3">
              {service.tools.map((t) => (
                <Badge key={t} variant="outline" className="text-sm px-4 py-2 hover:border-primary hover:text-primary transition-colors cursor-default">{t}</Badge>
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Process */}
      <section className="py-16">
        <Container>
          <ScrollReveal><h2 className="text-2xl font-bold mb-8 gradient-text">How It Works</h2></ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((s, i) => (
              <ScrollReveal key={s.step} delay={i * 120}>
                <GlassCard className="text-center h-full">
                  <div className="text-3xl font-bold gradient-text mb-3">{s.step}</div>
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                  </div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Case Studies */}
      <section className="py-16 bg-card/30">
        <Container>
          <ScrollReveal><h2 className="text-2xl font-bold mb-8 gradient-text">Related Case Studies</h2></ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {service.cases.map((c, i) => (
              <ScrollReveal key={c.title} delay={i * 100}>
                <GlassCard className="h-full">
                  <h3 className="font-semibold mb-2">{c.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{c.desc}</p>
                  <Badge variant="success">{c.result}</Badge>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing Calculator */}
      <section className="py-16">
        <Container>
          <ScrollReveal>
            <GlassCard className="max-w-2xl mx-auto" padding="p-8">
              <h2 className="text-2xl font-bold mb-6 gradient-text">Pricing Calculator</h2>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                <span className="text-muted-foreground">Base Price</span>
                <span className="text-xl font-bold">${basePrice.toLocaleString()}</span>
              </div>
              <div className="space-y-3 mb-6">
                {service.addons.map((a) => (
                  <label key={a.name} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!addons[a.name]}
                        onChange={(e) => setAddons((prev) => ({ ...prev, [a.name]: e.target.checked }))}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-[#3B82F6]"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">{a.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">+${a.price}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="font-semibold text-lg">Estimated Total</span>
                <span className="text-2xl font-bold gradient-text">${total.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">* Final price may vary based on project scope and requirements.</p>
            </GlassCard>
          </ScrollReveal>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-card/30">
        <Container>
          <ScrollReveal><h2 className="text-2xl font-bold mb-8 gradient-text">What Clients Say</h2></ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            {service.testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 100}>
                <GlassCard className="h-full">
                  <Stars count={t.rating} />
                  <p className="text-muted-foreground mt-4 mb-4 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <Container>
          <ScrollReveal>
            <GlassCard className="max-w-3xl mx-auto" padding="p-8">
              <h2 className="text-2xl font-bold mb-6 gradient-text">Frequently Asked Questions</h2>
              {service.faqs.map((f) => (
                <FAQItem key={f.q} q={f.q} a={f.a} />
              ))}
            </GlassCard>
          </ScrollReveal>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <ScrollReveal>
            <GlassCard className="text-center max-w-3xl mx-auto" padding="p-10 sm:p-14">
              <h2 className="text-3xl font-bold mb-4 gradient-text">Ready to Get Started?</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Let&apos;s discuss your project and find the perfect solution for your needs.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact"><Button variant="primary" size="lg">Get Started</Button></Link>
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" icon={
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  }>Contact on WhatsApp</Button>
                </a>
              </div>
            </GlassCard>
          </ScrollReveal>
        </Container>
      </section>
    </main>
  );
}
