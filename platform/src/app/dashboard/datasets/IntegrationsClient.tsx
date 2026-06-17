'use client';

import { useState } from 'react';
import { Database, Search, Cloud, Server, Loader2, Link as LinkIcon, Lock } from 'lucide-react';
import { connectDataSource } from '@/app/actions/data-connections';

const ALL_INTEGRATIONS = [
  { id: 's3', name: 'Amazon S3', type: 'Cloud Storage', icon: Cloud, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'gdrive', name: 'Google Drive', type: 'Cloud Storage', icon: Cloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'dropbox', name: 'Dropbox', type: 'Cloud Storage', icon: Cloud, color: 'text-blue-600', bg: 'bg-blue-600/10' },
  { id: 'postgres', name: 'PostgreSQL', type: 'Database', icon: Database, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { id: 'mysql', name: 'MySQL', type: 'Database', icon: Database, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { id: 'mongodb', name: 'MongoDB', type: 'Database', icon: Database, color: 'text-green-500', bg: 'bg-green-500/10' },
  { id: 'ftp', name: 'FTP / SFTP', type: 'Server', icon: Server, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'api', name: 'REST APIs', type: 'API', icon: LinkIcon, color: 'text-primary', bg: 'bg-primary/10' },
];

export default function IntegrationsClient({ initialConnections }: { initialConnections: any[] }) {
  const [connections, setConnections] = useState(initialConnections);
  const [search, setSearch] = useState('');
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [credentials, setCredentials] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredIntegrations = ALL_INTEGRATIONS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectingTo) return;
    
    setIsLoading(true);
    try {
      const conn = await connectDataSource(connectingTo, credentials);
      setConnections(prev => [conn, ...prev]);
      setConnectingTo(null);
      setCredentials('');
    } catch (error) {
      alert('Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const isConnected = (id: string) => connections.some(c => c.provider === id);

  return (
    <div id="integrations">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Available Integrations</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search integrations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredIntegrations.map((integration) => {
          const connected = isConnected(integration.id);
          return (
            <div key={integration.id} className={`bg-slate-900 border ${connected ? 'border-emerald-500/30' : 'border-slate-800'} rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg ${integration.bg} flex items-center justify-center`}>
                  <integration.icon className={integration.color} size={24} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${connected ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-950'}`}>
                  {connected ? 'Connected' : integration.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                {integration.name}
              </h3>
              <button 
                onClick={() => !connected && setConnectingTo(integration.id)}
                disabled={connected}
                className={`mt-4 w-full border font-bold py-2 rounded-lg text-sm transition-colors ${
                  connected 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-primary hover:text-white hover:border-primary'
                }`}
              >
                {connected ? 'Manage Connection' : 'Configure Connection'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Connection Modal */}
      {connectingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-lg">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Connect {ALL_INTEGRATIONS.find(i => i.id === connectingTo)?.name}</h3>
                <p className="text-sm text-slate-400">Enter credentials to authenticate.</p>
              </div>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Connection String / API Key</label>
                <input 
                  type="password" 
                  required
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                  placeholder="Enter your secret or connection URI..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setConnectingTo(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? 'Connecting...' : 'Connect Securely'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
