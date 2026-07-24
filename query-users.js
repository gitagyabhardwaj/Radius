import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/VITE_CONVEX_URL=(.+)/);
if (urlMatch) {
  console.log("Convex URL:", urlMatch[1]);
}
