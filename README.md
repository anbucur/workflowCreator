# Phasecraft

A visual workflow infographic editor for creating professional, export-ready process diagrams. Build multi-phase workflows with 13 step types, customizable themes, role management, and advanced connectors — all from a drag-and-drop canvas.

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-blue?logo=tailwindcss)

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [AI Integration & Secrets Setup](#ai-integration--secrets-setup)
- [Step Types](#step-types)
- [Themes](#themes)
- [Export Formats](#export-formats)
- [Customization](#customization)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Scripts](#scripts)

---

## Features

- **Visual Canvas Editor** — Drag-and-drop phases and steps on an interactive canvas with horizontal or vertical layout
- **13 Step Types** — Standard, Meeting, Decision Gate, Parallel Tracks, Checklist, Handoff, Milestone, Document, Estimation, Collaboration Loop, Timeline, Risk/Warning, and Metrics/KPI
- **Advanced Connectors** — Straight, curved, step, and loop connector types with customizable arrowheads, labels, colors, and manual waypoints
- **Connect Mode** — Click-to-connect steps with 4-handle connection points (top, bottom, left, right)
- **Phase Management** — Unlimited phases with custom titles, subtitles, colors, and drag-and-drop reordering
- **Role System** — Create roles with custom colors and assign them to steps, displayed as colored badges
- **5 Predefined Themes** — Ocean Depth, Sunset Glow, Forest Canopy, Corporate Clean, Monochrome Slate (plus custom freestyle)
- **Export** — PNG (2x resolution), SVG, PDF (auto orientation), and JSON
- **Export Preview** — Interactive preview modal before downloading
- **Project Persistence** — Auto-save to SQLite database with debounced writes and a project explorer for managing multiple workflows
- **JSON Import/Export** — Save and load projects as validated JSON files
- **Undo/Redo** — Full history tracking up to 50 states
- **Deep Customization** — Fonts, colors, shadows, borders, tinting, background patterns, and more
- **141 Icons** — Curated icon library across 12 categories from Lucide

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Installation

```bash
git clone https://github.com/your-username/workflowCreator.git
cd workflowCreator
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The backend API and SQLite database start automatically with the dev server.

### Production Build

```bash
npm run build
npm run preview
```

---

## AI Integration & Secrets Setup

The AI chat panel can call Z.AI, Kimi (Moonshot), and Anthropic Claude models. When running locally the keys are read from a `.env` file. When deployed to **GitHub Pages** there is no backend, so the deploy workflow passes them to Vite as `VITE_*` build-time variables — the app then calls the AI providers directly from the browser.

### Local development

Copy `.env.example` to `.env` and fill in the keys you want to use:

```bash
cp .env.example .env
```

```dotenv
ZAI_API_KEY=your_zai_api_key_here
KIMI_API_KEY=your_kimi_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

The server picks these up automatically on the next `npm run dev`.

### GitHub Pages deployment

The GitHub Actions deploy workflow reads the same keys from **repository secrets** and exposes them to Vite so the static build can reach the AI providers directly.

**How to add a secret:**

1. Open your repository on GitHub.
2. Go to **Settings → Secrets and variables → Actions**.
3. Click **New repository secret**.
4. Add each secret below:

| Secret name | Where to get the key |
| --- | --- |
| `ZAI_API_KEY` | [z.ai](https://z.ai) |
| `KIMI_API_KEY` | [platform.moonshot.cn](https://platform.moonshot.cn) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

> **Note:** You only need to add the secrets for the models you intend to use. Missing keys are simply ignored — the corresponding model will be unavailable in the deployed app.

> **Anthropic browser restriction:** Direct browser requests to the Anthropic API are blocked unless you use an OAuth token (a key beginning with `sk-ant-oat`). Obtain one via the [Anthropic OAuth beta](https://console.anthropic.com) if you want Claude to work on the GitHub Pages deployment.

Once the secrets are saved, push to `main` (or trigger the workflow manually from **Actions → Deploy to GitHub Pages → Run workflow**) to rebuild and redeploy with the keys in place.

---

## Step Types

| Type | Icon | Description |
| ------ | ------ | ------------- |
| **Standard** | `circle-dot` | Basic workflow step with optional custom label |
| **Meeting** | `calendar` | Agenda items, facilitator, duration, decision flag |
| **Decision Gate** | `scale` | Criteria list with outcome status (pending/approved/rejected) |
| **Parallel Tracks** | `columns-2` | Multiple concurrent work streams |
| **Checklist** | `list-checks` | Itemized checklist with completion tracking |
| **Handoff** | `arrow-right-left` | Transfer between teams with artifact list |
| **Milestone** | `flag` | Status tracking, target date, deliverables |
| **Document** | `file-text` | Documents and artifacts produced |
| **Estimation** | `calculator` | T-shirt, story points, or hours estimation |
| **Collaboration Loop** | `refresh-cw` | Iterative collaboration between roles |
| **Timeline** | `gantt-chart` | Gantt-style entries with date ranges and colors |
| **Risk/Warning** | `alert-triangle` | Severity levels with risk descriptions and mitigations |
| **Metrics/KPI** | `bar-chart-3` | Key performance indicators with value, target, and unit |

---

## Themes

Five built-in themes that apply coordinated colors across all phases:

| Theme | Palette |
| ------- | --------- |
| **Ocean Depth** | Cool blues from light sky to deep ocean |
| **Sunset Glow** | Warm yellows through oranges to deep reds |
| **Forest Canopy** | Fresh mint to deep forest greens |
| **Corporate Clean** | Professional multi-color palette |
| **Monochrome Slate** | Neutral grayscale tones |

Select **Custom** to use freestyle per-phase colors with 10 built-in color presets.

---

## Export Formats

| Format | Details |
| -------- | --------- |
| **PNG** | High-resolution raster image (2x pixel ratio) |
| **SVG** | Scalable vector with full preservation |
| **PDF** | Auto landscape/portrait orientation, properly dimensioned |
| **JSON** | Full project data for backup and sharing |

Use the **Export with Preview** option to inspect the output before downloading.

---

## Customization

### Title Bar

- Main title and subtitle text, fonts, and sizes
- Background and text colors
- Alignment (left, center, right)
- Optional logo upload (PNG, JPG, SVG)

### Canvas & Phases

- Canvas background color
- Phase title/subtitle fonts and sizes
- Background patterns (dots, grid, diagonal lines)
- Phase tint opacity, card tint opacity, color blend sharpness

### Cards

- Shadow styles: none, soft, medium, hard, neon
- Border styles: none, solid, dashed, dotted (with adjustable width)
- Title and body fonts and sizes
- Step type label customization (color, font, size, phase-matching)
- Toggle step icons on/off

### Connectors

- Types: straight, curved, step, loop
- Line styles: solid, dashed, dotted
- Arrowheads: none, arrow, diamond, circle, square
- Custom stroke width, color, and labels
- Draggable waypoints for manual routing

### Roles

- Unlimited roles with custom name, badge color, and text color
- Assign multiple roles per step

---

## Project Structure

```text
src/
├── components/
│   ├── canvas/                  # Canvas rendering
│   │   ├── step-content/        # 13 step type renderers
│   │   ├── ConnectorHandle.tsx   # Connection point handles
│   │   ├── ConnectorOverlay.tsx  # SVG connector layer
│   │   ├── InfographicRenderer.tsx
│   │   ├── PhaseColumn.tsx
│   │   ├── StepCard.tsx
│   │   └── TitleBar.tsx
│   ├── layout/                  # App shell, toolbar, sidebar
│   │   ├── AppShell.tsx
│   │   ├── Canvas.tsx
│   │   ├── ProjectExplorerModal.tsx
│   │   ├── Sidebar.tsx
│   │   └── Toolbar.tsx
│   ├── sidebar/                 # Property editors
│   │   ├── step-editors/        # Type-specific data editors
│   │   ├── ConnectorEditor.tsx
│   │   ├── InfographicSettings.tsx
│   │   ├── PhaseEditor.tsx
│   │   ├── RoleManager.tsx
│   │   └── StepEditor.tsx
│   ├── shared/                  # Reusable UI components
│   └── export/                  # Export preview modal
├── store/                       # Zustand state stores
│   ├── useInfographicStore.ts   # Main app state
│   ├── useUiStore.ts            # UI & selection state
│   ├── useHistoryStore.ts       # Undo/redo (Zundo)
│   └── useExportStore.ts        # Export state
├── types/
│   ├── index.ts                 # Core type definitions
│   └── defaults.ts              # Default data generators
├── utils/
│   ├── colors.ts                # Color presets
│   ├── export.ts                # PNG/SVG/PDF export logic
│   ├── icons.ts                 # 141 icons across 12 categories
│   └── themes.ts                # Theme definitions
├── App.tsx                      # Root component with auto-save
├── main.tsx                     # Entry point
└── index.css                    # Global styles
```

---

## Tech Stack

| Category | Technology |
| ---------- | ----------- |
| **Framework** | React 19.2 |
| **Language** | TypeScript 5.9 |
| **Build** | Vite 7.3 |
| **Styling** | Tailwind CSS 4.2 |
| **State** | Zustand 5.0 + Zundo (undo/redo) |
| **Drag & Drop** | @dnd-kit |
| **Database** | better-sqlite3 (via Express 5 API) |
| **Export** | html-to-image + jsPDF |
| **Icons** | Lucide React |
| **Color Picker** | react-colorful |

---

## Scripts

| Command | Description |
| --------- | ------------- |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
