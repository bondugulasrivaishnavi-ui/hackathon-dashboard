async function loadHackathons() {
  try {
    const response = await fetch("data/hackathons.json");
    const hackathons = await response.json();

    const container = document.getElementById("hackathonList");
    container.innerHTML = "";

    hackathons.forEach(h => {
      const card = document.createElement("div");
      card.className = "hackathon-card";

      card.innerHTML = `
        <h3>${h.name}</h3>
        <div class="meta">📍 ${h.location} | ${h.mode}</div>
        <div class="meta">📅 ${h.start_date} → ${h.end_date}</div>
        <div class="meta">🕒 Posted: ${new Date(h.uploaded_at).toLocaleString()}</div>
        <a class="source-link" href="${h.source_url}" target="_blank">
          View on ${h.source}
        </a>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to load hackathons:", error);
  }
}

loadHackathons();
