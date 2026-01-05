# Air Quality Dashboard

**Category**: Web Frontend

A modern web dashboard for visualizing real-time air quality data with AI-powered health recommendations.

## Features (Planned)
- Real-time AQI visualization with interactive charts
- Interactive maps showing pollution levels by region
- AI-powered personalized health recommendations using Cloudflare Workers AI
- 24-hour air quality forecasting
- Location-based alerts and notifications
- Historical data trends and analysis

## Tech Stack
- React 18 + Vite
- Tailwind CSS for styling
- Recharts/Chart.js for data visualization
- Leaflet for interactive maps
- Cloudflare Workers AI for predictions
- WAQI API for air quality data

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

```env
VITE_WAQI_API_KEY=your_waqi_token
VITE_CF_ACCOUNT_ID=your_cloudflare_account_id
```

## Project Structure

```
AQD/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   └── utils/          # Utility functions
├── public/             # Static assets
└── package.json
```

## License

MIT
