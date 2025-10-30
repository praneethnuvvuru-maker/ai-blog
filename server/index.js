const path = require('path');
const fs = require('fs');
const express = require('express');
const { generateBlog } = require('./generate');

const app = express();
const PORT = 5000;

// JSON middleware
app.use(express.json());

// Simple CORS middleware (no external dependency)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Ensure logs file exists
const logsPath = path.join(__dirname, 'logs.txt');
if (!fs.existsSync(logsPath)) {
  fs.writeFileSync(logsPath, '', 'utf8');
}

// Serve client (static)
const clientDir = path.join(__dirname, '..', 'client');
app.use(express.static(clientDir));

app.post('/api/generate', async (req, res) => {
  try {
    const { topic, tone, length } = req.body || {};

    if (!topic || typeof topic !== 'string') {
      res.type('text/plain');
      return res.status(400).send('Error: Please provide a valid topic.');
    }

    const selectedTone = (tone || 'Formal').toLowerCase();
    const selectedLength = (length || 'Medium').toLowerCase();

    const output = await generateBlog(topic, selectedTone, selectedLength);

    // Log request
    const logEntry = `[${new Date().toISOString()}] topic="${topic}" tone=${selectedTone} length=${selectedLength}\n`;
    fs.appendFile(logsPath, logEntry, () => {});

    res.type('text/plain');
    return res.send(output);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Generate error:', err && err.stack ? err.stack : err);
    res.type('text/plain');
    const message = (err && err.message) ? err.message : 'Unexpected error while generating content.';
    return res.status(500).send(message);
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});


