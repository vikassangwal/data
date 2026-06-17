import { Metadata } from 'next';
import { Database, Plus, Search, HardDrive, Cloud, FileText, Server } from 'lucide-react';
import Link from 'next/link';
import { getDatasets } from '@/app/actions/data-management';
import { getConnections } from '@/app/actions/data-connections';
import DatasetsClientPage from './client';
import IntegrationsClient from './IntegrationsClient';

export const metadata: Metadata = {
  title: 'Dataset Portal | DevFort Analytics',
  description: 'Connect and manage your data sources',
};

export const dynamic = 'force-dynamic';

export default async function DatasetPortalPage() {
  const datasets = await getDatasets();
  const connections = await getConnections();
  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dataset Portal</h1>
            <p className="text-slate-400">Connect to external data sources or upload local datasets securely.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/datasets/upload">
              <button className="bg-slate-800 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
                Upload CSV/Excel
              </button>
            </Link>
            <a href="#integrations">
              <button className="bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2">
                <Plus size={18} /> New Connection
              </button>
            </a>
          </div>
        </div>

        {/* Existing Datasets */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">My Datasets</h2>
          <DatasetsClientPage initialDatasets={datasets} />
        </div>

        {/* Data Integrations Grid */}
        <IntegrationsClient initialConnections={connections} />

      </div>
    </div>
  );
}

