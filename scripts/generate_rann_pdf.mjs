import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getBase64(fileRelPath) {
  const fullPath = path.join(rootDir, fileRelPath);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath).replace('.', '').toLowerCase();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${fs.readFileSync(fullPath).toString('base64')}`;
  }
  return '';
}

async function generatePDF() {
  console.log('🚀 Generating High-Definition Ghumo Firoo Culture Kutch 3N/4D Brochure PDF...');

  const logoBase64 = getBase64('public/ghumo-firoo-logo.png');
  const coverBg = getBase64('public/rann-utsav.jpg') || getBase64('public/rann_utsav_white_desert.jpg');
  
  const imgWhiteDesert = getBase64('public/rann_utsav_white_desert.jpg');
  const imgTentCity = getBase64('public/rann_utsav_tent_city.jpg');
  const imgKaloDungar = getBase64('public/rann_utsav_kalo_dungar.jpg');
  const imgRoadToHeaven = getBase64('public/rann_utsav_road_to_heaven.jpg');
  const imgMandvi = getBase64('public/Mandvi Beach_Kutch.png');
  const imgSunrise = getBase64('public/kutchsunriseimage.jpg');
  const imgKaloDungar2 = getBase64('public/kalodungar.jpg');
  const imgGate = getBase64('public/Dhordo Village Gate.png');
  const imgKutch2024 = getBase64('public/Kutch-Rann-Utsav-2023-2024.jpg');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Culture Kutch - 03 Nights / 04 Days | Ghumo Firoo Journeys</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 0;
    }
    body {
      font-family: 'Montserrat', sans-serif;
      color: #1e293b;
      background: #ffffff;
      width: 210mm;
      margin: 0 auto;
    }
    .page {
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
    }

    /* Common Header */
    .brand-header {
      padding: 20px 32px 14px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid rgba(201, 162, 90, 0.4);
      background: #ffffff;
      z-index: 10;
    }
    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo-img {
      height: 46px;
      width: auto;
      object-fit: contain;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-family: 'Cinzel', serif;
      font-size: 19px;
      font-weight: 800;
      color: #0b1026;
      letter-spacing: 0.5px;
    }
    .brand-tagline {
      font-size: 9px;
      font-weight: 700;
      color: #c9a25a;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .brand-partner-badge {
      font-size: 9px;
      font-weight: 800;
      background: #fbf6ec;
      border: 1px solid #c9a25a;
      color: #8b6b23;
      padding: 5px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Common Footer */
    .brand-footer {
      padding: 13px 32px;
      background: #0b1026;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 9.5px;
      font-weight: 600;
      border-top: 2px solid #c9a25a;
      z-index: 10;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .footer-item {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #e2e8f0;
    }
    .footer-item span.icon {
      color: #c9a25a;
      font-size: 11px;
    }
    .footer-right {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #c9a25a;
      font-weight: 700;
    }

    /* ================================= PAGE 1: COVER ================================= */
    .page-1 {
      background: linear-gradient(180deg, #74b9ff 0%, #a1c4fd 30%, #fde2b9 60%, #fff7eb 100%);
      position: relative;
    }
    .cover-top-brand {
      padding: 34px 40px 0 40px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 2;
    }
    .cover-logo {
      height: 62px;
      margin-bottom: 8px;
    }
    .cover-brand-title {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 900;
      color: #0b1026;
      letter-spacing: 1px;
    }
    .cover-brand-sub {
      font-size: 10.5px;
      font-weight: 700;
      color: #8b6b23;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .cover-tagline-bar {
      margin-top: 28px;
      font-size: 12px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      text-align: center;
      background: rgba(255, 255, 255, 0.75);
      padding: 6px 22px;
      border-radius: 30px;
      border: 1px solid rgba(201, 162, 90, 0.5);
    }
    .cover-main-titles {
      text-align: center;
      margin-top: 14px;
    }
    .cover-title-culture {
      font-family: 'Cinzel', serif;
      font-size: 52px;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 4px 15px rgba(11, 16, 38, 0.4);
      letter-spacing: 4px;
      line-height: 1;
    }
    .cover-title-kutch {
      font-family: 'Cinzel', serif;
      font-size: 66px;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 4px 20px rgba(11, 16, 38, 0.45);
      letter-spacing: 6px;
      line-height: 1;
      margin-top: 4px;
    }
    .cover-duration-pill {
      display: inline-block;
      margin-top: 16px;
      background: #c9a25a;
      color: #0b1026;
      font-family: 'Montserrat', sans-serif;
      font-size: 15px;
      font-weight: 900;
      padding: 7px 28px;
      border-radius: 30px;
      box-shadow: 0 4px 15px rgba(201, 162, 90, 0.5);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .cover-bottom-visual {
      width: 100%;
      height: 115mm;
      position: relative;
      background: url('${coverBg}') center bottom/cover no-repeat;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .cover-bottom-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(253, 226, 185, 0) 0%, rgba(11, 16, 38, 0.3) 100%);
    }
    .cover-footer-bar {
      position: relative;
      z-index: 2;
      width: 100%;
      padding: 15px 32px;
      background: #0b1026;
      color: #c9a25a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10.5px;
      font-weight: 700;
      border-top: 2px solid #c9a25a;
    }

    /* ================================= PAGE 2: ADVENTURE ACTIVITIES ================================= */
    .page-title-banner {
      background: #f8fafc;
      padding: 12px 32px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    }
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 900;
      color: #0b1026;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .section-subtitle {
      font-size: 10.5px;
      font-weight: 600;
      color: #64748b;
      margin-top: 2px;
      letter-spacing: 0.4px;
    }
    .activities-grid {
      padding: 16px 26px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px 10px;
      flex: 1;
    }
    .activity-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
    }
    .activity-img-wrap {
      width: 100%;
      height: 98px;
      background: #0b1026;
      overflow: hidden;
      position: relative;
    }
    .activity-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .activity-label-wrap {
      padding: 7px 5px;
      background: #0b1026;
      color: #ffffff;
      text-align: center;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .activity-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #f1f5f9;
      line-height: 1.2;
    }

    /* ================================= PAGE 3: ITINERARY ================================= */
    .itinerary-container {
      padding: 14px 28px;
      display: flex;
      flex-direction: column;
      gap: 11px;
      flex: 1;
    }
    .day-row {
      display: flex;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 13px;
      overflow: hidden;
      box-shadow: 0 3px 10px rgba(0,0,0,0.03);
      min-height: 104px;
    }
    .day-badge-col {
      background: #0b1026;
      color: #ffffff;
      width: 95px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      border-right: 3px solid #c9a25a;
      flex-shrink: 0;
    }
    .day-num {
      font-family: 'Cinzel', serif;
      font-size: 19px;
      font-weight: 900;
      color: #c9a25a;
      line-height: 1;
    }
    .day-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 4px;
      color: #cbd5e1;
      text-align: center;
    }
    .day-content-col {
      padding: 11px 15px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .day-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      color: #0b1026;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .day-spots {
      font-size: 10.5px;
      font-weight: 600;
      color: #334155;
      line-height: 1.45;
    }
    .day-spots span.bullet {
      color: #c9a25a;
      font-weight: 900;
      margin-right: 3px;
    }
    .day-img-col {
      width: 145px;
      flex-shrink: 0;
      overflow: hidden;
      background: #0b1026;
    }
    .day-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* ================================= PAGE 4: PRICING & INCLUSIONS ================================= */
    .pricing-container {
      padding: 12px 26px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .rate-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.8px;
      text-align: center;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .rate-table th {
      background: #0b1026;
      color: #ffffff;
      padding: 6px 3px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border: 1px solid #334155;
    }
    .rate-table th.th-highlight {
      background: #8b6b23;
      color: #ffffff;
    }
    .rate-table td {
      padding: 4.8px 3px;
      border: 1px solid #e2e8f0;
      font-weight: 600;
      color: #1e293b;
    }
    .rate-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .rate-table tr:hover {
      background: #fef9c3;
    }
    .rate-cost {
      font-weight: 800;
      color: #0b1026;
    }

    .info-boxes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .info-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 9px 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }
    .info-box-title {
      font-family: 'Cinzel', serif;
      font-size: 10.5px;
      font-weight: 900;
      color: #8b6b23;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 5px;
      border-bottom: 1px solid #fef08a;
      padding-bottom: 3px;
    }
    .info-list {
      list-style: none;
      font-size: 8.8px;
      font-weight: 600;
      color: #334155;
      line-height: 1.42;
    }
    .info-list li {
      margin-bottom: 2.5px;
      position: relative;
      padding-left: 9px;
    }
    .info-list li::before {
      content: "•";
      color: #c9a25a;
      font-weight: 900;
      position: absolute;
      left: 0;
    }

    .full-width-box {
      background: #fbf6ec;
      border: 1px solid #fef08a;
      border-radius: 9px;
      padding: 8px 12px;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1: COVER ==================== -->
  <div class="page page-1">
    <div class="cover-top-brand">
      <img src="${logoBase64}" alt="Ghumo Firoo Journeys" class="cover-logo">
      <h1 class="cover-brand-title">Ghumo Firoo Journeys</h1>
      <p class="cover-brand-sub">Journeys Crafted With Intention · Luxury Travel Specialist</p>

      <div class="cover-tagline-bar">
        DISCOVER THE TIMELESS BEAUTY, HERITAGE & HEART OF KUTCH
      </div>

      <div class="cover-main-titles">
        <div class="cover-title-culture">CULTURE</div>
        <div class="cover-title-kutch">KUTCH</div>
        <div class="cover-duration-pill">03 Nights / 04 Days</div>
      </div>
    </div>

    <div class="cover-bottom-visual">
      <div class="cover-bottom-overlay"></div>
    </div>

    <div class="cover-footer-bar">
      <div>🌐 <strong>ghumofiroo.com</strong> · Ministry of Tourism Partner</div>
      <div>Official Partner: <strong>Evoke Tent City Dhordo</strong></div>
    </div>
  </div>

  <!-- ==================== PAGE 2: ADVENTURE ACTIVITIES ==================== -->
  <div class="page">
    <div class="brand-header">
      <div class="brand-logo-wrap">
        <img src="${logoBase64}" alt="Ghumo Firoo" class="brand-logo-img">
        <div class="brand-text">
          <span class="brand-name">Ghumo Firoo Journeys</span>
          <span class="brand-tagline">Ministry of Tourism Registered Partner</span>
        </div>
      </div>
      <div class="brand-partner-badge">Official Evoke Partner</div>
    </div>

    <div class="page-title-banner">
      <h2 class="section-title">Adventure Activities & Heritage</h2>
      <p class="section-subtitle">Experience the vibrant colors, white desert thrill, and royal culture of Kutch</p>
    </div>

    <div class="activities-grid">
      <!-- 1 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgGate || imgWhiteDesert}" alt="Royal Legacy">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Royal Legacy of Kutch</span>
        </div>
      </div>
      <!-- 2 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgRoadToHeaven || imgWhiteDesert}" alt="Rann Thrill Drive">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Rann Thrill Drive</span>
        </div>
      </div>
      <!-- 3 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgKutch2024 || imgWhiteDesert}" alt="Smritivan Memorial">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Smritivan Museum & Viewpoint</span>
        </div>
      </div>
      <!-- 4 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgGate || imgWhiteDesert}" alt="Threads of Kutch">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Explore Threads of Kutch</span>
        </div>
      </div>
      <!-- 5 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgWhiteDesert}" alt="Paramotoring">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Paramotoring & Gliding</span>
        </div>
      </div>
      <!-- 6 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgKaloDungar}" alt="Hidden Valleys">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Hidden Valleys of Kutch</span>
        </div>
      </div>
      <!-- 7 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgTentCity}" alt="Luxury Spa">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Luxury Spa & Wellness</span>
        </div>
      </div>
      <!-- 8 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgSunrise || imgWhiteDesert}" alt="Rann Sky Watch">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Rann Sky Watch & Stargazing</span>
        </div>
      </div>
      <!-- 9 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgRoadToHeaven || imgWhiteDesert}" alt="Rann Riders">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Rann Riders & ATV Safari</span>
        </div>
      </div>
      <!-- 10 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgKaloDungar2 || imgKaloDungar}" alt="Hilltop">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Hilltop of Kutch (Kalo Dungar)</span>
        </div>
      </div>
      <!-- 11 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${imgTentCity}" alt="Starlite Dinner">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Starlite Desert Gala Dinner</span>
        </div>
      </div>
      <!-- 12 -->
      <div class="activity-card">
        <div class="activity-img-wrap">
          <img class="activity-img" src="${coverBg}" alt="Camel Ride">
        </div>
        <div class="activity-label-wrap">
          <span class="activity-label">Golden Hour Camel Ride</span>
        </div>
      </div>
    </div>

    <div class="brand-footer">
      <div class="footer-left">
        <div class="footer-item"><span class="icon">📞</span> +91 9910987264 / 9870229792</div>
        <div class="footer-item"><span class="icon">✉️</span> info@ghumofiroo.com</div>
      </div>
      <div class="footer-right">
        <span>🌐 ghumofiroo.com</span>
        <span>@ghumofiroo</span>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 3: ITINERARY ==================== -->
  <div class="page">
    <div class="brand-header">
      <div class="brand-logo-wrap">
        <img src="${logoBase64}" alt="Ghumo Firoo" class="brand-logo-img">
        <div class="brand-text">
          <span class="brand-name">Ghumo Firoo Journeys</span>
          <span class="brand-tagline">Ministry of Tourism Registered Partner</span>
        </div>
      </div>
      <div class="brand-partner-badge">03 Nights / 04 Days Itinerary</div>
    </div>

    <div class="page-title-banner">
      <h2 class="section-title">Complete Day-Wise Itinerary</h2>
      <p class="section-subtitle">Chauffeured private transfers, royal palaces, salt desert sunsets & coastal serenity</p>
    </div>

    <div class="itinerary-container">
      <!-- Day 1 -->
      <div class="day-row">
        <div class="day-badge-col">
          <span class="day-num">DAY 1</span>
          <span class="day-label">BHUJ CITY</span>
        </div>
        <div class="day-content-col">
          <h3 class="day-title">Royal Heritage of Bhuj</h3>
          <p class="day-spots">
            <span class="bullet">✦</span> <strong>Prag Mahal</strong> (Italian Gothic Bell Tower) &amp; <strong>Aina Mahal</strong> (Hall of Mirrors)<br>
            <span class="bullet">✦</span> <strong>Smritivan Memorial &amp; Museum</strong> · Hamirsar Lake promenade<br>
            <span class="bullet">✦</span> Vibrant <strong>Bhuj Local Handicraft Bazaar</strong> for Bandhani &amp; silver jewellery
          </p>
        </div>
        <div class="day-img-col">
          <img class="day-img" src="${imgGate || imgWhiteDesert}" alt="Prag Mahal">
        </div>
      </div>

      <!-- Day 2 -->
      <div class="day-row">
        <div class="day-badge-col">
          <span class="day-num">DAY 2</span>
          <span class="day-label">WHITE RANN</span>
        </div>
        <div class="day-content-col">
          <h3 class="day-title">Kalo Dungar &amp; Great Rann of Kutch</h3>
          <p class="day-spots">
            <span class="bullet">✦</span> Panoramic views from <strong>Kalo Dungar (Black Hill)</strong> &amp; <strong>India Bridge</strong><br>
            <span class="bullet">✦</span> Scenic drive through the iconic <strong>Road to Heaven</strong> across salt waters<br>
            <span class="bullet">✦</span> Check-in at <strong>Dhordo Tent City / Premium Resort</strong> &amp; White Rann Sunset Walk
          </p>
        </div>
        <div class="day-img-col">
          <img class="day-img" src="${imgRoadToHeaven || imgWhiteDesert}" alt="White Rann">
        </div>
      </div>

      <!-- Day 3 -->
      <div class="day-row">
        <div class="day-badge-col">
          <span class="day-num">DAY 3</span>
          <span class="day-label">MANDVI COAST</span>
        </div>
        <div class="day-content-col">
          <h3 class="day-title">Coastal Splendour &amp; Royal Mandvi</h3>
          <p class="day-spots">
            <span class="bullet">✦</span> <strong>Vijay Vilas Palace</strong> — Grand private royal beachfront estate<br>
            <span class="bullet">✦</span> Relax at pristine <strong>Mandvi Windmill Beach</strong> &amp; coastal water sports<br>
            <span class="bullet">✦</span> Historic 400-year-old <strong>Handmade Wooden Shipbuilding Yard</strong> on Rukmavati river
          </p>
        </div>
        <div class="day-img-col">
          <img class="day-img" src="${imgMandvi}" alt="Mandvi Beach">
        </div>
      </div>

      <!-- Day 4 -->
      <div class="day-row">
        <div class="day-badge-col">
          <span class="day-num">DAY 4</span>
          <span class="day-label">PILGRIMAGE</span>
        </div>
        <div class="day-content-col">
          <h3 class="day-title">Sacred Kutch Shrines &amp; Departure</h3>
          <p class="day-spots">
            <span class="bullet">✦</span> Sacred darshan at <strong>Mata No Madh</strong> (Maa Ashapura Temple)<br>
            <span class="bullet">✦</span> Holy <strong>Narayan Sarovar</strong> &amp; ancient <strong>Koteshwar Mahadev Temple</strong> at sea edge<br>
            <span class="bullet">✦</span> Assisted departure transfer to <strong>Bhuj Railway Station / Airport</strong>
          </p>
        </div>
        <div class="day-img-col">
          <img class="day-img" src="${imgKaloDungar}" alt="Koteshwar">
        </div>
      </div>
    </div>

    <div class="brand-footer">
      <div class="footer-left">
        <div class="footer-item"><span class="icon">📞</span> +91 9910987264 / 9870229792</div>
        <div class="footer-item"><span class="icon">✉️</span> info@ghumofiroo.com</div>
      </div>
      <div class="footer-right">
        <span>🌐 ghumofiroo.com</span>
        <span>@ghumofiroo</span>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 4: PRICING & INCLUSIONS ==================== -->
  <div class="page">
    <div class="brand-header">
      <div class="brand-logo-wrap">
        <img src="${logoBase64}" alt="Ghumo Firoo" class="brand-logo-img">
        <div class="brand-text">
          <span class="brand-name">Ghumo Firoo Journeys</span>
          <span class="brand-tagline">Ministry of Tourism Registered Partner</span>
        </div>
      </div>
      <div class="brand-partner-badge">Tariff &amp; Inclusions</div>
    </div>

    <div class="page-title-banner">
      <h2 class="section-title">Pricing &amp; Package Inclusions</h2>
      <p class="section-subtitle">Transparent per-person rates with verified luxury stays &amp; private transfers</p>
    </div>

    <div class="pricing-container">
      
      <!-- Pricing Matrix Table -->
      <table class="rate-table">
        <thead>
          <tr>
            <th>Group Size / Pax</th>
            <th>Meal Plan</th>
            <th>Vehicle</th>
            <th>Standard<br>Package</th>
            <th>Superior<br>Package</th>
            <th class="th-highlight">Royal<br>Package</th>
            <th class="th-highlight">Premium<br>Package</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>2 Pax</strong> (1 Room)</td>
            <td>MAP</td>
            <td>AC Sedan</td>
            <td class="rate-cost">₹17,799</td>
            <td class="rate-cost">₹19,899</td>
            <td class="rate-cost" style="color:#8b6b23;">₹21,099</td>
            <td class="rate-cost" style="color:#8b6b23;">₹22,299</td>
          </tr>
          <tr>
            <td><strong>3 Pax</strong> (1 Room)</td>
            <td>MAP</td>
            <td>AC Sedan</td>
            <td class="rate-cost">₹14,599</td>
            <td class="rate-cost">₹15,999</td>
            <td class="rate-cost" style="color:#8b6b23;">₹16,799</td>
            <td class="rate-cost" style="color:#8b6b23;">₹17,599</td>
          </tr>
          <tr>
            <td><strong>4 Pax</strong> (2 Rooms)</td>
            <td>MAP</td>
            <td>AC Sedan</td>
            <td class="rate-cost">₹13,849</td>
            <td class="rate-cost">₹15,939</td>
            <td class="rate-cost" style="color:#8b6b23;">₹17,139</td>
            <td class="rate-cost" style="color:#8b6b23;">₹18,339</td>
          </tr>
          <tr>
            <td><strong>5 Pax</strong> (2 Rooms)</td>
            <td>MAP</td>
            <td>AC Ertiga</td>
            <td class="rate-cost">₹13,579</td>
            <td class="rate-cost">₹15,255</td>
            <td class="rate-cost" style="color:#8b6b23;">₹16,215</td>
            <td class="rate-cost" style="color:#8b6b23;">₹17,175</td>
          </tr>
          <tr>
            <td><strong>6 Pax</strong> (3 Rooms)</td>
            <td>MAP</td>
            <td>AC Ertiga</td>
            <td class="rate-cost">₹13,719</td>
            <td class="rate-cost">₹15,339</td>
            <td class="rate-cost" style="color:#8b6b23;">₹16,539</td>
            <td class="rate-cost" style="color:#8b6b23;">₹17,739</td>
          </tr>
          <tr>
            <td><strong>6 Pax</strong> (2 Rooms Triple)</td>
            <td>MAP</td>
            <td>AC Ertiga</td>
            <td class="rate-cost">₹13,159</td>
            <td class="rate-cost">₹15,279</td>
            <td class="rate-cost" style="color:#8b6b23;">₹16,079</td>
            <td class="rate-cost" style="color:#8b6b23;">₹17,239</td>
          </tr>
          <tr>
            <td><strong>8 Pax</strong> (4 Rooms)</td>
            <td>MAP</td>
            <td>AC Innova</td>
            <td class="rate-cost">₹13,119</td>
            <td class="rate-cost">₹15,159</td>
            <td class="rate-cost" style="color:#8b6b23;">₹16,359</td>
            <td class="rate-cost" style="color:#8b6b23;">₹17,559</td>
          </tr>
          <tr>
            <td><strong>9 Pax</strong> (4 Rooms)</td>
            <td>MAP</td>
            <td>AC Tempo (12S)</td>
            <td class="rate-cost">₹13,859</td>
            <td class="rate-cost">₹15,719</td>
            <td class="rate-cost" style="color:#8b6b23;">₹16,786</td>
            <td class="rate-cost" style="color:#8b6b23;">₹17,852</td>
          </tr>
          <tr>
            <td><strong>10 Pax</strong> (5 Rooms)</td>
            <td>MAP</td>
            <td>AC Tempo (12S)</td>
            <td class="rate-cost">₹13,629</td>
            <td class="rate-cost">₹15,723</td>
            <td class="rate-cost" style="color:#64748b;">On Request</td>
            <td class="rate-cost" style="color:#64748b;">On Request</td>
          </tr>
          <tr>
            <td><strong>12 Pax</strong> (6 Rooms)</td>
            <td>MAP</td>
            <td>AC Tempo (12S)</td>
            <td class="rate-cost">₹12,999</td>
            <td class="rate-cost">₹15,099</td>
            <td class="rate-cost" style="color:#64748b;">On Request</td>
            <td class="rate-cost" style="color:#64748b;">On Request</td>
          </tr>
          <tr>
            <td><strong>12 Pax</strong> (4 Rooms Triple)</td>
            <td>MAP</td>
            <td>AC Tempo (12S)</td>
            <td class="rate-cost">₹12,439</td>
            <td class="rate-cost">₹13,239</td>
            <td class="rate-cost" style="color:#8b6b23;">₹14,039</td>
            <td class="rate-cost" style="color:#8b6b23;">₹15,039</td>
          </tr>
        </tbody>
      </table>

      <!-- Inclusions & Notes -->
      <div class="info-boxes-grid">
        <div class="info-box">
          <div class="info-box-title">✦ Package Inclusions</div>
          <ul class="info-list">
            <li><strong>2 Nights stay</strong> at Premium Hotel/Resort in Bhuj</li>
            <li><strong>1 Night stay</strong> in Traditional Kutch Bhunga / AC Tent in Dhordo</li>
            <li><strong>MAPAI Meal Plan</strong> (Daily Breakfast + Dinner/Lunch included)</li>
            <li>Dedicated <strong>AC Private Vehicle</strong> for full circuit sightseeing &amp; transfers</li>
            <li>All toll taxes, parking fees, driver allowance (DA) &amp; fuel charges</li>
            <li><strong>White Rann entry permits</strong> and monument access arrangements</li>
            <li>Pick-up &amp; drop from Bhuj Airport / Railway Station / Bus Terminal</li>
          </ul>
        </div>

        <div class="info-box">
          <div class="info-box-title">✦ Notes &amp; Policy</div>
          <ul class="info-list">
            <li>Above rates are calculated on a per-person basis (Double/Triple Sharing).</li>
            <li>Rates are subject to dynamic room category availability at booking time.</li>
            <li>Peak Festive Dates (Diwali, Christmas, New Year) subject to festive supplement.</li>
            <li><strong>Extra Adult/Child with Bed:</strong> ₹1,999 per night (MAPAI basis).</li>
            <li>24x7 Dedicated Ghumo Firoo on-trip concierge assistance throughout your tour.</li>
          </ul>
        </div>
      </div>

      <!-- Travel & Cuisine Tips Banner -->
      <div class="full-width-box">
        <div class="info-box-title">✦ Ghumo Firoo Travel &amp; Gourmet Tips</div>
        <ul class="info-list" style="display:grid; grid-template-columns:1fr 1fr; gap:3px 12px;">
          <li><strong>Best Season:</strong> October to March during full moon for gleaming white desert vistas.</li>
          <li><strong>Clothing:</strong> Light woolens recommended for brisk early morning &amp; desert night breeze.</li>
          <li><strong>Kutchi Delicacies:</strong> Don't miss authentic Kutchi Thali, Ringna No Olo, Bajra Rotla &amp; Khavda Mawa.</li>
          <li><strong>Official Partner:</strong> Official booking partner with Evoke Tent City Dhordo for guaranteed luxury.</li>
        </ul>
      </div>

    </div>

    <div class="brand-footer">
      <div class="footer-left">
        <div class="footer-item"><span class="icon">📞</span> +91 9910987264 / 9870229792</div>
        <div class="footer-item"><span class="icon">✉️</span> info@ghumofiroo.com</div>
      </div>
      <div class="footer-right">
        <span>🌐 ghumofiroo.com</span>
        <span>Munirka, South Delhi 110067</span>
      </div>
    </div>
  </div>

</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load' });

  const outputPublic = path.join(rootDir, 'public/Ghumo_Firoo_Culture_Kutch_3N4D_Brochure.pdf');
  const outputDist = path.join(rootDir, 'dist/Ghumo_Firoo_Culture_Kutch_3N4D_Brochure.pdf');

  await page.pdf({
    path: outputPublic,
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  // Also copy to dist
  if (fs.existsSync(path.join(rootDir, 'dist'))) {
    fs.copyFileSync(outputPublic, outputDist);
  }

  await browser.close();
  console.log(`✅ High-Definition PDF generated at: ${outputPublic}`);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
