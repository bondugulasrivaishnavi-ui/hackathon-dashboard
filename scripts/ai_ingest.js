/**
 * AI-assisted ingestion for Layer 2 & Layer 3
 * FINAL HARDENED VERSION (Node 18 + GitHub Actions safe)
 */

const fs = require("fs");
const path = require("path");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DATA_PATH = path.join(process.cwd(), "data/hackathons.json");

function loadDB() {
  if (!fs.existsSync(DATA_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveDB(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function extractHackathonFromText(rawText) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const prompt =
    "Extract hackathon details from text.\n" +
    "Return ONLY JSON in this exact format:\n" +
    "{\n" +
    '  "name": "",\n' +
    '  "college": "",\n' +
    '  "location": "",\n' +
    '  "start_date": "",\n' +
    '  "end_date": "",\n' +
    '  "mode": "Online | Offline",\n' +
    '  "confidence": "high | medium | low"\n' +
    "}\n\nTEXT:\n" +
    rawText;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + OPENAI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    })
  });

  const data = await res.json();

  if (
    !data ||
    !data.choices ||
    !data.choices[0] ||
    !data.choices[0].message
  ) {
    throw new Error("Invalid OpenAI response");
  }

  let parsed;
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  return parsed;
}

/* PLACEHOLDER INPUTS – replace later with crawlers / OCR */
const RAW_INPUTS = [
  {
    source: "CBIT Website",
    source_type: "institutional",
    raw_text:
      "CBIT Innovation Hackathon 2026 from Feb 12 to Feb 14 at Gandipet campus."
  },
  {
    source: "Instagram Poster",
    source_type: "community",
    raw_text:
      "VNR VJIET CODEFEST Hackathon March 3 to March 4 Offline."
  }
];

async function run() {
  console.log("AI ingestion started");

  const db = loadDB();

  for (const input of RAW_INPUTS) {
    const extracted = await extractHackathonFromText(input.raw_text);

    db.push({
      id: "ai_" + Date.now() + "_" + Math.random().toString(36).slice(2),
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
  console.log("AI ingestion completed");
}

run().catch(err => {
  console.error("AI ingestion failed:", err.message);
  process.exit(1);
});
