import { getProjects } from '@/app/actions/projects';
import ProjectsClient from './client';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const { success, data: projects, error } = await getProjects();

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error loading projects</h2>
        <p>{error}</p>
      </div>
    );
  }

  return <ProjectsClient initialProjects={projects || []} />;
}
