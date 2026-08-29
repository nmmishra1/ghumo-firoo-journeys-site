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
  if (content.toLowerCase().includes('booking') && !filePath.includes('Booking.tsx')) {
    console.log(`Found 'booking' reference in: ${filePath}`);
  }
});
