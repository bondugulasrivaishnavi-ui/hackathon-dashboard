const fs = require("fs");
const fetch = require("node-fetch");

const OUTPUT = "data/hackathons.json";

// fetch multiple pages from Unstop
async function fetchUnstop() {
  const results = [];
  const MAX_PAGES = 6; // covers ~150+ hackathons

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://unstop.com/api/public/opportunity/search?page=${page}&type=hackathons`;

    try {
      const res = await fetch(url);
      const json = await res.json();

      if (!json?.data?.data) break;

      for (const h of json.data.data) {
        results.push({
          name: h.title,
          source: "Unstop",
          source_url: `https://unstop.com/${h.slug}`,
          start_date: h.start_date,
          end_date: h.end_date,
          location: h.location || "",
          college: h.organiser_name || "",
        });
      }

    } catch (e) {
      console.error("Unstop page failed:", page);
    }
  }

  return results;
}

async function main() {
  console.log("Ingestion started…");

  const unstop = await fetchUnstop();

  // deduplicate by name
  const map = {};
  for (const h of unstop) {
    map[h.name] = h;
  }

  const finalData = Object.values(map);

  fs.writeFileSync(OUTPUT, JSON.stringify(finalData, null, 2));
  console.log(`Saved ${finalData.length} hackathons`);
}

main();
