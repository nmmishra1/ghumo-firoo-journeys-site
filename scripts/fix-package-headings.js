import fs from 'fs';
import path from 'path';

const PAGES_DIR = 'src/pages/packages';
const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(PAGES_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace <CardTitle ...> with <CardTitle as="h2" ...> if it doesn't already have an 'as' prop
  // We can use a regex to find all <CardTitle elements
  content = content.replace(/<CardTitle\b(?![^>]*\bas=)/g, '<CardTitle as="h2"');

  // 2. Replace <h4 ...> with <h3 ...> and </h4> with </h3>
  content = content.replace(/<h4\b/g, '<h3');
  content = content.replace(/<\/h4>/g, '</h3>');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated headings in: ${file}`);
  } else {
    console.log(`No changes needed in: ${file}`);
  }
});
