import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('php-backend');
const destDir = path.resolve('dist/php-backend');

console.log(`📦 Copying PHP backend from ${srcDir} to ${destDir}...`);

// Remove existing destination to avoid nested directory issues
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}

// Copy recursively
fs.cpSync(srcDir, destDir, { recursive: true });

console.log('✅ PHP Backend successfully bundled into dist/php-backend!');
