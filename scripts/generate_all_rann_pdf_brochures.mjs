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

const logoBase64 = getBase64('public/ghumo-firoo-logo.png');
const coverBg = getBase64('public/brochure-assets/cover_kutch.jpg') || getBase64('public/rann_utsav_white_desert.jpg');

const imgPalace = getBase64('public/brochure-assets/palace_legacy.jpg') || getBase64('public/rann_utsav_tent_city.jpg');
const imgRoadToHeaven = getBase64('public/rann_utsav_road_to_heaven.jpg');
const imgSmritivan = getBase64('public/brochure-assets/smritivan.jpg') || getBase64('public/kalodungar.jpg');
const imgHandicrafts = getBase64('public/brochure-assets/handicrafts.jpg') || getBase64('public/Kutch-Rann-Utsav-2023-2024.jpg');
const imgParamotoring = getBase64('public/brochure-assets/paramotoring.jpg');
const imgHiddenValleys = getBase64('public/brochure-assets/hidden_valleys.jpg');
const imgSpaWellness = getBase64('public/brochure-assets/spa_wellness.jpg');
const imgStargazing = getBase64('public/brochure-assets/stargazing.jpg');
const imgAtvSafari = getBase64('public/brochure-assets/atv_safari.jpg');
const imgKaloDungar = getBase64('public/kalodungar.jpg') || getBase64('public/rann_utsav_kalo_dungar.jpg');
const imgGalaDinner = getBase64('public/brochure-assets/gala_dinner.jpg') || getBase64('public/rann_utsav_tent_city.jpg');
const imgCamelSafari = getBase64('public/brochure-assets/camel_safari.jpg') || getBase64('public/rann_utsav_white_desert.jpg');

const imgMandvi = getBase64('public/Mandvi Beach_Kutch.png');
const imgDholavira = getBase64('public/brochure-assets/dholavira.jpg');
const imgWhiteDesert = getBase64('public/rann_utsav_white_desert.jpg');

