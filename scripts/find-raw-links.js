import fs from 'fs';
import path from 'path';

const SRC_DIR = 'src';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(dirPath);
    }
  });
}

walkDir(SRC_DIR, filePath => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Regex to match <a followed by space and containing href="/..." (internal link)
    // Avoid matching external links like href="https://..." or href="tel:..." or href="mailto:..." or hash links href="#..."
    if (/<a\s[^>]*href=["']\/[^"']/i.test(line)) {
      console.log(`${filePath}:${index + 1} -> ${line.trim()}`);
    }
  });
});
