import SiteHeader from '@/components/site/SiteHeader.jsx';
import SiteFooter from '@/components/site/SiteFooter.jsx';

export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg0 text-ink">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
