/**
 * Hackathon Ingestion Engine (Foundation)
 * --------------------------------------
 * This script is responsible for:
 * - Fetching hackathons from sources
 * - Normalizing data
 * - Writing to data/hackathons.json
 * - Ensuring 24-hour freshness guarantee
 *
 * NOTE:
 * - Today: source fetchers are placeholders
 * - Tomorrow: real Unstop / Devfolio scrapers plug in here
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/hackathons.json");

// ----------------------------------
// Utility: Load existing data
// ----------------------------------
function loadExistingHackathons() {
  if (!fs.existsSync(DATA_PATH)) return [];
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

// ----------------------------------
// Utility: Save data
// ----------------------------------
function saveHackathons(hackathons) {
  fs.writeFileSync(
    DATA_PATH,
    JSON.stringify(hackathons, null, 2),
    "utf-8"
  );
}

// ----------------------------------
// Core rule: uniqueness by source + id
// ----------------------------------
function isDuplicate(existing, incoming) {
  return existing.some(
    h => h.source === incoming.source && h.id === incoming.id
  );
}

// ----------------------------------
// SOURCE FETCHERS (PLUG-IN ARCHITECTURE)
// ----------------------------------

async function fetchFromUnstop() {
  // Placeholder (real scraper later)
  return [];
}

async function fetchFromDevfolio() {
  // Placeholder (real scraper later)
  return [];
}

async function fetchFromHackerEarth() {
  // Placeholder (real scraper later)
  return [];
}

// ----------------------------------
// Main Ingestion Pipeline
// ----------------------------------
async function ingest() {
  console.log("🚀 Starting hackathon ingestion...");

  const existingHackathons = loadExistingHackathons();
  let allHackathons = [...existingHackathons];

  const sources = [
    fetchFromUnstop,
    fetchFromDevfolio,
    fetchFromHackerEarth
  ];

  for (const fetchSource of sources) {
    const newHackathons = await fetchSource();

    for (const hackathon of newHackathons) {
      if (!isDuplicate(allHackathons, hackathon)) {
        hackathon.uploaded_at = hackathon.uploaded_at || new Date().toISOString();
        allHackathons.push(hackathon);
      }
    }
  }

  saveHackathons(allHackathons);

  console.log(`✅ Ingestion complete. Total hackathons: ${allHackathons.length}`);
}

// ----------------------------------
// Run
// ----------------------------------
ingest().catch(err => {
  console.error("❌ Ingestion failed:", err);
});