// Configurations for 1N2D, 2N3D, 3N4D, 4N5D
const packages = [
  {
    id: '1N2D',
    fileName: 'Ghumo_Firoo_Culture_Kutch_1N2D_Brochure.pdf',
    durationTitle: '01 NIGHT / 02 DAYS',
    headerBadge: '01 NIGHT / 02 DAYS ITINERARY',
    staySummary: '1 Night stay in Traditional Kutch Bhunga / AC Tent in Dhordo (White Rann)',
    itinerarySubtitle: 'Chauffeured private transfers, White Rann sunset & Smritivan memorial',
    itineraryDays: [
      {
        dayNum: 'DAY 1',
        tag: 'WHITE RANN DHORDO',
        title: 'ARRIVAL IN BHUJ & WHITE DESERT SUNSET',
        bullets: [
          'Chauffeured arrival pick-up from Bhuj Airport / Railway Station & scenic drive to Dhordo',
          'Traditional welcome & check-in at Premium AC Bhunga Resort / Dhordo Tent City',
          'Delicious authentic Kutchi lunch & high tea in luxury dining hall',
          'Grand sunset walk on the gleaming White Salt Desert & camel safari',
          'Evening Kutchi folk dance, live music performance & starlite buffet dinner'
        ],
        img: imgWhiteDesert
      },
      {
        dayNum: 'DAY 2',
        tag: 'SMRITIVAN & DEPARTURE',
        title: 'WHITE RANN SUNRISE, SMRITIVAN & DEPARTURE',
        bullets: [
          'Breathtaking early morning sunrise view over the pristine White Desert',
          'Lavish breakfast spread & check-out from Dhordo resort',
          'Excursion to Smritivan Earthquake Memorial & Museum atop Bhujiyo Dungar',
          'Explore local Bhuj handicraft markets for authentic Bandhani, Rogan art & silver',
          'Assisted departure transfer to Bhuj Railway Station / Airport with sweet memories'
        ],
        img: imgSmritivan
      }
    ],
    pricing: [
      { pax: '2 Pax (1 Room)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹9,899', sup: '₹11,499', roy: '₹12,999', prem: '₹14,499' },
      { pax: '3 Pax (1 Room)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹8,499', sup: '₹9,899', roy: '₹10,999', prem: '₹11,999' },
      { pax: '4 Pax (2 Rooms)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹7,999', sup: '₹9,299', roy: '₹10,499', prem: '₹11,499' },
      { pax: '5 Pax (2 Rooms)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹7,499', sup: '₹8,899', roy: '₹9,899', prem: '₹10,899' },
      { pax: '6 Pax (3 Rooms)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹7,299', sup: '₹8,599', roy: '₹9,599', prem: '₹10,599' },
      { pax: '6 Pax (2 Rooms Triple)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹6,899', sup: '₹8,199', roy: '₹9,099', prem: '₹9,999' },
      { pax: '8 Pax (4 Rooms)', meal: 'MAP', vehicle: 'AC Innova', std: '₹6,999', sup: '₹8,299', roy: '₹9,199', prem: '₹10,199' },
      { pax: '9 Pax (4 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹7,499', sup: '₹8,799', roy: '₹9,699', prem: '₹10,699' },
      { pax: '10 Pax (5 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹7,199', sup: '₹8,499', roy: 'On Request', prem: 'On Request' },
      { pax: '12 Pax (6 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹6,899', sup: '₹8,199', roy: 'On Request', prem: 'On Request' },
      { pax: '12 Pax (4 Rooms Triple)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹6,499', sup: '₹7,499', roy: '₹8,299', prem: '₹9,199' }
    ]
  },
  {
    id: '2N3D',
    fileName: 'Ghumo_Firoo_Culture_Kutch_2N3D_Brochure.pdf',
    durationTitle: '02 NIGHTS / 03 DAYS',
    headerBadge: '02 NIGHTS / 03 DAYS ITINERARY',
    staySummary: '1 Night stay in Bhuj + 1 Night in Traditional Kutch Bhunga / AC Tent in Dhordo',
    itinerarySubtitle: 'Chauffeured private transfers, Kalo Dungar, Road to Heaven & White Rann',
    itineraryDays: [
      {
        dayNum: 'DAY 1',
        tag: 'WHITE RANN DHORDO',
        title: 'ARRIVAL IN BHUJ & WHITE DESERT SUNSET',
        bullets: [
          'Chauffeured arrival pick-up from Bhuj Airport / Railway Station & scenic drive to Dhordo',
          'Traditional welcome & check-in at Premium AC Bhunga Resort / Dhordo Tent City',
          'Delicious authentic Kutchi lunch & high tea in luxury dining hall',
          'Grand sunset walk on the gleaming White Salt Desert & camel safari',
          'Evening Kutchi folk dance, live music performance & starlite buffet dinner'
        ],
        img: imgWhiteDesert
      },
      {
        dayNum: 'DAY 2',
        tag: 'KALO DUNGAR & ROAD TO HEAVEN',
        title: 'KALO DUNGAR, INDIA BRIDGE & ROAD TO HEAVEN',
        bullets: [
          'Panoramic views from Kalo Dungar (Black Hill) — highest point of Kutch overlooking the salt desert',
          'Visit iconic Dattatreya Temple & scenic drive through India Bridge border outpost',
          'Thrilling drive across the famous Road to Heaven highway surrounded by glistening white salt flats',
          'Evening return to Dhordo / Bhuj luxury resort with traditional Kutchi dinner'
        ],
        img: imgRoadToHeaven
      },
      {
        dayNum: 'DAY 3',
        tag: 'BHUJ HERITAGE & DEPARTURE',
        title: 'ROYAL BHUJ PALACES, SMRITIVAN & DEPARTURE',
        bullets: [
          'Visit Italian Gothic Prag Mahal Bell Tower & 18th-century Aina Mahal (Hall of Mirrors)',
          'Tour Smritivan Earthquake Memorial & Museum atop historic Bhujiyo Dungar hill',
          'Shopping in local Bhuj handicraft bazaars for Bandhani silk & Rogan art souvenirs',
          'Assisted departure transfer to Bhuj Railway Station / Airport'
        ],
        img: imgPalace
      }
    ],
    pricing: [
      { pax: '2 Pax (1 Room)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹13,999', sup: '₹15,899', roy: '₹17,299', prem: '₹18,499' },
      { pax: '3 Pax (1 Room)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹11,899', sup: '₹13,299', roy: '₹14,199', prem: '₹14,999' },
      { pax: '4 Pax (2 Rooms)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹11,299', sup: '₹12,999', roy: '₹13,999', prem: '₹14,999' },
      { pax: '5 Pax (2 Rooms)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹10,899', sup: '₹12,499', roy: '₹13,299', prem: '₹14,199' },
      { pax: '6 Pax (3 Rooms)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹10,999', sup: '₹12,599', roy: '₹13,499', prem: '₹14,499' },
      { pax: '6 Pax (2 Rooms Triple)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹10,499', sup: '₹11,999', roy: '₹12,899', prem: '₹13,799' },
      { pax: '8 Pax (4 Rooms)', meal: 'MAP', vehicle: 'AC Innova', std: '₹10,599', sup: '₹12,299', roy: '₹13,199', prem: '₹14,199' },
      { pax: '9 Pax (4 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹11,199', sup: '₹12,799', roy: '₹13,699', prem: '₹14,699' },
      { pax: '10 Pax (5 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹10,899', sup: '₹12,499', roy: 'On Request', prem: 'On Request' },
      { pax: '12 Pax (6 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹10,399', sup: '₹11,999', roy: 'On Request', prem: 'On Request' },
      { pax: '12 Pax (4 Rooms Triple)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹9,899', sup: '₹10,899', roy: '₹11,699', prem: '₹12,499' }
    ]
  },
  {
    id: '3N4D',
    fileName: 'Ghumo_Firoo_Culture_Kutch_3N4D_Brochure.pdf',
    durationTitle: '03 NIGHTS / 04 DAYS',
    headerBadge: '03 NIGHTS / 04 DAYS ITINERARY',
    staySummary: '2 Nights stay at Premium Hotel/Resort in Bhuj + 1 Night in Traditional Kutch Bhunga / AC Tent in Dhordo',
    itinerarySubtitle: 'Chauffeured private transfers, royal palaces, salt desert sunsets & coastal serenity',
    itineraryDays: [
      {
        dayNum: 'DAY 1',
        tag: 'BHUJ CITY',
        title: 'ROYAL HERITAGE OF BHUJ',
        bullets: [
          'Prag Mahal (Italian Gothic Bell Tower) & Aina Mahal (Hall of Mirrors)',
          'Smritivan Memorial & Museum · Hamirsar Lake promenade',
          'Vibrant Bhuj Local Handicraft Bazaar for Bandhani & silver jewellery'
        ],
        img: imgPalace
      },
      {
        dayNum: 'DAY 2',
        tag: 'WHITE RANN',
        title: 'KALO DUNGAR & GREAT RANN OF KUTCH',
        bullets: [
          'Panoramic views from Kalo Dungar (Black Hill) & India Bridge',
          'Scenic drive through the iconic Road to Heaven across salt waters',
          'Check-in at Dhordo Tent City / Premium Resort & White Rann Sunset Walk'
        ],
        img: imgRoadToHeaven
      },
      {
        dayNum: 'DAY 3',
        tag: 'MANDVI COAST',
        title: 'COASTAL SPLENDOUR & ROYAL MANDVI',
        bullets: [
          'Vijay Vilas Palace — Grand private royal beachfront estate',
          'Relax at pristine Mandvi Windmill Beach & coastal water sports',
          'Historic 400-year-old Handmade Wooden Shipbuilding Yard on Rukmavati river'
        ],
        img: imgMandvi
      },
      {
        dayNum: 'DAY 4',
        tag: 'PILGRIMAGE',
        title: 'SACRED KUTCH SHRINES & DEPARTURE',
        bullets: [
          'Sacred darshan at Mata No Madh (Maa Ashapura Temple)',
          'Holy Narayan Sarovar & ancient Koteshwar Mahadev Temple at sea edge',
          'Assisted departure transfer to Bhuj Railway Station / Airport'
        ],
        img: imgSmritivan
      }
    ],
    pricing: [
      { pax: '2 Pax (1 Room)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹17,799', sup: '₹19,899', roy: '₹21,099', prem: '₹22,299' },
      { pax: '3 Pax (1 Room)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹14,599', sup: '₹15,999', roy: '₹16,799', prem: '₹17,599' },
      { pax: '4 Pax (2 Rooms)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹13,849', sup: '₹15,939', roy: '₹17,139', prem: '₹18,339' },
      { pax: '5 Pax (2 Rooms)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹13,579', sup: '₹15,255', roy: '₹16,215', prem: '₹17,175' },
      { pax: '6 Pax (3 Rooms)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹13,719', sup: '₹15,339', roy: '₹16,539', prem: '₹17,739' },
      { pax: '6 Pax (2 Rooms Triple)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹13,159', sup: '₹15,279', roy: '₹16,079', prem: '₹17,239' },
      { pax: '8 Pax (4 Rooms)', meal: 'MAP', vehicle: 'AC Innova', std: '₹13,119', sup: '₹15,159', roy: '₹16,359', prem: '₹17,559' },
      { pax: '9 Pax (4 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹13,859', sup: '₹15,719', roy: '₹16,786', prem: '₹17,852' },
      { pax: '10 Pax (5 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹13,629', sup: '₹15,723', roy: 'On Request', prem: 'On Request' },
      { pax: '12 Pax (6 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹12,999', sup: '₹15,099', roy: 'On Request', prem: 'On Request' },
      { pax: '12 Pax (4 Rooms Triple)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹12,439', sup: '₹13,239', roy: '₹14,039', prem: '₹15,039' }
    ]
  },
  {
    id: '4N5D',
    fileName: 'Ghumo_Firoo_Culture_Kutch_4N5D_Brochure.pdf',
    durationTitle: '04 NIGHTS / 05 DAYS',
    headerBadge: '04 NIGHTS / 05 DAYS ITINERARY',
    staySummary: '2 Nights stay in Bhuj + 2 Nights in Traditional Kutch Bhunga / AC Tent in Dhordo',
    itinerarySubtitle: 'Grand Kutch Odyssey: White Rann, Dholavira UNESCO Site, Mandvi & Holy Shrines',
    itineraryDays: [
      {
        dayNum: 'DAY 1',
        tag: 'BHUJ CITY',
        title: 'ROYAL HERITAGE OF BHUJ',
        bullets: [
          'Prag Mahal (Italian Gothic Bell Tower) & Aina Mahal (Hall of Mirrors)',
          'Smritivan Memorial & Museum · Hamirsar Lake promenade',
          'Vibrant Bhuj Local Handicraft Bazaar for Bandhani & silver jewellery'
        ],
        img: imgPalace
      },
      {
        dayNum: 'DAY 2',
        tag: 'WHITE RANN',
        title: 'WHITE RANN DHORDO & TENT CITY GALA',
        bullets: [
          'Scenic journey to Dhordo & luxury check-in at AC Bhunga Resort / Tent City',
          'Spectacular White Desert sunset walk & camel safari over shimmering salt crust',
          'Grand cultural folk music, live dance & starlite open-air dinner buffet'
        ],
        img: imgWhiteDesert
      },
      {
        dayNum: 'DAY 3',
        tag: 'DHOLAVIRA UNESCO',
        title: 'ROAD TO HEAVEN & DHOLAVIRA UNESCO SITE',
        bullets: [
          'Excursion to Kalo Dungar (Black Hill) with panoramic salt views',
          'Spectacular drive along the iconic Road to Heaven through Great Rann waters',
          'Full-day exploration of Dholavira UNESCO World Heritage Harappan Metropolis & 5,000-year-old stepwells'
        ],
        img: imgDholavira
      },
      {
        dayNum: 'DAY 4',
        tag: 'MANDVI COAST',
        title: 'ROYAL MANDVI PALACE & BEACH ESCAPE',
        bullets: [
          'Visit private royal beachfront estate of Vijay Vilas Palace & gardens',
          'Relax at pristine Mandvi Windmill Beach with thrilling coastal water sports',
          'Tour the historic 400-year-old handmade wooden shipbuilding yard'
        ],
        img: imgMandvi
      },
      {
        dayNum: 'DAY 5',
        tag: 'PILGRIMAGE',
        title: 'SACRED KUTCH SHRINES & DEPARTURE',
        bullets: [
          'Darshan at Maa Ashapura Temple (Mata No Madh)',
          'Holy Narayan Sarovar & ancient Koteshwar Mahadev Temple at Arabian sea edge',
          'Assisted departure transfer to Bhuj Railway Station / Airport'
        ],
        img: imgSmritivan
      }
    ],
    pricing: [
      { pax: '2 Pax (1 Room)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹22,999', sup: '₹25,499', roy: '₹27,199', prem: '₹28,999' },
      { pax: '3 Pax (1 Room)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹18,999', sup: '₹20,799', roy: '₹21,999', prem: '₹23,199' },
      { pax: '4 Pax (2 Rooms)', meal: 'MAP', vehicle: 'AC Sedan', std: '₹17,999', sup: '₹19,999', roy: '₹21,499', prem: '₹22,999' },
      { pax: '5 Pax (2 Rooms)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹17,499', sup: '₹19,499', roy: '₹20,799', prem: '₹22,199' },
      { pax: '6 Pax (3 Rooms)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹17,699', sup: '₹19,699', roy: '₹20,999', prem: '₹22,499' },
      { pax: '6 Pax (2 Rooms Triple)', meal: 'MAP', vehicle: 'AC Ertiga', std: '₹16,999', sup: '₹18,899', roy: '₹19,999', prem: '₹21,499' },
      { pax: '8 Pax (4 Rooms)', meal: 'MAP', vehicle: 'AC Innova', std: '₹16,899', sup: '₹18,799', roy: '₹20,299', prem: '₹21,799' },
      { pax: '9 Pax (4 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹17,799', sup: '₹19,899', roy: '₹21,299', prem: '₹22,899' },
      { pax: '10 Pax (5 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹17,399', sup: '₹19,699', roy: 'On Request', prem: 'On Request' },
      { pax: '12 Pax (6 Rooms)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹16,699', sup: '₹18,999', roy: 'On Request', prem: 'On Request' },
      { pax: '12 Pax (4 Rooms Triple)', meal: 'MAP', vehicle: 'AC Tempo (12S)', std: '₹15,999', sup: '₹16,999', roy: '₹17,999', prem: '₹19,299' }
    ]
  }
];

