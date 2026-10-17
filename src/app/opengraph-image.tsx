import { ImageResponse } from 'next/og';
import { SITE } from '@/site.config.js';

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#0A0B0E';
const GOLD = '#C9A56B';
const TEXT = '#EDE8DF';
const MUTED = '#B9B4AB';
const LINE = '#22252B';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BG,
        padding: '72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 24,
          letterSpacing: 8,
          color: GOLD,
        }}
      >
        <span>RECON</span>
        <span>INTEL</span>
        <span>ARCHIVE</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 92,
            fontWeight: 900,
            color: TEXT,
          }}
        >
          <span>{SITE.brandFirst}</span>
          <span style={{ color: GOLD, marginLeft: 24 }}>
            {SITE.brandAccent}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 34,
            lineHeight: 1.35,
            color: MUTED,
          }}
        >
          The complete field guide to OSINT tooling
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: `1px solid ${LINE}`,
          paddingTop: 32,
          fontSize: 24,
          color: MUTED,
        }}
      >
        <span>Documented tools, guides &amp; a local-first map</span>
        <span style={{ color: GOLD }}>arsenal-osint</span>
      </div>
    </div>,
    size,
  );
}
