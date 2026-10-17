import { ImageResponse } from 'next/og';

const BG = '#0a0b0e';
const GOLD = '#c9a56b';

/**
 * Shared brand mark renderer for PWA assets. Mirrors the magnifier used by
 * `public/icon.svg` and `SiteHeader`'s <Mark>, but drawn with divs because
 * satori (used by next/og) has limited SVG support.
 *
 * - Standard icons get rounded corners on the dark tile.
 * - `maskable` keeps a full-bleed background and shrinks the mark into the
 *   safe zone so Android can apply its own mask without cropping the logo.
 */
export function renderBrandIcon(
  size: number,
  { maskable = false }: { maskable?: boolean } = {},
): ImageResponse {
  const radius = maskable ? 0 : Math.round(size * 0.186);
  const logo = size * (maskable ? 0.48 : 0.6);
  const ring = Math.round(logo * 0.6);
  const ringBorder = Math.max(2, Math.round(size * 0.045));
  const dot = Math.round(ring * 0.34);
  const handleLength = Math.round(logo * 0.46);
  const handleThickness = Math.max(2, Math.round(size * 0.055));
  const handleOffset = Math.round(ring * 0.72);

  return new ImageResponse(
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BG,
        borderRadius: radius,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: logo,
          height: logo,
          display: 'flex',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: ring,
            height: ring,
            border: `${ringBorder}px solid ${GOLD}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: dot,
              height: dot,
              borderRadius: '50%',
              background: GOLD,
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: handleOffset,
            top: handleOffset,
            width: handleLength,
            height: handleThickness,
            background: GOLD,
            borderRadius: handleThickness / 2,
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    </div>,
    { width: size, height: size },
  );
}
