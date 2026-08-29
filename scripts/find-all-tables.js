import fs from 'fs';
import path from 'path';

const MIG_DIR = 'supabase/migrations';
const files = fs.readdirSync(MIG_DIR).filter(f => f.endsWith('.sql'));
const tables = new Set();

files.forEach(file => {
  const content = fs.readFileSync(path.join(MIG_DIR, file), 'utf8');
  const matches = content.match(/create table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi) || [];
  matches.forEach(m => {
    const cleaned = m.replace(/create table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?/i, '').trim();
    tables.add(cleaned);
  });
});

console.log('Tables created in migrations:');
console.log(Array.from(tables));
