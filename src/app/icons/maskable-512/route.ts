import { renderBrandIcon } from '@/lib/pwaIcon';

export const dynamic = 'force-static';

export function GET() {
  return renderBrandIcon(512, { maskable: true });
}
