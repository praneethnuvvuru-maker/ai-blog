const form = document.getElementById('generate-form');
const topicInput = document.getElementById('topic');
const toneSelect = document.getElementById('tone');
const lengthSelect = document.getElementById('length');
const resultEl = document.getElementById('result');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');

async function generate() {
  const topic = topicInput.value.trim();
  const tone = toneSelect.value;
  const length = lengthSelect.value;
  if (!topic) {
    resultEl.textContent = 'Please enter a topic.';
    return;
  }

  generateBtn.disabled = true;
  resultEl.textContent = 'Generating...';

  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, tone, length })
    });
    const text = await resp.text();
    if (!resp.ok) {
      resultEl.textContent = text || 'Failed to generate content.';
      return;
    }
    resultEl.textContent = text;
  } catch (err) {
    resultEl.textContent = 'Network error. Make sure the backend is running on port 5000.';
  } finally {
    generateBtn.disabled = false;
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  generate();
});

copyBtn.addEventListener('click', async () => {
  const text = resultEl.textContent.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  } catch (_) {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
});


