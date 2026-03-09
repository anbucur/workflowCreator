import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import type { ExportFormat } from '../types';
import type { Phase } from '../types';

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

// ── PowerPoint (PPTX) Export ─────────────────────────────────────────────────

interface PptxExportOptions {
  title: string;
  phases: Phase[];
  companyName?: string;
  logoBase64?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export async function exportToPptx(options: PptxExportOptions): Promise<void> {
  const { title, phases, companyName, logoBase64, primaryColor = '#3b82f6' } = options;
  
  const pptx = new PptxGenJS();
  pptx.author = companyName || 'Phasecraft';
  pptx.title = title;
  pptx.subject = 'Workflow Presentation';
  
  // Define slide layouts
  const pptxPrimary = primaryColor.replace('#', '');
  
  // Slide 1: Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '1e293b' };
  
  if (logoBase64) {
    titleSlide.addImage({
      data: logoBase64,
      x: 4.0,
      y: 1.5,
      w: 2.0,
      h: 1.0,
    });
  }
  
  titleSlide.addText(title, {
    x: 0.5,
    y: 2.5,
    w: 9.0,
    h: 1.5,
    fontSize: 44,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  
  if (companyName) {
    titleSlide.addText(companyName, {
      x: 0.5,
      y: 4.5,
      w: 9.0,
      h: 0.5,
      fontSize: 16,
      fontFace: 'Arial',
      color: '94a3b8',
      align: 'center',
    });
  }
  
  // Slide 2: Agenda (if 3+ phases)
  if (phases.length >= 3) {
    const agendaSlide = pptx.addSlide();
    agendaSlide.background = { color: '1e293b' };
    
    agendaSlide.addText('Agenda', {
      x: 0.5,
      y: 0.5,
      w: 9.0,
      h: 0.75,
      fontSize: 32,
      fontFace: 'Arial',
      bold: true,
      color: 'FFFFFF',
    });
    
    phases.forEach((phase, i) => {
      agendaSlide.addText(`${i + 1}. ${phase.title}`, {
        x: 1.0,
        y: 1.5 + i * 0.6,
        w: 8.0,
        h: 0.5,
        fontSize: 18,
        fontFace: 'Arial',
        color: 'e2e8f0',
      });
    });
  }
  
  // Phase slides
  phases.forEach((phase, phaseIndex) => {
    // Phase overview slide
    const phaseSlide = pptx.addSlide();
    phaseSlide.background = { color: '1e293b' };
    
    // Phase number
    phaseSlide.addText(`Phase ${phaseIndex + 1}`, {
      x: 0.5,
      y: 0.3,
      w: 9.0,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Arial',
      color: '64748b',
      bold: true,
    });
    
    // Phase title
    phaseSlide.addText(phase.title, {
      x: 0.5,
      y: 0.8,
      w: 9.0,
      h: 0.75,
      fontSize: 32,
      fontFace: 'Arial',
      bold: true,
      color: 'FFFFFF',
    });
    
    // Phase subtitle
    if (phase.subtitle) {
      phaseSlide.addText(phase.subtitle, {
        x: 0.5,
        y: 1.5,
        w: 9.0,
        h: 0.4,
        fontSize: 14,
        fontFace: 'Arial',
        color: '94a3b8',
      });
    }
    
    // Steps
    const stepsY = phase.subtitle ? 2.2 : 1.8;
    phase.steps.forEach((step, stepIndex) => {
      const yPos = stepsY + stepIndex * 0.7;
      if (yPos < 4.5) {
        // Step bullet
        phaseSlide.addShape(pptx.ShapeType.ellipse, {
          x: 0.6,
          y: yPos + 0.1,
          w: 0.15,
          h: 0.15,
          fill: { color: pptxPrimary },
        });
        
        // Step title
        phaseSlide.addText(step.title, {
          x: 1.0,
          y: yPos,
          w: 8.0,
          h: 0.35,
          fontSize: 16,
          fontFace: 'Arial',
          bold: true,
          color: 'FFFFFF',
        });
        
        // Step description (truncated)
        if (step.description) {
          phaseSlide.addText(step.description.substring(0, 80) + (step.description.length > 80 ? '...' : ''), {
            x: 1.0,
            y: yPos + 0.35,
            w: 8.0,
            h: 0.3,
            fontSize: 11,
            fontFace: 'Arial',
            color: '94a3b8',
          });
        }
      }
    });
    
    // Individual step slides (max 5 per phase to avoid huge files)
    phase.steps.slice(0, 5).forEach((step) => {
      const stepSlide = pptx.addSlide();
      stepSlide.background = { color: '1e293b' };
      
      // Breadcrumb
      stepSlide.addText(`${phase.title} → ${step.title}`, {
        x: 0.5,
        y: 0.3,
        w: 9.0,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Arial',
        color: '64748b',
      });
      
      // Step title
      stepSlide.addText(step.title, {
        x: 0.5,
        y: 0.8,
        w: 9.0,
        h: 0.75,
        fontSize: 28,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
      });
      
      // Step description
      if (step.description) {
        stepSlide.addText(step.description, {
          x: 0.5,
          y: 1.7,
          w: 9.0,
          h: 1.0,
          fontSize: 14,
          fontFace: 'Arial',
          color: 'cbd5e1',
        });
      }
      
      // Step type badge
      stepSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 3.0,
        w: 1.5,
        h: 0.35,
        fill: { color: pptxPrimary },
      });
      stepSlide.addText(step.type.toUpperCase(), {
        x: 0.5,
        y: 3.0,
        w: 1.5,
        h: 0.35,
        fontSize: 10,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      });
    });
  });
  
  // Thank you slide
  const thankYouSlide = pptx.addSlide();
  thankYouSlide.background = { color: '1e293b' };
  
  thankYouSlide.addText('Thank You', {
    x: 0.5,
    y: 2.0,
    w: 9.0,
    h: 1.0,
    fontSize: 44,
    fontFace: 'Arial',
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  
  if (companyName) {
    thankYouSlide.addText(companyName, {
      x: 0.5,
      y: 3.5,
      w: 9.0,
      h: 0.5,
      fontSize: 14,
      fontFace: 'Arial',
      color: '64748b',
      align: 'center',
    });
  }
  
  // Save the presentation
  await pptx.writeFile({ fileName: `${title.replace(/\s+/g, '-').toLowerCase()}-presentation.pptx` });
}
