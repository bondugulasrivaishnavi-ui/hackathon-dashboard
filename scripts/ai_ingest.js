const fs = require("fs");

const OUTPUT = "data/hackathons.json";

/* ---------------- UNSTOP ---------------- */
async function fetchUnstop() {
  const results = [];
  const MAX_PAGES = 8;

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
      console.error("Unstop failed page:", page);
    }
  }

  return results;
}

/* ---------------- DEVFOLIO ---------------- */
async function fetchDevfolio() {
  const results = [];
  const url = "https://devfolio.co/api/hackathons";

  try {
    const res = await fetch(url);
    const json = await res.json();

    for (const h of json.hackathons || []) {
      results.push({
        name: h.name,
        source: "Devfolio",
        source_url: `https://devfolio.co/hackathons/${h.slug}`,
        start_date: h.starts_at,
        end_date: h.ends_at,
        location: h.location || "",
        college: h.organizer_name || "",
      });
    }
  } catch (e) {
    console.error("Devfolio failed");
  }

  return results;
}

/* ---------------- HACKEREARTH ---------------- */
async function fetchHackerEarth() {
  const results = [];
  const url = "https://www.hackerearth.com/challenges/hackathon/";

  try {
    const res = await fetch(url);
    const html = await res.text();

    const regex = /challenge-card-modern.*?href="(.*?)".*?challenge-name.*?>(.*?)</gs;
    let match;

    while ((match = regex.exec(html)) !== null) {
      results.push({
        name: match[2].trim(),
        source: "HackerEarth",
        source_url: `https://www.hackerearth.com${match[1]}`,
        start_date: "",
        end_date: "",
        location: "",
        college: "",
      });
    }
  } catch (e) {
    console.error("HackerEarth failed");
  }

  return results;
}

/* ---------------- MAIN ---------------- */
async function main() {
  console.log("Starting full ingestion…");

  const unstop = await fetchUnstop();
  const devfolio = await fetchDevfolio();
  const hackerearth = await fetchHackerEarth();

  const combined = [...unstop, ...devfolio, ...hackerearth];

  // Deduplicate
  const map = {};
  for (const h of combined) {
    const key = `${h.name}-${h.source}`;
    map[key] = h;
  }

  const finalData = Object.values(map);

  fs.writeFileSync(OUTPUT, JSON.stringify(finalData, null, 2));
  console.log(`Saved ${finalData.length} hackathons`);
}

main();
