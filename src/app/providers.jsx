'use client';

import { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext.jsx';
import { ProjectProvider } from '@/context/ProjectContext.jsx';
import { NavigationProvider } from '@/context/NavigationContext.jsx';
import { AppConfigProvider } from '@/context/AppConfigContext.jsx';
import { CustomIconsProvider } from '@/context/CustomIconsContext.jsx';
import CommandPalette from '@/components/CommandPalette.jsx';
import ShortcutOverlay from '@/components/ShortcutOverlay.jsx';

/**
 * Client boundary for the whole app. Provider order mirrors the old Vite
 * entry (main.jsx): config → custom icons → theme → navigation → project.
 *
 * Navigation lives here (not inside ProjectView) so the global command
 * palette can focus a project identifier from any route — selecting an
 * identifier first routes to /mapping where InfoTab consumes the focus.
 */
export default function Providers({ children }) {
  // Register the offline shell in production only, and never in environments
  // without service worker support.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <AppConfigProvider>
      <CustomIconsProvider>
        <ThemeProvider>
          <NavigationProvider>
            <ProjectProvider>
              {children}
              <CommandPalette />
              <ShortcutOverlay />
            </ProjectProvider>
          </NavigationProvider>
        </ThemeProvider>
      </CustomIconsProvider>
    </AppConfigProvider>
  );
}
