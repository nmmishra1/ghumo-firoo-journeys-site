import fs from 'fs';
import path from 'path';

const PAGES_DIR = 'src/pages/packages';
const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(PAGES_DIR, file), 'utf8');
  console.log(`\n=== FILE: ${file} ===`);
  
  // Find all <h...> or </h...> tags
  const hMatches = content.match(/<h[1-6][\s>]/g) || [];
  console.log(`Heading tags found:`, hMatches);
  
  // Find CardTitles
  const ctMatches = [];
  const regex = /<CardTitle([^>]*)>([\s\S]*?)<\/CardTitle>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ctMatches.push(match[2].trim().replace(/\s+/g, ' '));
  }
  console.log(`CardTitles found:`, ctMatches);
});
