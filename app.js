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
// Global storage for all hackathons
// ===============================
let allHackathons = [];

// ===============================
// Load hackathons from data file
// ===============================
async function loadHackathons() {
  try {
    const response = await fetch("data/hackathons.json");
    const hackathons = await response.json();

    allHackathons = hackathons;
    renderHackathons(allHackathons);
  } catch (error) {
    console.error("Failed to load hackathons:", error);
  }
}

// ===============================
// Render hackathon cards
// ===============================
function renderHackathons(hackathons) {
  const container = document.getElementById("hackathonList");
  container.innerHTML = "";

  hackathons.forEach(h => {
    const isNew = isWithinLast24Hours(h.uploaded_at);

    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            ${h.name}
          </h3>
          ${
            isNew
              ? `<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                   NEW
                 </span>`
              : ""
          }
        </div>

        <p class="mt-2 text-sm text-gray-600">
          📍 ${h.location} • ${h.mode}
        </p>

        <p class="mt-1 text-sm text-gray-600">
          📅 ${h.start_date} → ${h.end_date}
        </p>

        <p class="mt-1 text-xs text-gray-400">
          Posted: ${new Date(h.uploaded_at).toLocaleString()}
        </p>
      </div>

      <a
        href="${h.source_url}"
        target="_blank"
        class="mt-4 inline-block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg"
      >
        View on ${h.source}
      </a>
    `;

    container.appendChild(card);
  });
}

// ===============================
// Filter by date range
// ===============================
function filterByRange(type) {
  const now = new Date();
  let filtered = [];

  if (type === "month") {
    filtered = allHackathons.filter(h => {
      const start = new Date(h.start_date);
      return (
        start.getMonth() === now.getMonth() &&
        start.getFullYear() === now.getFullYear()
      );
    });
  } else if (type === "2months") {
    const future = new Date();
    future.setMonth(future.getMonth() + 2);

    filtered = allHackathons.filter(h => {
      const start = new Date(h.start_date);
      return start >= now && start <= future;
    });
  } else {
    filtered = allHackathons;
  }

  renderHackathons(filtered);
}

// ===============================
// Start the app
// ===============================
loadHackathons();
