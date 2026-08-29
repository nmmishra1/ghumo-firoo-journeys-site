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

console.log('✅ PHP Backend successfully bundled into dist/php-backend AND dist/public_html/php-backend!');
