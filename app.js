// ===============================
// Utility: check if uploaded within last 24 hours
// ===============================
function isWithinLast24Hours(uploadedAt) {
  const now = new Date();
  const uploadedTime = new Date(uploadedAt);
  const diffInHours = (now - uploadedTime) / (1000 * 60 * 60);
  return diffInHours <= 24;
}

// ===============================
// Global storage
// ===============================
let allHackathons = [];
let currentFiltered = [];

// ===============================
// Load data
// ===============================
async function loadHackathons() {
  try {
    const response = await fetch("data/hackathons.json");
    const data = await response.json();
    allHackathons = data;
    currentFiltered = data;
    renderHackathons(currentFiltered);
  } catch (err) {
    console.error("Failed to load data", err);
  }
}

// ===============================
// Render cards
// ===============================
function renderHackathons(list) {
  const container = document.getElementById("hackathonList");
  container.innerHTML = "";

  list.forEach(h => {
    const isNew = isWithinLast24Hours(h.uploaded_at);

    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold">${h.name}</h3>
          ${
            isNew
              ? `<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">NEW</span>`
              : ""
          }
        </div>

        <p class="mt-2 text-sm text-gray-600">📍 ${h.location} • ${h.mode}</p>
        <p class="mt-1 text-sm text-gray-600">🎓 ${h.college || "Open / Multiple Colleges"}</p>
        <p class="mt-1 text-sm text-gray-600">📅 ${h.start_date} → ${h.end_date}</p>
        <p class="mt-1 text-xs text-gray-400">Posted: ${new Date(h.uploaded_at).toLocaleString()}</p>
      </div>

      <a href="${h.source_url}" target="_blank"
         class="mt-4 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">
        View on ${h.source}
      </a>
    `;

    container.appendChild(card);
  });
}

// ===============================
// Date Filters
// ===============================
function filterByRange(type) {
  const now = new Date();

  if (type === "month") {
    currentFiltered = allHackathons.filter(h => {
      const d = new Date(h.start_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } else if (type === "2months") {
    const future = new Date();
    future.setMonth(future.getMonth() + 2);
    currentFiltered = allHackathons.filter(h => {
      const d = new Date(h.start_date);
      return d >= now && d <= future;
    });
  } else {
    currentFiltered = allHackathons;
  }

  renderHackathons(currentFiltered);
}

// ===============================
// College Search
// ===============================
function filterByCollege() {
  const query = document.getElementById("collegeSearch").value.toLowerCase();

  const filtered = currentFiltered.filter(h => {
    if (!h.college) return true;
    return h.college.toLowerCase().includes(query) || h.college.toLowerCase().includes("open");
  });

  renderHackathons(filtered);
}

// ===============================
loadHackathons();
