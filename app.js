let allHackathons = [];
let showOnlyTS = false;

// ---------- Helpers ----------
function isTelanganaCollege(h) {
  const tsKeywords = [
    "cbit", "vnr", "jntu", "jntuh", "ou", "osmania",
    "bvrit", "kmit", "gnits", "hyd", "hyderabad", "telangana"
  ];

  const text = (
    (h.college || "") +
    " " +
    (h.location || "")
  ).toLowerCase();

  return tsKeywords.some(k => text.includes(k));
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatDateLabel(start, end) {
  const s = formatDate(start);
  const e = formatDate(end);

  if (s && e) return `📅 ${s} → ${e}`;
  if (e) return `⏰ Deadline: ${e}`;
  if (s) return `📅 Starts: ${s}`;
  return "📅 Dates TBA";
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

  let list = allHackathons;

  if (showOnlyTS) {
    list = list.filter(isTelanganaCollege);
  }

  list.forEach(h => {
    const card = document.createElement("div");
    card.className = "bg-white border rounded-xl p-4 shadow-sm";

    const college = h.college ? h.college : "Open / External";
    const dateLabel = formatDateLabel(h.start_date, h.end_date);

    card.innerHTML = `
      <h3 class="font-semibold text-lg">${h.name}</h3>

      <p class="text-sm text-gray-600 mt-1">🎓 ${college}</p>
      <p class="text-sm text-gray-600">${dateLabel}</p>

      <a href="${h.source_url}" target="_blank"
         class="inline-block mt-3 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg">
        Register / View Details →
      </a>
    `;

    container.appendChild(card);
  });
}

// ---------- Toggle Telangana ----------
function toggleTS() {
  showOnlyTS = !showOnlyTS;
  render();
}

// ---------- Init ----------
loadHackathons();
