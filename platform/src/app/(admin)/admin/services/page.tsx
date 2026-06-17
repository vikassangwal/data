import { getServices } from '@/app/actions/services';
import ServicesClient from './client';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const { success, data: services, error } = await getServices();

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error loading services</h2>
        <p>{error}</p>
      </div>
    );
  }

  return <ServicesClient initialServices={services || []} />;
}
