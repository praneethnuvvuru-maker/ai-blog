const fetch = require('node-fetch');

async function generateBlog(topic, tone, length) {
  const apiKey = 'AIzaSyBswwPXog8mR4KaBKcnO8gCwNEiiRF1fv4';
  const gemini = await generateFromGemini({ apiKey, topic, tone, length });
  return gemini || 'No content generated. Try a different topic.';
}

async function generateFromGemini({ apiKey, topic, tone, length }) {
  const mapping = { short: 2, medium: 4, long: 6 };
  const target = mapping[length] || mapping.medium;

  const prompt = `Write a concise, ${tone} short blog post about "${topic}".
Keep it to about ${target} sentences.
Make it factual, readable, and engaging.
Avoid lists; produce a single cohesive paragraph.`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ]
  };

  // Choose model from env or default; allow either "gemini-1.5-flash" or "models/gemini-1.5-flash"
  const rawModel = 'gemini-2.5-flash';
  const modelPath = rawModel.startsWith('models/') ? rawModel : `models/${rawModel}`;
  const url = `https://generativelanguage.googleapis.com/v1/${modelPath}:generateContent?key=${encodeURIComponent(apiKey)}`;
  // eslint-disable-next-line no-console
  console.log(`[Gemini] Using model: ${modelPath}`);

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Gemini request failed for ${modelPath}: ${resp.status} ${text}`);
  }
  const data = await resp.json();
  const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return (candidate || '').toString();
}

async function rewriteWithGemini({ apiKey, topic, tone, length, text }) {
  // Map length to sentence guidance
  const mapping = { short: 2, medium: 4, long: 6 };
  const target = mapping[length] || mapping.medium;

  const prompt = `You are editing a short blog section generated from verified Wikipedia content about "${topic}".
Tone: ${tone}.
Target length: about ${target} sentences.
Rewrite the content to be smooth, engaging, and clearly structured. Do not add unverified facts beyond the provided text. Keep it self-contained and suitable as a short blog post.`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { text: '\n\nSOURCE CONTENT:\n' + text }
        ]
      }
    ]
  };

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}` ,{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    throw new Error('Gemini request failed: ' + resp.status);
  }
  const data = await resp.json();
  const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return (candidate || '').toString();
}

module.exports = { generateBlog };


