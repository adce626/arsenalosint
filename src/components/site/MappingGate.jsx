'use client';

import { useRouter } from 'next/navigation';
import { useProject } from '@/context/ProjectContext.jsx';
import { useAppConfig } from '@/context/AppConfigContext.jsx';
import Landing from '@/components/Landing.jsx';
import ProjectView from '@/components/ProjectView.jsx';
import Welcome from '@/components/Welcome.jsx';

/**
 * Client gate for the mapping tool route. Keeps the heavy mapping UI
 * (React Flow / Leaflet / Google Maps) on its own route, out of the marketing
 * pages' bundles, and decides first-run vs. the project manager.
 */
export default function MappingGate() {
  const router = useRouter();
  const { project } = useProject();
  const { loaded, mapProviderSource } = useAppConfig();

  // An open project takes over the whole screen until the user backs out.
  if (project) return <ProjectView />;

  if (!loaded) return null;

  const goHome = () => router.push('/');

  return mapProviderSource === null ? (
    <Welcome onExitToHome={goHome} />
  ) : (
    <Landing onExitToHome={goHome} />
  );
}
