import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function extractHackathonFromText(rawText) {
  const prompt = `
Extract hackathon details from the text below.
Return STRICT JSON only in this format:

{
  "name": "",
  "college": "",
  "location": "",
  "start_date": "",
  "end_date": "",
  "mode": "Online | Offline",
  "confidence": "high | medium | low"
}

Text:
${rawText}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
