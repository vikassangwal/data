import IntegrationsClient from './IntegrationsClient';

export const metadata = {
  title: 'API Integrations | Admin Dashboard',
};

export default function IntegrationsPage() {
  return (
    <div className="p-8">
      <IntegrationsClient />
    </div>
  );
}
