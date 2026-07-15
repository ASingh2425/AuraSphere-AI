# 🏟️ AuraSphere AI - World Cup 2026 3D Smart Stadium Platform

**AuraSphere AI** is a state-of-the-art, GenAI-enabled stadium operations command dashboard and fan experience companion built for the **FIFA World Cup 2026**. 

Leveraging **WebGL (Three.js)** and client-side **Google Gemini 1.5 APIs**, the platform delivers an immersive 3D holographic rendering of a stadium with real-time particle-based crowd simulation, dynamic wayfinding, and a glassmorphic sci-fi HUD command center.

---

## 🌟 Key Features

1. **WebGL 3D Stadium Map (`Stadium3D.jsx`)**:
   - Programmatic construction of a dual-tier stadium bowl (stand boxes, field layouts, glowing gates, structural arches).
   - **Crowd Particle Flows**: Dynamic particle loops flowing from gates to stands along Bezier paths (reverses pathing vectors during evacuations).
   - **Hover Tooltip System**: Floating HTML telemetry displays (occupancy rates, restroom wait times, gate rates) following cursor hovers.
   - **3D Pathfinder**: Traces glowing green accessible routes from parking lots directly to seat rows.

2. **Operations Copilot & Public Warning broadcasts (`OpsCopilot.jsx`)**:
   - Generates step-by-step Chain-of-Thought logs for emergency drills, congestion, and weather alerts.
   - **Robotic Voice Synthesis**: Utilizes browser-native HTML5 `SpeechSynthesis` to audibly speak warning announcements in English, Spanish, or French with robotic Control Room inflections.

3. **Dual-Mode GenAI Core (`aiEngine.js`)**:
   - Toggles dynamically between live Google Gemini API endpoints (fetching structured JSON outputs for map actions) and a local semantic lookup parser, guaranteeing offline stability.

4. **Gamified Carbon Offset Ledger (`SustainabilityTracker.jsx`)**:
   - Encourages public transit use, cup returns, and AI recycling bins, tracking progress bars toward digital FIFA merchant store vouchers.

5. **Hoisted State Persistence**:
   - Uses browser `localStorage` caching to keep carbon scores, logged actions, active incident listings, and Gemini API keys persistent across page refreshes.

---

## 🚀 Live Deployment Guide

AuraSphere AI is designed as a **100% static React Single Page Application (SPA)**. 
- **No backend node servers are required.**
- **No database (MongoDB Atlas) is needed.** 
All state is stored in React memory and persisted in browser `LocalStorage`, and AI interactions connect directly from the user's browser client to Google's endpoints via their own config key. This makes deployment completely free, instant, and highly scalable.

### Option A: Deploying on Vercel (Recommended)
1. Sign up or log into [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select your GitHub repository: `ASingh2425/AuraSphere-AI`.
4. Vercel will automatically detect the Vite template:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Vercel will build and host the app in under 1 minute.
6. Every time you push updates to GitHub, Vercel will rebuild and auto-deploy them.

### Option B: Deploying on Netlify
1. Log into [Netlify](https://netlify.com).
2. Click **Add new site** -> **Import from Git**.
3. Authenticate with GitHub and select `ASingh2425/AuraSphere-AI`.
4. Ensure the build configuration is:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy Site**. Netlify will launch your deployment link immediately.

---

## 💻 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ASingh2425/AuraSphere-AI.git
   cd AuraSphere-AI
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run local dev server**:
   ```bash
   npm run dev
   ```
4. **Compile production build**:
   ```bash
   npm run build
   ```
