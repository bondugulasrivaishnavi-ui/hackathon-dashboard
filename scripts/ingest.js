/**
 * Hackathon Ingestion Engine – REAL VERSION (Unstop)
 * -------------------------------------------------
 * This script:
 * - Fetches live hackathons from Unstop (public listing)
 * - Normalizes data
 * - Writes to data/hackathons.json
 * - Prevents duplicates
 *
 * Runs automatically via GitHub Actions every 3 hours
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const DATA_PATH = path.join(__dirname, "../data/hackathons.json");

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function loadExistingHackathons() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function saveHackathons(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function isDuplicate(existing, incoming) {
  return existing.some(
    h => h.source === incoming.source && h.id === incoming.id
  );
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        let data = "";
        res.on("data", chunk => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

// --------------------------------------------------
// REAL SOURCE: UNSTOP (Public API used by frontend)
// --------------------------------------------------
async function fetchFromUnstop() {
  console.log("🔎 Fetching from Unstop...");

  const url =
    "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=1&per_page=20";

  const json = await fetchJSON(url);

  if (!json || !json.data || !json.data.data) return [];

  return json.data.data.map(item => ({
    id: `unstop_${item.id}`,
    name: item.title,
    source: "Unstop",
    source_url: `https://unstop.com/${item.slug}`,
    location: item.region || "India",
    mode: item.mode || "Online",
    uploaded_at: item.created_at,
    start_date: item.start_date,
    end_date: item.end_date
  }));
}

// --------------------------------------------------
// MAIN INGESTION PIPELINE
// --------------------------------------------------
async function ingest() {
  console.log("🚀 Starting hackathon ingestion");

  const existing = loadExistingHackathons();
  let all = [...existing];

  const sources = [fetchFromUnstop];

  for (const source of sources) {
    const incoming = await source();

    for (const hackathon of incoming) {
      if (!isDuplicate(all, hackathon)) {
        all.push(hackathon);
      }
    }
  }

  saveHackathons(all);

  console.log(`✅ Done. Total hackathons stored: ${all.length}`);
}

// --------------------------------------------------
ingest().catch(err => {
  console.error("❌ Ingestion failed:", err);
});
