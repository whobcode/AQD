# Air Quality Dashboard (AQD)

Real-time air-quality (AQI) dashboard with AI-powered health recommendations, running entirely
on Cloudflare Workers (TypeScript + Hono + Workers AI). Static dashboard served from the assets
binding; the Worker proxies the WAQI API and generates health advice with Workers AI.

## Features
- Look up live AQI by city name or your geolocation (WAQI data)
- Color-coded AQI category (Good → Hazardous) and pollutant breakdown chart (Chart.js)
- AI health recommendations for the current conditions (Llama 3.1 on Workers AI)

## Setup
```bash
npm install
cp .dev.vars.example .dev.vars   # add your free WAQI token
npm run dev
```
Get a free WAQI token at https://aqicn.org/data-platform/token/

## Deploy
```bash
wrangler secret put WAQI_TOKEN
npm run deploy
```

## API
- `GET /api/aqi?city=beijing` or `?lat=..&lon=..` → current AQI + pollutants
- `GET /api/advice?city=beijing` → AI health recommendations

## Stack
Cloudflare Workers · Hono · Workers AI · Chart.js · WAQI API
