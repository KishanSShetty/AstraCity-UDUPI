# VajraYield - AstraCity Udupi 🌿

An AI-powered **Solid Waste Management (SWM) Digital Twin and Analytics Platform**, specifically tailored for the municipal limits of Udupi City. 

VajraYield integrates high-resolution geospatial data, satellite-derived building footprints, and predictive machine learning to help the Udupi City Municipal Council optimize decentralized waste processing, eliminate landfill reliance, and mitigate methane emissions.

## 🚀 Key Features

- **Geospatial Digital Twin**: Interactive MapLibre-powered digital twin of Udupi. Visualizes all 35 municipal wards, 3,200+ road networks, and 11,400+ building footprints.
- **Waste Density Heatmaps**: Accurately maps granular waste generation (Wet, Dry, Hazardous) down to the individual building/grid level.
- **AI Query Bar**: A globally accessible chatbot context-aware of Udupi's live data. Powered dynamically by the **Groq API (`openai/gpt-oss-120b`)** for lightning-fast inference, with fallback to **Google Gemini (`gemini-flash-latest`)**.
- **Logistics & Infrastructure**: Maps existing and projected Dry Waste Collection Centers (DWCCs), Biomethanation plants, and truck routing hubs (e.g., Manipal, Malpe, Indrali).
- **Citizen Complaint Portal**: Live dashboard for tracking, routing, and resolving civilian waste management grievances.

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **Maps & Geospatial:** MapLibre GL JS, Deck.gl, GeoJSON
- **AI/LLMs:** Groq API, Google Gemini API
- **State Management:** Zustand

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/KishanSShetty/AstraCity-UDUPI.git
cd AstraCity-UDUPI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your AI API keys:
```env
NEXT_PUBLIC_GROQ_API_KEY=gsk_your_groq_api_key
NEXT_PUBLIC_GEMINI_API_KEY=AIza_your_gemini_api_key
```
*(Note: If a Groq API key is present, the application will prioritize it for the AI Query Bar for lower latency.)*

### 4. Run the Development Server
```bash
npm run dev --turbo
```
Open [http://localhost:3000](http://localhost:3000) in your browser to explore the dashboard.

## 🗺️ Data Sources
- **Ward Boundaries & Roads**: Extracted from OpenStreetMap (OSM) specifically clipped to the Udupi District polygon.
- **Building Footprints**: Google Open Buildings and Microsoft Building Footprints.
- **Waste Metrics**: Calibrated based on Udupi's ~140 TPD generation rate.

## 📄 License
This project is proprietary for the AstraCity / VajraYield initiative.
