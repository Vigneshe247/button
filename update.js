const fs = require('fs');
const path = require('path');

const fileTxtPath = path.join(__dirname, 'file.txt');
const indexHtmlPath = path.join(__dirname, 'index.html');

function syncContent() {
  if (!fs.existsSync(fileTxtPath)) {
    console.error('file.txt does not exist at:', fileTxtPath);
    return;
  }
  if (!fs.existsSync(indexHtmlPath)) {
    console.error('index.html does not exist at:', indexHtmlPath);
    return;
  }

  const fileContent = fs.readFileSync(fileTxtPath);
  const b64 = fileContent.toString('base64');

  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  const marker = 'const EMBEDDED_CONTENT_B64 = "';
  const startIndex = html.indexOf(marker);
  if (startIndex === -1) {
    console.error('Marker const EMBEDDED_CONTENT_B64 not found in index.html');
    return;
  }

  const valueStart = startIndex + marker.length;
  const valueEnd = html.indexOf('";', valueStart);
  if (valueEnd === -1) {
    console.error('End of b64 string (";) not found in index.html');
    return;
  }

  html = html.substring(0, valueStart) + b64 + html.substring(valueEnd);
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log(`[${new Date().toLocaleTimeString()}] Successfully updated index.html with file.txt (${fileContent.length} bytes).`);
}

// Initial sync
syncContent();

// Optional watch mode if called with --watch
if (process.argv.includes('--watch')) {
  console.log('Watching file.txt for changes... (Press Ctrl+C to stop)');
  fs.watch(fileTxtPath, (eventType) => {
    if (eventType === 'change') {
      try {
        syncContent();
      } catch (err) {
        console.error('Sync error:', err.message);
      }
    }
  });
}
