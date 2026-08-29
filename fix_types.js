const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'src', 'integrations', 'supabase', 'types.ts');
console.log("Reading file:", filepath);
const content = fs.readFileSync(filepath, 'utf8');

if (content.trim().startsWith('{')) {
  console.log("File is JSON! Parsing...");
  try {
    const data = JSON.parse(content);
    if (data.types) {
      console.log("Found types key. Writing content...");
      fs.writeFileSync(filepath, data.types, 'utf8');
      console.log("Successfully fixed types.ts!");
    } else {
      console.log("No types key in JSON.");
    }
  } catch (err) {
    console.error("Failed to parse JSON:", err);
  }
} else {
  console.log("File is not JSON. Starts with:", content.substring(0, 50));
}
