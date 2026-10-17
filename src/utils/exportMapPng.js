import { getPinColor } from '../pinColors.js';

/**
 * Render the current Leaflet viewport to a PNG and trigger a download.
 *
 * Tiles are re-drawn onto a canvas from the already-loaded <img> elements
 * (the OSM tile layer is configured with crossOrigin so the canvas stays
 * untainted), then the pin markers and the optional connection line are
 * painted on top using Leaflet's own projection helper. No external
 * screenshot library is required.
 */
export async function exportMapPng({
  map,
  container,
  pins = [],
  connectionLine = null,
  filename = 'map.png',
}) {
  const size = map.getSize();
  const canvas = document.createElement('canvas');
  canvas.width = size.x;
  canvas.height = size.y;
  const ctx = canvas.getContext('2d');

  const bg =
    getComputedStyle(container).backgroundColor || 'rgb(255, 255, 255)';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size.x, size.y);

  const containerRect = container.getBoundingClientRect();
  const tileImages = Array.from(
    container.querySelectorAll('.leaflet-tile-pane img.leaflet-tile'),
  );

  await Promise.all(
    tileImages.map(
      (img) =>
        new Promise((resolve) => {
          const paint = () => {
            try {
              const rect = img.getBoundingClientRect();
              ctx.drawImage(
                img,
                rect.left - containerRect.left,
                rect.top - containerRect.top,
                rect.width,
                rect.height,
              );
            } catch {
              // Tile failed to draw — leave the background showing.
            }
            resolve();
          };
          if (img.complete && img.naturalWidth > 0) paint();
          else {
            img.addEventListener('load', paint, { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }
        }),
    ),
  );

  // Connection line.
  if (connectionLine && pins.length >= 2) {
    ctx.strokeStyle = connectionLine.color;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    pins.forEach((pin, i) => {
      const pt = map.latLngToContainerPoint([pin.lat, pin.lng]);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Pin markers: colored disc + number, mirroring the on-screen look.
  pins.forEach((pin, i) => {
    const c = getPinColor(pin.color);
    const pt = map.latLngToContainerPoint([pin.lat, pin.lng]);
    const radius = 13;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = c.bg;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = c.border;
    ctx.stroke();

    ctx.fillStyle = c.glyph;
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), pt.x, pt.y + 0.5);
  });

  await new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve();
          return;
        }
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    } catch {
      // Most likely a tainted canvas (tile server refused CORS).
      throw new Error(
        'Map export was blocked by the browser (cross-origin tiles).',
      );
    }
  });
}
