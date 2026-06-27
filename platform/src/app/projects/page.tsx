import { getProjects } from '@/app/actions/projects';
import ProjectsClient from './client';

export const revalidate = 3600;

export default async function ProjectsPage() {
  const { success, data: projects, error } = await getProjects();

  if (!success) {
    return (
      <div className="p-8 text-center text-red-500 pt-32">
        <h2 className="text-xl font-bold mb-2">Error loading projects</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Extract categories dynamically from the actual projects, plus "All"
  const categories = ['All', ...Array.from(new Set(projects?.map((p: any) => p.category) || []))];

  // Map the DB structure to the expected UI structure
  const formattedProjects = projects?.map((p: any) => ({
    ...p,
    tech: p.tags?.filter((t: any) => t.type === 'tech').map((t: any) => t.name) || [],
    tags: p.tags?.filter((t: any) => t.type === 'tag').map((t: any) => t.name) || [],
  })) || [];

  return <ProjectsClient initialProjects={formattedProjects} categories={categories} />;
}
