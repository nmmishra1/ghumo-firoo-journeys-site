import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const firstEq = trimmed.indexOf('=');
    if (firstEq === -1) return;
    const key = trimmed.substring(0, firstEq).trim();
    const val = trimmed.substring(firstEq + 1).trim();
    env[key] = val;
  });
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function uploadLogo() {
  const filePath = path.resolve(process.cwd(), 'public', 'ghumo-firoo-logo.png');
  if (!fs.existsSync(filePath)) {
    console.error(`Logo file does not exist at: ${filePath}`);
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(filePath);
  
  console.log(`Uploading logo from ${filePath} to bucket 'trip-reviews'...`);
  
  const { data, error } = await supabase.storage
    .from('trip-reviews')
    .upload('ghumo-firoo-logo.png', fileBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error('Upload failed:', error.message);
    process.exit(1);
  }

  console.log('Upload successful!');
  console.log('File data:', data);
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/trip-reviews/ghumo-firoo-logo.png`;
  console.log(`Public Logo URL: ${publicUrl}`);
}

uploadLogo();
