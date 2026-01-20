let allHackathons = [];

function isWithin24h(date) {
  return (new Date() - new Date(date)) / (1000 * 60 * 60) <= 24;
}

async function loadHackathons() {
  const res = await fetch("data/hackathons.json");
  allHackathons = await res.json();
  populateCollegeFilter();
  applyFilters();
}

function populateCollegeFilter() {
  const select = document.getElementById("collegeFilter");
  const colleges = new Set();

  allHackathons.forEach(h => {
    if (h.college) colleges.add(h.college);
  });

  colleges.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const dateRange = document.getElementById("dateFilter").value;
  const source = document.getElementById("sourceFilter").value;
  const college = document.getElementById("collegeFilter").value;
  const status = document.getElementById("statusFilter").value;

  let list = allHackathons.filter(h => {
    const matchSearch =
      h.name.toLowerCase().includes(search) ||
      (h.college || "").toLowerCase().includes(search);

    if (!matchSearch) return false;

    if (source !== "all" && h.source !== source) return false;
    if (college !== "all" && h.college !== college) return false;
    if (status === "new" && !isWithin24h(h.uploaded_at)) return false;

    if (dateRange !== "all") {
      const end = new Date();
      end.setMonth(end.getMonth() + (dateRange === "1m" ? 1 : 2));
      if (new Date(h.start_date) > end) return false;
    }

    return true;
  });

  render(list);
}

function render(list) {
  const container = document.getElementById("hackathonList");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("countText");

  container.innerHTML = "";
  count.textContent = `Showing ${list.length} hackathons`;

  if (list.length === 0) {
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  list.forEach(h => {
    const card = document.createElement("div");
    card.className = "bg-white border rounded-xl p-4 shadow-sm";

    card.innerHTML = `
      <div class="flex justify-between">
        <h3 class="font-semibold">${h.name}</h3>
        ${
          isWithin24h(h.uploaded_at)
            ? `<span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">NEW</span>`
            : ""
        }
      </div>
      <p class="text-sm text-gray-600 mt-1">
        🎓 ${h.college || "Open / External"}
      </p>
      <p class="text-sm text-gray-600">
        📅 ${h.start_date} → ${h.end_date}
      </p>
      <a href="${h.source_url}" target="_blank"
         class="inline-block mt-3 text-sm text-emerald-600 font-medium">
        View on ${h.source} →
      </a>
    `;

    container.appendChild(card);
  });
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("dateFilter").value = "1m";
  document.getElementById("sourceFilter").value = "all";
  document.getElementById("collegeFilter").value = "all";
  document.getElementById("statusFilter").value = "all";
  applyFilters();
}

loadHackathons();
