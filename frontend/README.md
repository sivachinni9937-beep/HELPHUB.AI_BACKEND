# HelpHub AI — Frontend Web Application

> **"Report a problem. Find a solution. Build a better community."**

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Frontend%20Live-black?logo=vercel)](https://vercel.com/sivachinni9937-beep/helphub-ai-frontend/J3ybnr9AgmbqxVZ9yaLQpfeHPQML)
[![Live Backend](https://img.shields.io/badge/Render-Backend%20Live-brightgreen?logo=render)](https://helphub-ai-backend-1.onrender.com)
[![API Docs](https://img.shields.io/badge/Swagger-API%20Docs-blue?logo=swagger)](https://helphub-ai-backend-1.onrender.com/docs)

### 🌐 Live Production Deployments
- **Live Frontend App**: [https://helphub-ai-frontend.vercel.app](https://helphub-ai-frontend.vercel.app)
- **Vercel Deployment**: [https://vercel.com/sivachinni9937-beep/helphub-ai-frontend/J3ybnr9AgmbqxVZ9yaLQpfeHPQML](https://vercel.com/sivachinni9937-beep/helphub-ai-frontend/J3ybnr9AgmbqxVZ9yaLQpfeHPQML)
- **Production Backend API**: [https://helphub-ai-backend-1.onrender.com](https://helphub-ai-backend-1.onrender.com)
- **API Health Telemetry**: [https://helphub-ai-backend-1.onrender.com/api/health](https://helphub-ai-backend-1.onrender.com/api/health)

---

## Key Features

- **Multilingual Support**: Real-time interface toggling between **English**, **हिन्दी (Hindi)**, and **ଓଡ଼ିଆ (Odia)**.
- **Interactive Map**: OpenStreetMap & Leaflet geospatial report feed with pin clustering and coordinate filtering.
- **Role-Aware Dashboards**: Tailored views and capabilities for **Guests**, **Citizens**, **Volunteers**, **NGO Organizers**, **Moderators**, and **Administrators**.
- **AI Gemma 4 Integration**: Civic assistant modal for drafting polite complaint letters and auto-structuring community reports.
- **Fast & Accessible UI**: Built with React 18, Vite, Tailwind CSS, and Lucide icons.

---

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite 5
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Maps**: Leaflet & React-Leaflet
- **Testing**: Vitest & React Testing Library
- **Authentication & Backend Client**: Supabase JS Client & Axios/Fetch

---

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

Set your configuration:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
VITE_API_BASE_URL=https://helphub-ai-backend-1.onrender.com
VITE_DEMO_MODE=false
```

### 3. Run Development Server

```bash
npm run dev
```

App will run at `http://localhost:5173`.

### 4. Build for Production

```bash
npm run build
```

Assets will be output to `dist/`.

### 5. Run Tests

```bash
npm run test
```

---

## License

This project is licensed under the MIT License.

