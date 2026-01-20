import fs from "fs";
import path from "path";
import { extractHackathonFromText } from "./ai_agent.js";

const DATA_PATH = path.join(process.cwd(), "data/hackathons.json");

// Example raw inputs (later these come from crawlers / uploads)
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

function loadDB() {
  return fs.existsSync(DATA_PATH)
    ? JSON.parse(fs.readFileSync(DATA_PATH))
    : [];
}

function saveDB(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function runAIIngestion() {
  const db = loadDB();

  for (const input of RAW_INPUTS) {
    const extracted = await extractHackathonFromText(input.raw_text);

    db.push({
      id: `ai_${Date.now()}`,
      name: extracted.name,
      college: extracted.college || "Open",
      location: extracted.location || "India",
      start_date: extracted.start_date,
      end_date: extracted.end_date,
      mode: extracted.mode,
      source: input.source,
      source_type: input.source_type,
      confidence: extracted.confidence,
      uploaded_at: new Date().toISOString(),
      source_url: ""
    });
  }

  saveDB(db);
  console.log("✅ AI ingestion completed");
}

runAIIngestion();
