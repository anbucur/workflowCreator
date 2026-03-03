import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { ExportFormat } from '../types';

export async function generatePng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });
}

export async function generateSvg(node: HTMLElement): Promise<string> {
  return toSvg(node, {
    backgroundColor: '#ffffff',
    cacheBust: true,
  });
}

export async function generatePdf(node: HTMLElement): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  const width = node.offsetWidth;
  const height = node.offsetHeight;
  const pxToMm = 0.264583;

  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [width * pxToMm, height * pxToMm],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, width * pxToMm, height * pxToMm);
  pdf.save('infographic.pdf');
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function exportInfographic(
  node: HTMLElement,
  format: ExportFormat
): Promise<void> {
  node.classList.add('exporting');
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    switch (format) {
      case 'png': {
        const dataUrl = await generatePng(node);
        downloadDataUrl(dataUrl, 'infographic.png');
        break;
      }
      case 'svg': {
        const dataUrl = await generateSvg(node);
        downloadDataUrl(dataUrl, 'infographic.svg');
        break;
      }
      case 'pdf': {
        await generatePdf(node);
        break;
      }
    }
  } finally {
    node.classList.remove('exporting');
  }
}
