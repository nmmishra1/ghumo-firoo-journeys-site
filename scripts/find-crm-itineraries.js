import fs from 'fs';

const filePath = 'src/pages/CRM.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('itineraries-mocked') || line.includes('packages-mocked')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
