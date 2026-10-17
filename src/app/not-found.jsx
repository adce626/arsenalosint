import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg0 px-6 text-center text-ink">
      <div className="font-mono text-[12px] tracking-eyebrow text-accent">
        404
      </div>
      <h1 className="mt-4 font-serif text-4xl font-black">
        This page isn&rsquo;t in the archive
      </h1>
      <p className="mt-4 max-w-md text-sm leading-[1.9] text-ink-1">
        The page you were looking for doesn&rsquo;t exist or has moved. Try the
        tool catalog or head back home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({}))}>
          Back home
        </Link>
        <Link
          href="/tools"
          className={cn(buttonVariants({ variant: 'secondary' }))}
        >
          Browse tools
        </Link>
      </div>
    </div>
  );
}
