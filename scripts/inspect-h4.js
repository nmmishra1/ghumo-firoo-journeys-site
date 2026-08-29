import fs from 'fs';
import path from 'path';

const PAGES_DIR = 'src/pages/packages';
const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
  const lines = content.split('\n');
  const h4Lines = [];
  lines.forEach((line, index) => {
    if (line.includes('<h4') || line.includes('</h4>')) {
      h4Lines.push(`${index + 1}: ${line.trim()}`);
    }
  });
  if (h4Lines.length > 0) {
    console.log(`\n=== FILE: ${file} ===`);
    h4Lines.forEach(l => console.log(l));
  }
});
