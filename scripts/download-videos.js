import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

const videos = [
  {
    name: 'rann-utsav-video.mp4',
    url: 'https://assets.codepen.io/6093409/river.mp4'
  },
  {
    name: 'europe-video.mp4',
    url: 'https://vjs.zencdn.net/v/oceans.mp4'
  }
];

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    const request = (urlToGet) => {
      const parsedUrl = new URL(urlToGet);
      const options = {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };
      https.get(options, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirect
          request(response.headers.location);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${urlToGet}: Status Code ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    };
    
    request(url);
  });
};

const main = async () => {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Copy local WhatsApp video for Rann Utsav
  const localVideoSrc = path.join(publicDir, 'WhatsApp Video 2026-06-18 at 9.22.49 PM.mp4');
  const rannVideoDest = path.join(publicDir, 'rann-utsav-video.mp4');
  if (fs.existsSync(localVideoSrc)) {
    console.log(`Copying local video ${localVideoSrc} to ${rannVideoDest}...`);
    try {
      fs.copyFileSync(localVideoSrc, rannVideoDest);
      console.log(`Successfully copied to ${rannVideoDest}`);
    } catch (error) {
      console.error(`Error copying local video:`, error);
    }
  } else {
    console.error(`Local video ${localVideoSrc} not found, skipping copy`);
  }

  // 2. Download Europe video
  const europeVideo = videos.find(v => v.name === 'europe-video.mp4');
  if (europeVideo) {
    const destPath = path.join(publicDir, europeVideo.name);
    console.log(`Downloading ${europeVideo.name} from ${europeVideo.url}...`);
    try {
      await downloadFile(europeVideo.url, destPath);
      console.log(`Successfully downloaded ${europeVideo.name} to ${destPath}`);
    } catch (error) {
      console.error(`Error downloading ${europeVideo.name}:`, error);
    }
  }
};

main();
