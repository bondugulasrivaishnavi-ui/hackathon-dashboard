/**
 * AI-assisted ingestion for Layer 2 & Layer 3
 * FINAL FAIL-SAFE VERSION (AI can NEVER break pipeline)
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

async function safeAIExtract(rawText) {
  if (!OPENAI_API_KEY) {
    console.log("⚠️ OPENAI_API_KEY missing — skipping AI");
    return null;
  }

  try {
    const prompt =
      "Extract hackathon details and return ONLY JSON:\n" +
      '{ "name":"", "college":"", "location":"", "start_date":"", "end_date":"", "mode":"Online | Offline", "confidence":"high | medium | low" }\n\n' +
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
    if (!data?.choices?.[0]?.message?.content) return null;

    return JSON.parse(data.choices[0].message.content);
  } catch {
    return null;
  }
}

/* PLACEHOLDER RAW INPUTS */
const RAW_INPUTS = [
  {
    source: "CBIT Website",
    source_type: "institutional",
    raw_text: "CBIT Innovation Hackathon Feb 12 to Feb 14 Gandipet campus."
  },
  {
    source: "Instagram Poster",
    source_type: "community",
    raw_text: "VNR CODEFEST Hackathon March 3 to 4 Offline."
  }
];

async function run() {
  console.log("🤖 AI ingestion started");

  const db = loadDB();

  for (const input of RAW_INPUTS) {
    const extracted = await safeAIExtract(input.raw_text);

    if (!extracted) {
      console.log("⚠️ AI skipped invalid response");
      continue;
    }

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
  console.log("✅ AI ingestion completed safely");
}

run();
