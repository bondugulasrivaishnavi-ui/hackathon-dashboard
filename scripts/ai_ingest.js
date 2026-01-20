/**
 * AI-assisted ingestion for Layer 2 & Layer 3
 * Uses CommonJS (require) to work in GitHub Actions
 */

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DATA_PATH = path.join(process.cwd(), "data/hackathons.json");

// ----------------------------
// Helper: call OpenAI
// ----------------------------
async function extractHackathonFromText(rawText) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const prompt = `
Extract hackathon details from the text below.
Return ONLY valid JSON in this format:

{
  "name": "",
  "college": "",
  "location": "",
  "start_date": "",
  "end_date": "",
  "mode": "Online | Offline",
  "confidence": "high | medium | low"
}

Text:
${rawText}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer ${OPENAI_API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// ----------------------------
// Database helpers
// ----------------------------
function loadDB() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function saveDB(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// ----------------------------
// Example raw inputs (placeholder)
// Later these come from crawlers / OCR
// ----------------------------
const RAW_INPUTS = [
  {
    source: "CBIT Website",
    source_type: "institutional",
    raw_text: `
CBIT is organizing an Innovation Hackathon 2026
from Feb 12 to Feb 14 at Gandipet campus.
Open for all engineering colleges.
`
  },
  {
    source: "Instagram Poster",
    source_type: "community",
    raw_text: `
🚀 HACKATHON ALERT 🚀
VNR VJIET presents CODEFEST
March 3–4, 2026
Offline event
`
  }
];

// ----------------------------
// Main AI ingestion
// ----------------------------
async function runAIIngestion() {
  console.log("🤖 AI ingestion started");

  const db = loadDB();

  for (const input of RAW_INPUTS) {
    const extracted = await extractHackathonFromText(input.raw_text);

    db.push({
      id: `ai_${Date.now()}`,
      name: extracted.name || "Unnamed Hackathon",
      college: extracted.college || "Open",
      location: extracted.location || "India",
      start_date: extracted.start_date || "",
      end_date: extracted.end_date || "",
      mode: extracted.mode || "Offline",
      source: input.source,
      source_type: input.source_type,
      confidence: extracted.confidence || "low",
      uploaded_at: new Date().toISOString(),
      source_url: ""
    });
  }

  saveDB(db);
  console.log("✅ AI ingestion completed");
}

runAIIngestion().catch(err => {
  console.error("❌ AI ingestion failed:", err.message);
  process.exit(1);
});
