import { Hono } from "hono";

type Bindings = {
  AI: Ai;
  ASSETS: Fetcher;
  WAQI_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

interface AqiResult {
  city: string;
  aqi: number;
  dominentpol: string;
  iaqi: Record<string, { v: number }>;
  time: string;
}

// Fetch current AQI for a city (or "geo:lat;lon") from the WAQI API.
async function fetchAqi(query: string, token: string): Promise<AqiResult> {
  const url = `https://api.waqi.info/feed/${encodeURIComponent(query)}/?token=${token}`;
  const res = await fetch(url);
  const json = (await res.json()) as any;
  if (json.status !== "ok") throw new Error(json.data || "WAQI lookup failed");
  const d = json.data;
  return {
    city: d.city?.name ?? query,
    aqi: d.aqi,
    dominentpol: d.dominentpol ?? "pm25",
    iaqi: d.iaqi ?? {},
    time: d.time?.s ?? new Date().toISOString(),
  };
}

function category(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: "Good", color: "#009966" };
  if (aqi <= 100) return { label: "Moderate", color: "#ffde33" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "#ff9933" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#cc0033" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "#660099" };
  return { label: "Hazardous", color: "#7e0023" };
}

// GET /api/aqi?city=beijing   OR   ?lat=..&lon=..
app.get("/api/aqi", async (c) => {
  const token = c.env.WAQI_TOKEN;
  if (!token) return c.json({ error: "WAQI_TOKEN not configured. Run: wrangler secret put WAQI_TOKEN" }, 500);
  const city = c.req.query("city");
  const lat = c.req.query("lat");
  const lon = c.req.query("lon");
  const query = city ? city : lat && lon ? `geo:${lat};${lon}` : "here";
  try {
    const data = await fetchAqi(query, token);
    return c.json({ ...data, category: category(data.aqi) });
  } catch (e: any) {
    return c.json({ error: e.message ?? "lookup failed" }, 502);
  }
});

// GET /api/advice?city=..  -> AI health recommendation based on current AQI
app.get("/api/advice", async (c) => {
  const token = c.env.WAQI_TOKEN;
  if (!token) return c.json({ error: "WAQI_TOKEN not configured" }, 500);
  const query = c.req.query("city") || "here";
  try {
    const data = await fetchAqi(query, token);
    const cat = category(data.aqi);
    const prompt = `Air quality in ${data.city} is AQI ${data.aqi} (${cat.label}), dominant pollutant ${data.dominentpol}. Give 3 short, practical health recommendations for today. Be concise; one sentence each.`;
    const out = (await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a concise public-health assistant." },
        { role: "user", content: prompt },
      ],
    })) as { response?: string };
    return c.json({ city: data.city, aqi: data.aqi, category: cat, advice: out.response ?? "" });
  } catch (e: any) {
    return c.json({ error: e.message ?? "advice failed" }, 502);
  }
});

// Static dashboard is served by the ASSETS binding for all other routes.
export default app;
