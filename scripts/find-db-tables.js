import fs from 'fs';
import path from 'path';

const MIG_DIR = 'supabase/migrations';
const files = fs.readdirSync(MIG_DIR).filter(f => f.endsWith('.sql'));

files.forEach(file => {
  const content = fs.readFileSync(path.join(MIG_DIR, file), 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('create table') && (line.toLowerCase().includes('leads') || line.toLowerCase().includes('bookings') || line.toLowerCase().includes('trips') || line.toLowerCase().includes('packages'))) {
      console.log(`${file}:${index + 1} -> ${line.trim()}`);
    }
  });
});
