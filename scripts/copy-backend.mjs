import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('php-backend');
const destDir1 = path.resolve('dist/php-backend');
const destDir2 = path.resolve('dist/public_html/php-backend');

console.log(`📦 Copying PHP backend to dist/php-backend and dist/public_html/php-backend...`);

// Remove existing destinations
[destDir1, destDir2].forEach(dest => {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
});

// Copy recursively to both locations
fs.cpSync(srcDir, destDir1, { recursive: true });
fs.cpSync(srcDir, destDir2, { recursive: true });

function touchRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      touchRecursive(fullPath);
    } else {
      const now = new Date();
      try {
        fs.utimesSync(fullPath, now, now);
      } catch (e) {}
    }
  }
}

touchRecursive(destDir1);
touchRecursive(destDir2);

console.log('✅ PHP Backend successfully bundled and timestamps refreshed for FTP deployment!');
