# 07 — Technology & API Sources

> Software frameworks, APIs, mapping libraries, and technology platforms used in the AstraCity routing system implementation.

---

## Mapping & Visualization

| # | Source | Type | URL | What was used |
|---|--------|------|-----|---------------|
| 1 | **MapLibre GL JS v5.20.2** | Mapping Library | https://maplibre.org/ | Core map rendering engine for Smart Map and Vehicle Simulation pages. Features: vector tiles, heatmap layers, circle markers, line layers, fill polygons, popups, navigation controls |
| 2 | **Recharts 3.8** | Charting Library | https://recharts.org/ | BarChart (road type breakdown, before/after comparisons), LineChart (ROI timeline), responsive containers for data visualization |

## Routing & Navigation

| # | Source | Type | URL | What was used |
|---|--------|------|-----|---------------|
| 3 | **OSRM (Open Source Routing Machine)** | Routing API | https://router.project-osrm.org/ | Real-time road-snapped route calculation for 7 vehicles. API call: `/route/v1/driving/{coordinates}?overview=full&geometries=geojson`. Returns: route geometry (GeoJSON LineString), distance (meters), duration (seconds) |
| 4 | **Google OR-Tools** | Optimization Library | https://developers.google.com/optimization | Referenced as the selected VRP optimization algorithm in the Live AI Engine tab. Capacitated VRP solver for multi-vehicle route assignment |

## AI & Intelligence

| # | Source | Type | URL | What was used |
|---|--------|------|-----|---------------|
| 5 | **Google Gemini 1.5 Flash** | AI API | https://generativelanguage.googleapis.com/v1beta/ | AI Query Bar across all pages. System prompt: "Udupi waste intelligence assistant" for natural language queries about ward data, risk scores, cost savings |

## Application Framework

| # | Source | Type | URL | What was used |
|---|--------|------|-----|---------------|
| 6 | **Next.js 14 (App Router)** | Web Framework | https://nextjs.org/ | Application framework with TypeScript, App Router, server-side rendering, API routes |
| 7 | **Zustand 5.0** | State Management | https://zustand-demo.pmnd.rs/ | Global state for map layers (6 toggles), selected ward ID, cross-component state sharing |
| 8 | **Framer Motion 12.36** | Animation Library | https://www.framer.com/motion/ | Page transitions, stat counter animations (spring physics), staggered entrance animations, AnimatePresence for conditional renders |
| 9 | **Tailwind CSS 3.4** | CSS Framework | https://tailwindcss.com/ | Utility-first styling: glassmorphism panels, gradient backgrounds, responsive grid layouts, dark theme components |