function generateHTML(pkg) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Culture Kutch - ${pkg.durationTitle} | Ghumo Firoo</title>
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

    /* Common Header (Pages 2, 3, 4) */
    .brand-header {
      padding: 14px 32px 10px 32px;
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
      gap: 16px;
    }
    .brand-logo-img {
      height: 56px;
      width: auto;
      object-fit: contain;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 800;
      color: #0b1d3a;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }
    .brand-tagline {
      font-size: 9.5px;
      font-weight: 700;
      color: #b8860b;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .brand-badge {
      font-size: 10px;
      font-weight: 700;
      color: #0b1d3a;
      background: rgba(201, 162, 90, 0.15);
      border: 1.5px solid #c9a25a;
      padding: 5px 14px;
      border-radius: 20px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    /* Common Footer (Pages 2, 3, 4) */
    .brand-footer {
      padding: 9px 32px;
      background: #081326;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.3px;
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
    }
    .footer-right {
      display: flex;
      align-items: center;
      gap: 14px;
      color: #e2e8f0;
    }

    /* PAGE 1: FULL BLEED LUXURY COVER */
    .page-cover {
      background-image: url('${coverBg}');
      background-size: cover;
      background-position: center bottom;
      background-repeat: no-repeat;
      padding: 0;
      justify-content: space-between;
    }
    .cover-top-overlay {
      padding: 42px 36px 20px 36px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.88) 45%, rgba(255, 255, 255, 0.35) 75%, rgba(255, 255, 255, 0) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      z-index: 5;
    }
    .cover-brand-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      margin-bottom: 24px;
    }
    .cover-logo-img {
      height: 72px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 3px 10px rgba(0,0,0,0.12));
    }
    .cover-brand-text {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .cover-brand-title {
      font-family: 'Cinzel', serif;
      font-size: 34px;
      font-weight: 900;
      color: #0b1d3a;
      letter-spacing: 0.8px;
      line-height: 1.05;
    }
    .cover-brand-tag {
      font-size: 11px;
      font-weight: 800;
      color: #b8860b;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .cover-brand-subtag {
      font-size: 9px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.8px;
      margin-top: 2px;
    }
    .cover-tagline-pill {
      display: inline-block;
      background: rgba(255, 255, 255, 0.94);
      border: 1.5px solid rgba(201, 162, 90, 0.85);
      color: #0b1d3a;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 8px 26px;
      border-radius: 30px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      margin-bottom: 20px;
    }
    .cover-main-title {
      font-family: 'Cinzel', serif;
      font-size: 58px;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 4px 20px rgba(11, 29, 58, 0.75), 0 2px 5px rgba(0,0,0,0.5);
      letter-spacing: 6px;
      line-height: 1.05;
      margin-bottom: 16px;
    }
    .cover-duration-badge {
      display: inline-block;
      background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%);
      color: #0b1d3a;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      padding: 8px 32px;
      border-radius: 25px;
      box-shadow: 0 6px 20px rgba(170, 124, 17, 0.45);
    }
    .cover-bottom-bar {
      padding: 13px 36px;
      background: rgba(8, 19, 38, 0.9);
      backdrop-filter: blur(8px);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.8px;
      border-top: 2px solid #c9a25a;
      z-index: 10;
    }

    /* PAGE 2: ADVENTURE ACTIVITIES (FULL IMAGE CARDS) */
    .page-activities-content {
      padding: 14px 28px 10px 28px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .section-heading {
      text-align: center;
      margin-bottom: 10px;
    }
    .section-title {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      font-weight: 800;
      color: #0b1d3a;
      letter-spacing: 1.5px;
    }
    .section-subtitle {
      font-size: 9.5px;
      font-weight: 600;
      color: #64748b;
      margin-top: 2px;
      letter-spacing: 0.5px;
    }
    .activity-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 10px;
      flex: 1;
      margin-bottom: 4px;
    }
    .activity-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
      border: 1px solid rgba(201, 162, 90, 0.4);
      background: #0b1d3a;
      height: 100%;
    }
    .activity-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .activity-card-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 24px 8px 8px 8px;
      background: linear-gradient(to top, rgba(7, 18, 38, 0.98) 0%, rgba(7, 18, 38, 0.75) 55%, transparent 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      text-align: center;
    }
    .activity-card-title {
      font-size: 8.5px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      line-height: 1.25;
      text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
    .activity-card-line {
      width: 22px;
      height: 2px;
      background: #d4af37;
      margin-top: 3px;
      border-radius: 1px;
    }

    /* PAGE 3: ITINERARY */
    .page-itinerary-content {
      padding: 14px 30px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .itinerary-card {
      display: flex;
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      border: 1.5px solid rgba(201, 162, 90, 0.35);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
      flex: 1;
    }
    .itinerary-day-col {
      width: 95px;
      background: linear-gradient(180deg, #0b1d3a 0%, #162a4d 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px;
      text-align: center;
      border-right: 2px solid #c9a25a;
    }
    .itinerary-day-num {
      font-family: 'Cinzel', serif;
      font-size: 15px;
      font-weight: 900;
      color: #d4af37;
      letter-spacing: 1px;
    }
    .itinerary-day-tag {
      font-size: 7.5px;
      font-weight: 700;
      color: #e2e8f0;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-top: 4px;
      line-height: 1.2;
    }
    .itinerary-details-col {
      flex: 1;
      padding: 9px 15px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .itinerary-day-title {
      font-family: 'Cinzel', serif;
      font-size: 11.5px;
      font-weight: 800;
      color: #0b1d3a;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .itinerary-bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2.5px;
    }
    .itinerary-bullets li {
      font-size: 8.2px;
      color: #334155;
      line-height: 1.35;
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-weight: 500;
    }
    .itinerary-bullets li::before {
      content: "✦";
      color: #b8860b;
      font-size: 8.2px;
      font-weight: 900;
      line-height: 1.35;
    }
    .itinerary-img-col {
      width: 140px;
      height: 100%;
    }
    .itinerary-img-col img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* PAGE 4: PRICING & INCLUSIONS - COMPACT VERTICAL STACK */
    .page-pricing-content {
      padding: 12px 28px 10px 28px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rate-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      margin-bottom: 2px;
    }
    .rate-table th {
      background: #081326;
      color: #ffffff;
      padding: 5px 4px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
      border: 1px solid #1e293b;
      font-size: 7.8px;
    }
    .rate-table th.th-package {
      background: #11264b;
      color: #d4af37;
    }
    .rate-table td {
      padding: 3.8px 4px;
      text-align: center;
      border: 1px solid #e2e8f0;
      font-weight: 600;
      color: #334155;
      font-size: 7.8px;
    }
    .rate-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .rate-table .td-pax {
      font-weight: 700;
      color: #0b1d3a;
      text-align: left;
      padding-left: 6px;
    }
    .rate-table .td-price {
      font-weight: 800;
      color: #0b1d3a;
    }
    .rate-table .td-price-prem {
      font-weight: 800;
      color: #b8860b;
    }

    /* VERTICAL SECTION BOXES */
    .v-section-box {
      border: 1.2px solid rgba(201, 162, 90, 0.45);
      border-radius: 6px;
      padding: 6px 10px;
      background: #fafaf9;
    }
    .v-section-title {
      font-family: 'Cinzel', serif;
      font-size: 9px;
      font-weight: 800;
      color: #b8860b;
      letter-spacing: 0.8px;
      margin-bottom: 3px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .v-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 12px;
    }
    .v-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .v-list li {
      font-size: 7.4px;
      color: #334155;
      line-height: 1.3;
      font-weight: 500;
    }
    .v-list li strong {
      color: #0b1d3a;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER -->
  <div class="page page-cover">
    <div class="cover-top-overlay">
      <div class="cover-brand-header">
        <img src="${logoBase64}" class="cover-logo-img" alt="Ghumo Firoo Logo" />
        <div class="cover-brand-text">
          <div class="cover-brand-title">Ghumo Firoo</div>
          <div class="cover-brand-tag">Your Journey, Our Expertise!</div>
          <div class="cover-brand-subtag">Official Partner: Evoke Tent City Dhordo</div>
        </div>
      </div>

      <div class="cover-tagline-pill">
        Discover the Timeless Beauty, Heritage & Heart of Kutch
      </div>

      <div class="cover-main-title">
        CULTURE<br>KUTCH
      </div>

      <div class="cover-duration-badge">
        ${pkg.durationTitle}
      </div>
    </div>

    <div class="cover-bottom-bar">
      <div>🌐 ghumofiroo.com</div>
      <div>Official Partner: Evoke Tent City Dhordo</div>
    </div>
  </div>

  <!-- PAGE 2: ADVENTURE ACTIVITIES & HERITAGE (FULL IMAGE CARDS) -->
  <div class="page">
    <div class="brand-header">
      <div class="brand-logo-wrap">
        <img src="${logoBase64}" class="brand-logo-img" alt="Ghumo Firoo Logo" />
        <div class="brand-text">
          <div class="brand-name">Ghumo Firoo</div>
          <div class="brand-tagline">Your Journey, Our Expertise!</div>
        </div>
      </div>
      <div class="brand-badge">Official Evoke Partner</div>
    </div>

    <div class="page-activities-content">
      <div class="section-heading">
        <div class="section-title">ADVENTURE ACTIVITIES & HERITAGE</div>
        <div class="section-subtitle">Experience the vibrant colors, white desert thrill, and royal culture of Kutch</div>
      </div>

      <div class="activity-grid">
        <!-- 1 -->
        <div class="activity-card">
          <img src="${imgPalace}" alt="Royal Legacy" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">ROYAL LEGACY OF KUTCH</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 2 -->
        <div class="activity-card">
          <img src="${imgRoadToHeaven}" alt="Road to Heaven" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">ROAD TO HEAVEN</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 3 -->
        <div class="activity-card">
          <img src="${imgSmritivan}" alt="Smritivan Museum" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">SMRITIVAN MUSEUM & VIEWPOINT</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 4 -->
        <div class="activity-card">
          <img src="${imgHandicrafts}" alt="Threads of Kutch" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">EXPLORE THE THREADS OF KUTCH</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 5 -->
        <div class="activity-card">
          <img src="${imgParamotoring}" alt="Paramotoring & Gliding" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">PARAMOTORING & GLIDING</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 6 -->
        <div class="activity-card">
          <img src="${imgHiddenValleys}" alt="Hidden Valleys" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">HIDDEN VALLEYS OF KUTCH</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 7 -->
        <div class="activity-card">
          <img src="${imgSpaWellness}" alt="Luxury Spa & Wellness" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">LUXURY SPA & WELLNESS</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 8 -->
        <div class="activity-card">
          <img src="${imgStargazing}" alt="Rann Sky Watch & Stargazing" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">RANN SKY WATCH & STARGAZING</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 9 -->
        <div class="activity-card">
          <img src="${imgAtvSafari}" alt="Rann Riders & ATV Safari" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">RANN RIDERS & ATV SAFARI</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 10 -->
        <div class="activity-card">
          <img src="${imgKaloDungar}" alt="Hilltop of Kutch" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">HILLTOP OF KUTCH (KALO DUNGAR)</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 11 -->
        <div class="activity-card">
          <img src="${imgGalaDinner}" alt="Starlite Desert Gala Dinner" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">STARLITE DESERT GALA DINNER</div>
            <div class="activity-card-line"></div>
          </div>
        </div>

        <!-- 12 -->
        <div class="activity-card">
          <img src="${imgCamelSafari}" alt="Golden Hour Camel Ride" />
          <div class="activity-card-overlay">
            <div class="activity-card-title">GOLDEN HOUR CAMEL RIDE</div>
            <div class="activity-card-line"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="brand-footer">
      <div class="footer-left">
        <div class="footer-item">📞 +91 9910987264 / 9870229792</div>
        <div class="footer-item">✉️ info@ghumofiroo.com</div>
      </div>
      <div class="footer-right">
        <div>🌐 ghumofiroo.com</div>
        <div>@ghumofiroo</div>
      </div>
    </div>
  </div>

  <!-- PAGE 3: COMPLETE DAY-WISE ITINERARY -->
  <div class="page">
    <div class="brand-header">
      <div class="brand-logo-wrap">
        <img src="${logoBase64}" class="brand-logo-img" alt="Ghumo Firoo Logo" />
        <div class="brand-text">
          <div class="brand-name">Ghumo Firoo</div>
          <div class="brand-tagline">Your Journey, Our Expertise!</div>
        </div>
      </div>
      <div class="brand-badge">${pkg.headerBadge}</div>
    </div>

    <div class="page-itinerary-content">
      <div class="section-heading">
        <div class="section-title">COMPLETE DAY-WISE ITINERARY</div>
        <div class="section-subtitle">${pkg.itinerarySubtitle}</div>
      </div>

      ${pkg.itineraryDays.map(day => `
        <div class="itinerary-card">
          <div class="itinerary-day-col">
            <div class="itinerary-day-num">${day.dayNum}</div>
            <div class="itinerary-day-tag">${day.tag}</div>
          </div>
          <div class="itinerary-details-col">
            <div class="itinerary-day-title">${day.title}</div>
            <ul class="itinerary-bullets">
              ${day.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
          <div class="itinerary-img-col">
            <img src="${day.img}" alt="${day.title}" />
          </div>
        </div>
      `).join('')}
    </div>

    <div class="brand-footer">
      <div class="footer-left">
        <div class="footer-item">📞 +91 9910987264 / 9870229792</div>
        <div class="footer-item">✉️ info@ghumofiroo.com</div>
      </div>
      <div class="footer-right">
        <div>🌐 ghumofiroo.com</div>
        <div>@ghumofiroo</div>
      </div>
    </div>
  </div>

  <!-- PAGE 4: PRICING & INCLUSIONS - VERTICAL STACK -->
  <div class="page">
    <div class="brand-header">
      <div class="brand-logo-wrap">
        <img src="${logoBase64}" class="brand-logo-img" alt="Ghumo Firoo Logo" />
        <div class="brand-text">
          <div class="brand-name">Ghumo Firoo</div>
          <div class="brand-tagline">Your Journey, Our Expertise!</div>
        </div>
      </div>
      <div class="brand-badge">Tariff & Inclusions</div>
    </div>

    <div class="page-pricing-content">
      <div class="section-heading">
        <div class="section-title">PRICING & PACKAGE INCLUSIONS</div>
        <div class="section-subtitle">Transparent per-person rates with verified luxury stays & private chauffeured transfers</div>
      </div>

      <table class="rate-table">
        <thead>
          <tr>
            <th style="width: 21%;">Group Size / Pax</th>
            <th style="width: 11%;">Meal Plan</th>
            <th style="width: 14%;">Vehicle</th>
            <th class="th-package" style="width: 13.5%;">Standard Package</th>
            <th class="th-package" style="width: 13.5%;">Superior Package</th>
            <th class="th-package" style="width: 13.5%;">Royal Package</th>
            <th class="th-package" style="width: 13.5%;">Premium Package</th>
          </tr>
        </thead>
        <tbody>
          ${pkg.pricing.map(r => `
            <tr>
              <td class="td-pax">${r.pax}</td>
              <td>${r.meal}</td>
              <td>${r.vehicle}</td>
              <td class="td-price">${r.std}</td>
              <td class="td-price">${r.sup}</td>
              <td class="td-price">${r.roy}</td>
              <td class="td-price-prem">${r.prem}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 1. PACKAGE INCLUSIONS -->
      <div class="v-section-box">
        <div class="v-section-title">✦ Package Inclusions</div>
        <div class="v-grid-2">
          <ul class="v-list">
            <li>• <strong>${pkg.staySummary}</strong></li>
            <li>• <strong>MAPAI Meal Plan</strong> (Daily Breakfast + Dinner/Lunch included)</li>
            <li>• <strong>Dedicated AC Private Vehicle</strong> for complete transfers & sightseeing</li>
          </ul>
          <ul class="v-list">
            <li>• <strong>All toll taxes, parking fees, driver allowance (DA) & fuel charges</strong></li>
            <li>• <strong>White Rann entry permits</strong> and monument access arrangements</li>
            <li>• <strong>Pick-up & drop</strong> from Bhuj Airport / Railway Station / Bus Terminal</li>
          </ul>
        </div>
      </div>

      <!-- 2. PACKAGE EXCLUSIONS -->
      <div class="v-section-box">
        <div class="v-section-title">✦ Package Exclusions</div>
        <div class="v-grid-2">
          <ul class="v-list">
            <li>• Airfare / Train fare to and from Bhuj</li>
            <li>• Personal expenses (laundry, room service, telephone calls, tips)</li>
          </ul>
          <ul class="v-list">
            <li>• Optional adventure activities (Paramotoring, ATV quad bike, Camel safari rides)</li>
            <li>• Monument entry tickets, camera fees & guide fees unless explicitly listed</li>
          </ul>
        </div>
      </div>

      <!-- 3. NOTES & POLICY -->
      <div class="v-section-box">
        <div class="v-section-title">✦ Booking Notes & Policy</div>
        <div class="v-grid-2">
          <ul class="v-list">
            <li>• Above rates are calculated on a <strong>per-person basis</strong> (Double/Triple Sharing).</li>
            <li>• Peak Festive Dates (Diwali, Christmas, New Year) subject to festive supplement.</li>
          </ul>
          <ul class="v-list">
            <li>• <strong>Extra Adult/Child with Bed:</strong> ₹1,999 per night (MAPAI basis).</li>
            <li>• <strong>24x7 Dedicated Ghumo Firoo</strong> on-trip concierge assistance throughout your tour.</li>
          </ul>
        </div>
      </div>

      <!-- 4. TRAVEL & GOURMET TIPS -->
      <div class="v-section-box">
        <div class="v-section-title">✦ Ghumo Firoo Travel & Gourmet Tips</div>
        <div class="v-grid-2">
          <ul class="v-list">
            <li>• <strong>Best Season:</strong> October to March during full moon for gleaming white desert vistas.</li>
            <li>• <strong>Kutchi Delicacies:</strong> Don't miss authentic Kutchi Thali, Ringna No Olo, Bajra Rotla & Khavda Mawa.</li>
          </ul>
          <ul class="v-list">
            <li>• <strong>Clothing:</strong> Light woolens recommended for brisk early morning & desert night breeze.</li>
            <li>• <strong>Official Partner:</strong> Official booking partner with Evoke Tent City Dhordo for guaranteed luxury.</li>
          </ul>
        </div>
      </div>

    </div>

    <div class="brand-footer">
      <div class="footer-left">
        <div class="footer-item">📞 +91 9910987264 / 9870229792</div>
        <div class="footer-item">✉️ info@ghumofiroo.com</div>
      </div>
      <div class="footer-right">
        <div>🌐 ghumofiroo.com</div>
        <div>Munirka, South Delhi 110067</div>
      </div>
    </div>
  </div>

</body>
</html>
  `;
}

async function generateAllPDFs() {
  console.log('🚀 Starting generation of all 4 High-Definition Ghumo Firoo Brochures...');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  for (const pkg of packages) {
    console.log(`\n⏳ Generating brochure: ${pkg.durationTitle} (${pkg.fileName})...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
    
    const html = generateHTML(pkg);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Wait a brief 500ms for any font / image paints
    await new Promise(r => setTimeout(r, 600));

    const outPublic = path.join(rootDir, 'public', pkg.fileName);
    const outDist = path.join(rootDir, 'dist', pkg.fileName);

    await page.pdf({
      path: outPublic,
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    // Also copy to dist if dist exists
    if (fs.existsSync(path.join(rootDir, 'dist'))) {
      fs.copyFileSync(outPublic, outDist);
    }

    console.log(`✅ Saved: ${outPublic}`);
    await page.close();
  }

  await browser.close();
  console.log('\n🎉 All 4 Ghumo Firoo Culture Kutch brochures generated successfully!');
}

generateAllPDFs().catch(err => {
  console.error('❌ Error generating PDFs:', err);
  process.exit(1);
});
