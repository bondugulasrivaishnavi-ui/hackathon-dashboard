let allHackathons = [];
let showOnlyTS = false;
let dateRange = 60;
let sortDeadline = false;

// Telangana + Major Colleges
const TS_KEYWORDS = [
  "bvr", "bvrit", "gokaraju", "griet", "cbit", "vnr", "kmit",
  "cvr", "snist", "anurag", "vasavi", "ou", "osmania",
  "jntu", "jntuh", "mallareddy", "malla reddy",
  "cmr", "mgit", "vbit", "methodist",
  "hyderabad", "telangana"
];

// ---------- Helpers ----------
function inferCollege(h) {
  const t = (h.name || "").toLowerCase();

  if (t.includes("bvrit")) return "BVRIT Hyderabad";
  if (t.includes("gokaraju") || t.includes("griet")) return "GRIET Hyderabad";
  if (t.includes("cbit")) return "CBIT Hyderabad";
  if (t.includes("vnr")) return "VNR VJIET";
  if (t.includes("kmit")) return "KMIT Hyderabad";
  if (t.includes("cvr")) return "CVR College of Engineering";
  if (t.includes("snist")) return "SNIST Hyderabad";
  if (t.includes("anurag")) return "Anurag University";
  if (t.includes("vasavi")) return "Vasavi College of Engineering";
  if (t.includes("malla")) return "Malla Reddy Group";
  if (t.includes("cmr")) return "CMR Group of Institutions";

  return h.college || "Open / External";
}

function isTelangana(h) {
  const text = (
    inferCollege(h) +
    " " +
    (h.name || "") +
    " " +
    (h.location || "")
  ).toLowerCase();

  return TS_KEYWORDS.some(k => text.includes(k));
}

function withinRange(h) {
  const ref = h.start_date || h.end_date;
  if (!ref) return true;

  const diff =
    (new Date(ref) - new Date()) / (1000 * 60 * 60 * 24);

  return diff >= 0 && diff <= dateRange;
}

function formatDate(d) {
  if (!d) return "TBA";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function safeLink(h) {
  if (!h.source_url) return "#";
  if (h.source && h.source.toLowerCase() === "unstop") {
    return `https://unstop.com/search?query=${encodeURIComponent(h.name)}`;
  }
  return h.source_url;
}

function isFeatured(h) {
  return isTelangana(h) && inferCollege(h) !== "Open / External";
}

// ---------- Load ----------
async function loadHackathons() {
  const res = await fetch("data/hackathons.json");
  allHackathons = await res.json();
  render();
}

// ---------- Render ----------
function render() {
  const container = document.getElementById("hackathonList");
  container.innerHTML = "";

  let list = allHackathons.filter(withinRange);

  if (showOnlyTS) list = list.filter(isTelangana);
  if (sortDeadline) {
    list.sort((a, b) => new Date(a.end_date || 0) - new Date(b.end_date || 0));
  }

  // Featured on top
  list.sort((a, b) => isFeatured(b) - isFeatured(a));

  document.getElementById("count").innerText =
    `Showing ${list.length} hackathons`;

  list.forEach(h => {
    const card = document.createElement("div");
    card.className = "bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition";

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <h3 class="font-semibold text-lg">${h.name}</h3>
        ${isFeatured(h) ? `<span class="text-xs bg-orange-500 text-white px-2 py-1 rounded">FEATURED</span>` : ""}
      </div>

      <p class="text-sm text-gray-600 mt-1">🎓 ${inferCollege(h)}</p>
      <p class="text-sm text-gray-600">⏰ Deadline: ${formatDate(h.end_date)}</p>

      <a href="${safeLink(h)}" target="_blank"
        class="inline-block mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
        Register / View Details →
      </a>
    `;

    container.appendChild(card);
  });
}

// ---------- Controls ----------
function toggleTS() {
  showOnlyTS = !showOnlyTS;
  render();
}

function setRange(days) {
  dateRange = days;
  render();
}

function sortByDeadline() {
  sortDeadline = !sortDeadline;
  render();
}

loadHackathons();
