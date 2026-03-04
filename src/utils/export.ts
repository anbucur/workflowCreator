import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import type { ExportFormat } from '../types';

const SHARED_OPTIONS = {
  backgroundColor: '#ffffff',
  cacheBust: true,
  // Skip elements that shouldn't appear in exports
  filter: (node: HTMLElement) => {
    if (node.nodeType === Node.TEXT_NODE) return true;
    return !node.classList?.contains('editor-only');
  },
};

/** Reliably download any Blob as a named file via an object URL */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Cleanup after the browser has had time to start the download
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

/** Convert a base64 data URL to a Blob without using fetch() */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function exportInfographic(
  node: HTMLElement,
  format: ExportFormat
): Promise<void> {
  // Add class so CSS can hide editor-only elements
  node.classList.add('exporting');

  // Two rAF passes ensure the DOM has settled before capturing
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

  try {
    switch (format) {
      // ── PNG ──────────────────────────────────────────────────────────────
      case 'png': {
        const dataUrl = await toPng(node, { ...SHARED_OPTIONS, pixelRatio: 2 });
        downloadBlob(dataUrlToBlob(dataUrl), 'infographic.png');
        break;
      }

      // ── SVG ──────────────────────────────────────────────────────────────
      case 'svg': {
        const dataUrl = await toSvg(node, SHARED_OPTIONS);
        // html-to-image encodes SVG as URL-encoded text after the comma
        const raw = dataUrl.split(',').slice(1).join(',');
        const svgText = decodeURIComponent(raw);
        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        downloadBlob(blob, 'infographic.svg');
        break;
      }

      // ── PDF ──────────────────────────────────────────────────────────────
      case 'pdf': {
        // Capture at 2× resolution for sharp PDF output
        const dataUrl = await toPng(node, { ...SHARED_OPTIONS, pixelRatio: 2 });

        // Node's layout dimensions (CSS pixels)
        const cssW = node.offsetWidth;
        const cssH = node.offsetHeight;

        // 1 CSS pixel = 0.2646 mm  (assuming 96 dpi screen)
        const PX_TO_MM = 25.4 / 96;
        const pageW = cssW * PX_TO_MM;
        const pageH = cssH * PX_TO_MM;

        const pdf = new jsPDF({
          orientation: cssW > cssH ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pageW, pageH],
          compress: true,
        });

        // Image is 2× the CSS size in physical pixels, but we place it in mm units
        pdf.addImage(dataUrl, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
        pdf.save('infographic.pdf');
        break;
      }
    }
  } finally {
    node.classList.remove('exporting');
  }
}

// Keep individual generators exported for potential reuse
export async function generatePng(node: HTMLElement): Promise<string> {
  return toPng(node, { ...SHARED_OPTIONS, pixelRatio: 2 });
}

export async function generateSvg(node: HTMLElement): Promise<string> {
  return toSvg(node, SHARED_OPTIONS);
}
