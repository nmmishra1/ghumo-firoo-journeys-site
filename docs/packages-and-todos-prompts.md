# GhumoFiroo — Package Seed Script + TODOs Prompt

---

## PROMPT 1 — Package Seed Script
Run this first. Paste directly into Antigravity.

```
TASK — Create package seed script for four pillar destinations

CONTEXT
The packages table exists in MySQL with this structure:
id (VARCHAR 36 UUID), name, price (DECIMAL), slug (VARCHAR unique),
duration, image, images (JSON), category (JSON), rating, reviews,
destinations (JSON), highlights (JSON), inclusions (JSON),
exclusions (JSON), itinerary (JSON), faqs (JSON),
seo_title, seo_description, seo_keywords, best_time,
group_size, difficulty, quick_facts (JSON),
package_type (ENUM domestic/international), is_active (BOOLEAN)

Some seed packages already exist — run this query first
and report the slugs already present before inserting:
SELECT slug FROM packages WHERE is_active = 1;

CONSTRAINTS
- Do NOT modify any frontend files
- Do NOT modify schema.sql
- Do NOT overwrite existing packages — use INSERT IGNORE
  or ON DUPLICATE KEY UPDATE only for non-critical fields
- Generate UUIDs using UUID() in MySQL for id fields
- All prices are per person in INR unless stated
- Slugs must be URL-safe lowercase with hyphens only

---

CREATE FILE: php-backend/seed_packages.php

This is a one-time seeder script. It should:
1. Connect to MySQL using the existing db.php pattern
2. Insert all packages below using INSERT IGNORE 
   (skip if slug already exists)
3. Print a summary of how many were inserted vs skipped
4. Be safe to run multiple times without duplicating data

---

RANN UTSAV PACKAGES (8 packages, domestic)
Festival season: November 1 to February 28
All images use: /Rann-Utsav-Gujarat.png as primary image

Package 1 — Rann Utsav Day Trip
slug: rann-utsav-day-trip
price: 2999
duration: 1 Day
category: ["domestic","festival","day-trip"]
destinations: ["Rann Utsav","Dhordo","Kutch"]
highlights: ["White Rann Sunset","Cultural Program","Folk Music & Dance","Camel Safari","Local Handicrafts"]
inclusions: ["Pickup from Bhuj","Entry to Rann","Cultural evening","Dinner","Drop back to Bhuj"]
exclusions: ["Accommodation","Personal expenses","Guide charges"]
best_time: November to February
group_size: 1-50 People
seo_title: Rann Utsav Day Trip Package from Bhuj | GhumoFiroo Travels
seo_description: Experience the magic of Rann Utsav in a day. White desert sunset, cultural programs, folk dance and camel safari from Bhuj.

Package 2 — Rann Utsav Deluxe Tent
slug: rann-utsav-deluxe-tent
price: 8999
duration: 2 Nights / 3 Days
category: ["domestic","festival","tent-stay"]
destinations: ["Rann Utsav","Dhordo","Kutch"]
highlights: ["Deluxe AC Tent Stay","White Rann Sunrise Walk","Cultural Evening Program","Camel Safari","All Meals Included"]
inclusions: ["2 nights deluxe tent accommodation","All meals (breakfast lunch dinner)","Cultural evening","Camel safari","Rann entry permit"]
exclusions: ["Travel to Bhuj","Personal expenses","Tips","Alcohol"]
best_time: November to February
group_size: 2-30 People

Package 3 — Rann Utsav Premium Tent
slug: rann-utsav-premium-tent
price: 14999
duration: 2 Nights / 3 Days
category: ["domestic","festival","premium","tent-stay"]
destinations: ["Rann Utsav","Dhordo","Kutch"]
highlights: ["Premium AC Tent with attached bath","Full Moon Night Walk on White Rann","VIP Cultural Evening","Jeep Safari","Spa & Wellness"]
inclusions: ["2 nights premium tent","All meals","Jeep safari","Cultural evening VIP seats","Rann entry permit","One spa session"]
exclusions: ["Airfare or train to Bhuj","Personal expenses","Alcohol"]
best_time: November to February
group_size: 2-20 People

Package 4 — Rann Utsav Rajwadi Suite
slug: rann-utsav-rajwadi-suite
price: 22999
duration: 2 Nights / 3 Days
category: ["domestic","festival","luxury","suite"]
destinations: ["Rann Utsav","Dhordo","Kutch"]
highlights: ["Rajwadi Heritage Suite","Private Sit-out with White Rann View","Royal Dinner under Stars","Horse Safari","Exclusive Sunset Experience"]
inclusions: ["2 nights Rajwadi suite","All meals including royal dinner","Horse safari","Exclusive sunset photography","Rann entry permit","Welcome drink"]
exclusions: ["Travel to Bhuj","Personal shopping","Alcohol"]
best_time: November to February
group_size: 2-10 People

Package 5 — Rann Utsav Darbari Suite
slug: rann-utsav-darbari-suite
price: 28999
duration: 3 Nights / 4 Days
category: ["domestic","festival","luxury","suite"]
destinations: ["Rann Utsav","Dhordo","Kala Dungar","Mandvi","Kutch"]
highlights: ["Darbari Heritage Suite","Kala Dungar Sunrise","Mandvi Beach","India Bridge Visit","Private Butler"]
inclusions: ["3 nights Darbari suite","All meals","Private butler","Kala Dungar sunrise trip","Mandvi excursion","Rann entry permit"]
exclusions: ["Airfare","Personal expenses","Alcohol"]
best_time: November to February
group_size: 2-6 People

Package 6 — Rann Utsav Premium Luxury Experience
slug: rann-utsav-premium-luxury
price: 45000
duration: 3 Nights / 4 Days
category: ["domestic","festival","ultra-luxury"]
destinations: ["Rann Utsav","Dhordo","Kala Dungar","Bhuj","Kutch"]
highlights: ["Ultra-luxury Swiss Cottage","Private White Rann Night Experience","Helicopter Joyride","Chef-curated Royal Dinner","Handloom Workshop"]
inclusions: ["3 nights ultra-luxury cottage","All gourmet meals","Helicopter joyride","Private Rann night experience","Handloom workshop","Bhuj heritage tour","Rann entry permit"]
exclusions: ["Airfare","Personal expenses","Alcohol"]
best_time: November to February
group_size: 2-4 People

Package 7 — Rann Utsav Family Package
slug: rann-utsav-family-package
price: 32000
duration: 3 Nights / 4 Days (price for family of 4)
category: ["domestic","festival","family"]
destinations: ["Rann Utsav","Dhordo","Bhuj","Kutch"]
highlights: ["Family Tent Accommodation","Kids Cultural Activity","Camel Safari for All","Bhuj City Tour","Family Photo Session on White Rann"]
inclusions: ["3 nights family tent (2 rooms)","All meals","Camel safari","Bhuj city tour","Kids activity program","Rann entry permit for 4"]
exclusions: ["Travel to Bhuj","Personal expenses","Alcohol"]
best_time: November to February
group_size: 3-8 People (Family)

Package 8 — Rann Utsav Honeymoon Package
slug: rann-utsav-honeymoon
price: 19999
duration: 2 Nights / 3 Days (per couple)
category: ["domestic","festival","honeymoon","romantic"]
destinations: ["Rann Utsav","Dhordo","Kutch"]
highlights: ["Romantic Tent Decorated with Flowers","Private Sunset Walk on White Rann","Candlelight Dinner","Couple Spa","Moonlit Cultural Performance"]
inclusions: ["2 nights decorated premium tent","All meals including candlelight dinner","Couple spa","Private sunset experience","Cultural evening VIP seats","Rann entry for 2"]
exclusions: ["Travel to Bhuj","Personal shopping","Alcohol"]
best_time: November to February
group_size: 2 People (Couple)

---

CHAR DHAM PACKAGES (10 packages, domestic)
All images use: /Kedarnath.png as primary image

Package 1 — Char Dham Yatra Budget Package
slug: char-dham-yatra-budget
price: 28999
duration: 12 Days / 11 Nights
category: ["domestic","pilgrimage","budget"]
destinations: ["Kedarnath","Badrinath","Gangotri","Yamunotri","Haridwar","Rishikesh"]
highlights: ["All 4 Dhams Covered","Shared Accommodation","AC Bus Transportation","All Darshans","Experienced Guide"]
inclusions: ["11 nights accommodation (3-star)","Daily breakfast and dinner","AC Volvo bus from Haridwar","All temple visits","Guide","First aid kit"]
exclusions: ["Personal expenses","Donations at temples","Helicopter charges","Airfare to Haridwar","Lunch","Pony/Palki charges"]
best_time: May to June and September to October
group_size: 20-40 People
difficulty: Moderate

Package 2 — Char Dham Yatra Standard Package
slug: char-dham-yatra-standard
price: 35999
duration: 12 Days / 11 Nights
category: ["domestic","pilgrimage"]
destinations: ["Kedarnath","Badrinath","Gangotri","Yamunotri","Haridwar","Rishikesh"]
highlights: ["All 4 Dhams","4-Star Hotels","Tempo Traveller","VIP Darshan at Kedarnath","Complimentary Pony till Base"]
inclusions: ["11 nights 4-star accommodation","Breakfast and dinner","Tempo traveller","All temple darshans","Guide","Medical kit","Pony till Kedarnath base"]
exclusions: ["Personal expenses","Donations","Helicopter","Lunch","Airfare","Pony above base camp"]
best_time: May to June and September to October
group_size: 10-20 People
difficulty: Moderate

Package 3 — Char Dham Yatra Luxury Package
slug: char-dham-yatra-luxury
price: 65000
duration: 12 Days / 11 Nights
category: ["domestic","pilgrimage","luxury"]
destinations: ["Kedarnath","Badrinath","Gangotri","Yamunotri","Haridwar","Rishikesh"]
highlights: ["5-Star Accommodation","Private SUV","VIP Darshan Priority","Personal Guide","Helicopter to Kedarnath"]
inclusions: ["11 nights luxury accommodation","All meals","Private SUV","Helicopter to Kedarnath one way","VIP darshan passes","Personal guide","Yoga session at Rishikesh"]
exclusions: ["Personal expenses","Donations","Airfare","Alcohol"]
best_time: May to June and September to October
group_size: 2-8 People
difficulty: Moderate

Package 4 — Char Dham by Helicopter
slug: char-dham-yatra-helicopter
price: 120000
duration: 6 Days / 5 Nights
category: ["domestic","pilgrimage","helicopter","luxury"]
destinations: ["Kedarnath","Badrinath","Gangotri","Yamunotri","Dehradun"]
highlights: ["Helicopter to All 4 Dhams","5-Star Hotels","VIP Darshan","Phata/Sirsi Helipad","No Trekking Required"]
inclusions: ["5 nights luxury hotel","All meals","Helicopter tickets to all 4 dhams","VIP darshan","Personal guide","Airport transfers","Medical support"]
exclusions: ["Airfare to Dehradun","Personal expenses","Donations","Alcohol"]
best_time: May to June and September to October
group_size: 2-6 People
difficulty: Easy

Package 5 — Char Dham Senior Citizen Package
slug: char-dham-senior-citizen
price: 38999
duration: 14 Days / 13 Nights
category: ["domestic","pilgrimage","senior-citizen"]
destinations: ["Kedarnath","Badrinath","Gangotri","Yamunotri","Haridwar","Rishikesh"]
highlights: ["Slower Pace Itinerary","Medical Support Throughout","4-Star Hotels","Palki/Pony Included","Doctor on Call"]
inclusions: ["13 nights 4-star accommodation","All meals","AC tempo traveller","Palki to Kedarnath","Doctor on call","Medical kit","Oxygen cylinder","Guide"]
exclusions: ["Personal expenses","Donations","Airfare","Lunch","Alcohol"]
best_time: May to June and September to October
group_size: 10-25 People (Seniors 55+)
difficulty: Easy

Package 6 — Do Dham Kedarnath + Badrinath
slug: kedarnath-badrinath-do-dham
price: 18999
duration: 7 Days / 6 Nights
category: ["domestic","pilgrimage"]
destinations: ["Kedarnath","Badrinath","Joshimath","Haridwar","Rishikesh","Panch Prayag"]
highlights: ["Kedarnath Temple Darshan","Badrinath Temple Darshan","Panch Prayag Visit","Mana Village","Vasundhara Falls"]
inclusions: ["6 nights accommodation","Breakfast and dinner","Tempo traveller","All darshans","Guide","Medical kit"]
exclusions: ["Personal expenses","Donations","Helicopter","Pony","Lunch","Airfare"]
best_time: May to June and September to October
group_size: 6-20 People
difficulty: Moderate

Package 7 — Do Dham Gangotri + Yamunotri
slug: gangotri-yamunotri-do-dham
price: 15999
duration: 6 Days / 5 Nights
category: ["domestic","pilgrimage"]
destinations: ["Gangotri","Yamunotri","Uttarkashi","Barkot","Harsil","Haridwar"]
highlights: ["Gangotri Temple","Yamunotri Trek","Harsil Valley","Bhagirathi River","Janki Chatti"]
inclusions: ["5 nights accommodation","Breakfast and dinner","Tempo traveller","All darshans","Guide","Medical kit"]
exclusions: ["Personal expenses","Donations","Pony at Yamunotri","Lunch","Airfare"]
best_time: May to June and September to October
group_size: 6-20 People
difficulty: Moderate

Package 8 — Kedarnath Yatra
slug: kedarnath-ek-dham-yatra
price: 9999
duration: 4 Days / 3 Nights
category: ["domestic","pilgrimage"]
destinations: ["Kedarnath","Guptkashi","Sonprayag","Haridwar"]
highlights: ["Kedarnath Temple Darshan","Sonprayag Trek","Gaurikund","Bhairavnath Temple","Mountain Views"]
inclusions: ["3 nights accommodation","Breakfast and dinner","Shared cab","Temple darshan","Guide","Medical kit"]
exclusions: ["Personal expenses","Donations","Helicopter","Pony","Lunch","Airfare"]
best_time: May to June and September to October
group_size: 6-20 People
difficulty: Moderate

Package 9 — Badrinath Yatra
slug: badrinath-ek-dham-yatra
price: 9999
duration: 4 Days / 3 Nights
category: ["domestic","pilgrimage"]
destinations: ["Badrinath","Joshimath","Haridwar","Mana Village"]
highlights: ["Badrinath Temple Darshan","Mana Village Visit","Bhim Pul","Vasudhara Falls","Tapt Kund"]
inclusions: ["3 nights accommodation","Breakfast and dinner","Shared cab","Temple darshan","Guide","Medical kit"]
exclusions: ["Personal expenses","Donations","Lunch","Airfare"]
best_time: May to June and September to October
group_size: 6-20 People
difficulty: Easy

Package 10 — Char Dham Family Package
slug: char-dham-yatra-family
price: 42000
duration: 12 Days / 11 Nights (price for family of 4)
category: ["domestic","pilgrimage","family"]
destinations: ["Kedarnath","Badrinath","Gangotri","Yamunotri","Haridwar","Rishikesh"]
highlights: ["All 4 Dhams","Child-Friendly Itinerary","4-Star Family Rooms","Pony Included","Rishikesh Rafting on Return"]
inclusions: ["11 nights 4-star accommodation in family rooms","All meals","Private tempo traveller","All darshans","Pony at Kedarnath","Rishikesh rafting","Guide","Medical kit"]
exclusions: ["Personal expenses","Donations","Airfare","Alcohol","Children under 5 not recommended for trek"]
best_time: May to June and September to October
group_size: 3-6 People (Family)
difficulty: Moderate

---

SINGAPORE PACKAGES (8 packages, international)
All images use: the Singapore skyline image already in the codebase

Package 1 — Singapore City Delight 4D/3N
slug: singapore-4d-3n-city-delight
price: 55999
duration: 4 Days / 3 Nights
category: ["international","city-break"]
destinations: ["Singapore"]
highlights: ["Gardens by the Bay","Marina Bay Sands","Sentosa Island","Singapore Zoo","Clarke Quay Nightlife"]
inclusions: ["3 nights 4-star hotel","Daily breakfast","Airport transfers","Gardens by Bay tickets","Sentosa island access","City tour"]
exclusions: ["Airfare","Visa fees","Personal expenses","Lunch and dinner","Universal Studios","Casino entry"]
best_time: Year round (avoid monsoon July-September)
group_size: 2-15 People
difficulty: Easy

Package 2 — Singapore Discovery 5D/4N
slug: singapore-5d-4n-discovery
price: 69999
duration: 5 Days / 4 Nights
category: ["international","city-break"]
destinations: ["Singapore"]
highlights: ["Universal Studios Singapore","Night Safari","Gardens by the Bay","Marina Bay Sands Observation Deck","Cable Car Ride"]
inclusions: ["4 nights 4-star hotel","Daily breakfast","Airport transfers","Universal Studios tickets","Night Safari","Cable car","Marina Bay observation deck","City tour"]
exclusions: ["Airfare","Visa fees","Lunch and dinner","Personal expenses","Casino"]
best_time: Year round
group_size: 2-15 People
difficulty: Easy

Package 3 — Singapore + Sentosa Beach Escape
slug: singapore-sentosa-beach
price: 75999
duration: 5 Days / 4 Nights
category: ["international","beach","city-break"]
destinations: ["Singapore","Sentosa"]
highlights: ["Sentosa Beach Resort Stay","Universal Studios","S.E.A. Aquarium","Wings of Time Show","Marina Bay Sands"]
inclusions: ["2 nights Singapore 4-star + 2 nights Sentosa resort","Daily breakfast","Airport transfers","Universal Studios","S.E.A. Aquarium","Wings of Time","Cable car"]
exclusions: ["Airfare","Visa fees","Lunch and dinner","Personal expenses"]
best_time: Year round
group_size: 2-12 People
difficulty: Easy

Package 4 — Singapore + Cruise Experience
slug: singapore-cruise-experience
price: 95000
duration: 6 Days / 5 Nights
category: ["international","cruise","luxury"]
destinations: ["Singapore","International Waters"]
highlights: ["2-Night Star Cruise","Gardens by the Bay","Universal Studios","Marina Bay Sands","Private Deck on Cruise"]
inclusions: ["2 nights Singapore hotel","2 nights cruise (all meals on cruise)","Airport transfers","Gardens by Bay","Universal Studios","Singapore city tour"]
exclusions: ["Airfare","Visa fees","Cruise casino","Personal expenses","Shore excursions on cruise"]
best_time: Year round
group_size: 2-10 People
difficulty: Easy

Package 5 — Singapore + Malaysia Combo
slug: singapore-malaysia-combo-tour
price: 89999
duration: 7 Days / 6 Nights
category: ["international","multi-country"]
destinations: ["Singapore","Kuala Lumpur","Genting Highlands"]
highlights: ["Marina Bay Sands","Twin Towers KL","Genting Highlands Casino Resort","Universal Studios","Batu Caves"]
inclusions: ["6 nights accommodation (3 Singapore + 3 KL/Genting)","Daily breakfast","Singapore-KL coach or flight","Airport transfers","Universal Studios","Twin Towers visit","Batu Caves"]
exclusions: ["Airfare to Singapore","Visa fees","Lunch and dinner","Personal expenses","Casino entry"]
best_time: Year round
group_size: 2-15 People
difficulty: Easy

Package 6 — Singapore Family Fun Package
slug: singapore-family-fun
price: 185000
duration: 5 Days / 4 Nights (price for family of 4)
category: ["international","family"]
destinations: ["Singapore","Sentosa"]
highlights: ["Universal Studios Family Day","Singapore Zoo","Jurong Bird Park","Kids Discovery Centre","Sentosa Beach"]
inclusions: ["4 nights family room 4-star","Daily breakfast","Airport transfers","Universal Studios family tickets","Singapore Zoo","Jurong Bird Park","Kids Discovery Centre","Sentosa access"]
exclusions: ["Airfare","Visa fees","Lunch and dinner","Personal expenses"]
best_time: Year round (school holidays best)
group_size: 3-5 People (Family)
difficulty: Easy

Package 7 — Singapore Honeymoon Escape
slug: singapore-honeymoon-escape
price: 110000
duration: 5 Days / 4 Nights (per couple)
category: ["international","honeymoon","romantic"]
destinations: ["Singapore","Sentosa"]
highlights: ["Sentosa Resort Stay","Couples Spa","Marina Bay Sands Infinity Pool","Candlelight Dinner","Gardens by Night"]
inclusions: ["2 nights Marina Bay area hotel + 2 nights Sentosa resort","Daily breakfast + 1 candlelight dinner","Couples spa","Marina Bay Sands infinity pool access","Gardens by Bay at night","Cable car sunset ride"]
exclusions: ["Airfare","Visa fees","Personal expenses","Other meals","Alcohol"]
best_time: Year round
group_size: 2 People (Couple)
difficulty: Easy

Package 8 — Singapore Luxury Collection
slug: singapore-luxury-collection
price: 150000
duration: 6 Days / 5 Nights
category: ["international","luxury"]
destinations: ["Singapore","Sentosa"]
highlights: ["5-Star Hotel Stay","Private City Tour","Michelin Restaurant Dinner","Night Safari VIP","Helicopter Joyride"]
inclusions: ["3 nights 5-star Marina Bay Sands + 2 nights Sentosa 5-star","Daily breakfast + 2 fine dining dinners","Private car and guide","Universal Studios VIP access","Night Safari VIP","Helicopter joyride","Couples spa","Gardens by Bay"]
exclusions: ["Airfare business class","Visa fees","Personal shopping","Other meals","Alcohol"]
best_time: Year round
group_size: 2-6 People
difficulty: Easy

---

EUROPE PACKAGES (8 packages, international)
All images use existing Europe hub images

Package 1 — Switzerland Highlights
slug: europe-switzerland-highlights
price: 95000
duration: 6 Days / 5 Nights
category: ["international","europe","scenic"]
destinations: ["Switzerland","Zurich","Interlaken","Jungfraujoch","Lucerne","Zermatt"]
highlights: ["Jungfraujoch Top of Europe","Zermatt Matterhorn Views","Lucerne Chapel Bridge","Interlaken Adventure","Rhine Falls"]
inclusions: ["5 nights 4-star hotels","Daily breakfast","Airport transfers","Swiss Travel Pass (3 days)","Jungfraujoch tickets","Guided city tours"]
exclusions: ["Airfare","Schengen visa fees","Lunch and dinner","Personal expenses","Zermatt gondola","Alcohol"]
best_time: June to September and December to February
group_size: 2-15 People
difficulty: Easy

Package 2 — France Highlights
slug: europe-france-highlights
price: 89999
duration: 6 Days / 5 Nights
category: ["international","europe","culture"]
destinations: ["France","Paris","Nice","Versailles","Loire Valley"]
highlights: ["Eiffel Tower","Louvre Museum","Versailles Palace","French Riviera Nice","Seine River Cruise"]
inclusions: ["5 nights 4-star hotels","Daily breakfast","Airport transfers","Eiffel Tower (2nd floor)","Louvre skip-line tickets","Versailles tickets","Seine cruise","Nice day tour"]
exclusions: ["Airfare","Schengen visa","Lunch and dinner","Personal expenses","Eiffel Tower summit","Alcohol"]
best_time: April to June and September to November
group_size: 2-15 People
difficulty: Easy

Package 3 — Switzerland + Paris Tour
slug: europe-switzerland-paris-tour
price: 145000
duration: 8 Days / 7 Nights
category: ["international","europe","multi-country"]
destinations: ["Switzerland","France","Zurich","Interlaken","Lucerne","Paris"]
highlights: ["Jungfraujoch","Interlaken Paragliding","Eiffel Tower","Versailles Palace","Swiss Chocolate Factory"]
inclusions: ["7 nights 4-star hotels","Daily breakfast","Zurich-Paris TGV train","Airport transfers","Jungfraujoch","Eiffel Tower","Versailles","Guided tours","Swiss Travel Pass (2 days)"]
exclusions: ["Airfare","Schengen visa","Lunch and dinner","Personal expenses","Paragliding","Alcohol"]
best_time: April to September
group_size: 2-12 People
difficulty: Easy

Package 4 — Switzerland + Italy Tour
slug: europe-switzerland-italy-tour
price: 155000
duration: 9 Days / 8 Nights
category: ["international","europe","multi-country"]
destinations: ["Switzerland","Italy","Zurich","Lucerne","Milan","Florence","Rome"]
highlights: ["Jungfraujoch","Milan Fashion District","Florence Uffizi Gallery","Colosseum Rome","Vatican City"]
inclusions: ["8 nights 4-star hotels","Daily breakfast","Cross-border coach","Airport transfers","Jungfraujoch","Colosseum skip-line","Vatican Museum","Uffizi Gallery","Guided city tours"]
exclusions: ["Airfare","Schengen visa","Lunch and dinner","Personal expenses","Alcohol"]
best_time: April to September
group_size: 2-12 People
difficulty: Easy

Package 5 — Europe Highlights 12 Days
slug: europe-highlights-12-days
price: 185000
duration: 12 Days / 11 Nights
category: ["international","europe","multi-country"]
destinations: ["France","Belgium","Netherlands","Germany","Switzerland","Italy"]
highlights: ["Paris Eiffel Tower","Bruges Medieval Town","Amsterdam Canals","Frankfurt","Swiss Alps","Rome Colosseum"]
inclusions: ["11 nights 4-star hotels","Daily breakfast","Coach transfers between cities","Airport transfers","Eiffel Tower","Bruges tour","Amsterdam canal cruise","Swiss Alps excursion","Colosseum","Guided city tours"]
exclusions: ["Airfare","Schengen visa","Lunch and dinner","Personal expenses","Alcohol"]
best_time: April to September
group_size: 15-40 People (Group Tour)
difficulty: Easy

Package 6 — Switzerland + Italy + France
slug: europe-swiss-italy-france-tour
price: 175000
duration: 11 Days / 10 Nights
category: ["international","europe","multi-country"]
destinations: ["Switzerland","Italy","France","Zurich","Milan","Florence","Rome","Nice","Paris"]
highlights: ["Swiss Alps Jungfraujoch","Colosseum","Vatican City","Amalfi Coast Drive","Eiffel Tower","Riviera Nice"]
inclusions: ["10 nights 4-star hotels","Daily breakfast","Cross-border coach","Airport transfers","Jungfraujoch","Colosseum","Vatican","Eiffel Tower","Nice day tour","Guided tours throughout"]
exclusions: ["Airfare","Schengen visa","Lunch and dinner","Personal expenses","Alcohol"]
best_time: April to September
group_size: 2-12 People
difficulty: Easy

Package 7 — Grand Europe Tour
slug: grand-europe-tour-15days
price: 245000
duration: 15 Days / 14 Nights
category: ["international","europe","multi-country","premium"]
destinations: ["France","Belgium","Netherlands","Germany","Austria","Switzerland","Italy"]
highlights: ["7 Countries","Eiffel Tower","Bruges","Amsterdam","Neuschwanstein Castle","Vienna Opera House","Jungfraujoch","Colosseum","Vatican"]
inclusions: ["14 nights 4-star+ hotels","Daily breakfast","Luxury coach throughout","Airport transfers","All major attraction tickets","Eiffel Tower","Bruges","Amsterdam canal cruise","Neuschwanstein","Vienna Philharmonic evening","Jungfraujoch","Colosseum","Vatican","Professional tour manager throughout"]
exclusions: ["Airfare","Schengen visa","Lunch and dinner","Personal expenses","Alcohol","Optional excursions"]
best_time: May to September
group_size: 15-35 People (Group Tour)
difficulty: Easy

Package 8 — Italy Cultural Immersion
slug: europe-italy-cultural
price: 99000
duration: 7 Days / 6 Nights
category: ["international","europe","culture"]
destinations: ["Italy","Rome","Florence","Venice","Amalfi"]
highlights: ["Colosseum & Forum","Vatican & Sistine Chapel","Florence Uffizi & David","Venice Gondola","Amalfi Coast Drive"]
inclusions: ["6 nights 4-star hotels","Daily breakfast","Rome-Florence-Venice train","Airport transfers","Colosseum skip-line","Vatican Museum","Uffizi Gallery","Venice gondola ride","Guided city tours"]
exclusions: ["Airfare","Schengen visa","Lunch and dinner","Personal expenses","Alcohol"]
best_time: April to June and September to October
group_size: 2-12 People
difficulty: Easy

---

AFTER INSERTING ALL PACKAGES:

1. Run this verification query and report results:
   SELECT package_type, COUNT(*) as count, 
          MIN(price) as min_price, MAX(price) as max_price
   FROM packages 
   WHERE is_active = 1
   GROUP BY package_type;

2. Run this to confirm all slugs are unique:
   SELECT slug, COUNT(*) FROM packages 
   GROUP BY slug HAVING COUNT(*) > 1;
   (Should return 0 rows)

3. Update the packages table to add itinerary JSON for 
   the top 3 most important packages only 
   (Char Dham Luxury, Grand Europe Tour, Singapore 5D4N)
   with a realistic day-wise itinerary array structure:
   [{"day":1,"title":"Arrival","description":"...","highlights":["..."]}]
   Keep other packages itinerary as NULL for now 
   — they can be added via PackageMaster CRM later.

REPORT BACK:
1. How many packages inserted vs skipped (slugs already existed)
2. Verification query results (count by type, price range)
3. Confirm no duplicate slugs
4. File path of the seed script created
```

---

## PROMPT 2 — All TODOs in one pass
Run this AFTER the package seed script is confirmed.

```
TASK — Resolve all documented TODOs (except checkout integration)

NOTE: The festival countdown TODO was already resolved in a 
previous session by creating src/config/events.ts with the 
ACTIVE_RANN_UTSAV_START export. Confirm this file exists 
before starting — if it does not exist, recreate it as 
the first step.

Checkout integration is intentionally excluded from this 
prompt — it is a separate project requiring payment gateway 
coordination and will be tackled independently.

---

TODO 1 — getReviewsByDestination() implementation

In reviewService.ts, the function does not exist yet.
All hubs fall back to getFeaturedReviews() with a TODO comment.

IMPLEMENT:
1. In php-backend/reviews.php, confirm the GET handler 
   already supports ?destination= filtering.
   Check the existing code — if it does, skip to step 2.
   If not, add this to the GET handler:
     if (isset($_GET['destination']) && !empty($_GET['destination'])) {
       $dest = '%' . $_GET['destination'] . '%';
       $sql .= " AND destination LIKE ?";
       $params[] = $dest;
       $types .= 's';
     }

2. In src/services/reviewService.ts, add this method 
   to the reviewService object:

   async getReviewsByDestination(
     destination: string, 
     limit: number = 10
   ): Promise<GoogleReview[]> {
     try {
       const encodedDest = encodeURIComponent(destination);
       const res = await fetch(
         `${API_BASE}/reviews.php?status=Approved` +
         `&destination=${encodedDest}&limit=${limit}`
       );
       if (!res.ok) throw new Error('Failed to fetch reviews');
       const data = await res.json();
       if (!data.reviews || data.reviews.length === 0) {
         // Fallback to featured reviews if no destination-specific ones
         return this.getFeaturedReviews(limit);
       }
       return data.reviews.map(mapDbReviewToGoogleReview);
     } catch (error) {
       console.error('Error fetching reviews by destination:', error);
       return this.getFeaturedReviews(limit);
     }
   }

3. Replace the TODO fallback comments in these files 
   with actual getReviewsByDestination() calls:
   - RannUtsav.tsx → reviewService.getReviewsByDestination('Rann Utsav')
   - CharDham.tsx → reviewService.getReviewsByDestination('Char Dham')
   - Singapore.tsx → reviewService.getReviewsByDestination('Singapore')
   - Europe.tsx → reviewService.getReviewsByDestination('Europe')
   - KedarnathBadrinath.tsx → 'Kedarnath'
   - Kedarnath.tsx → 'Kedarnath'
   - Badrinath.tsx → 'Badrinath'
   - Gangotri.tsx → 'Gangotri'
   - Yamunotri.tsx → 'Yamunotri'
   - GangotriYamunotri.tsx → 'Gangotri'
   - DoDham.tsx → 'Char Dham'
   Keep getFeaturedReviews() as the fallback inside 
   getReviewsByDestination if 0 results returned.

---

TODO 2 — Filter bars backend support

AUDIT FIRST:
In php-backend/packages.php (or the Express GET /api/packages 
route in razorpay-server.ts — check which one the frontend 
Packages.tsx page actually calls):

1. Show the current API response shape — specifically, 
   what fields come back per package. Check if these 
   fields exist as proper typed values in the response:
   - duration (is it "12 Days" string or a number?)
   - price (is it a number like 35999 or a string?)
   - category (is it a JSON array like ["domestic","luxury"]?)
   - destinations (is it a JSON array?)
   - package_type (is it "domestic" or "international"?)

2. Report the exact response shape before implementing anything.

IF all structured fields exist as proper typed values 
(price as number, category as array, package_type as string):
IMPLEMENT client-side filtering in Packages.tsx:
- After fetching all packages matching the search query,
  apply additional .filter() calls on the result array
- Duration filter: parse number from duration string 
  (e.g. "12 Days" → 12) and filter by range
- Budget filter: filter by price field
- Type filter: filter by package_type field
- Category filter: check if category array includes 
  the selected value
- Do NOT change the backend API

IF fields are embedded only in text/description:
- Leave filters as decorative (already the case)
- Update the TODO comment to document exactly what 
  backend changes would unlock real filtering:
  // TODO: Real filtering requires price as DECIMAL,
  // duration_days as INT, and package_type as ENUM
  // in the API response. Currently embedded in strings.
  // Backend changes needed in packages.php: [list them]
  Do NOT implement the backend change — just document it.

---

TODO 3 — Itinerary package names in ReviewModeration

ReviewModeration.tsx currently has:
// TODO: fetch itinerary package names from 
// PHP endpoint when /api/itineraries is available
And returns an empty array for the package name dropdown.

FIX:
1. Check if GET /api/itineraries exists in 
   razorpay-server.ts. If yes, use it directly.

2. If not, create php-backend/itineraries_list.php:
   GET: SELECT id, package_name, status 
        FROM itineraries 
        WHERE status != 'deleted'
        ORDER BY created_at DESC
   Response: { "itineraries": [{ "id": "...", "package_name": "..." }] }
   Follow the exact same pattern as other PHP files.

3. In ReviewModeration.tsx, replace the empty array stub:
   Current: const [itineraries, setItineraries] = useState([]);
   Replace with a useEffect that fetches from the 
   new endpoint and populates the dropdown.
   
4. Remove the TODO comment after implementation.

---

TODO 4 — CabContracting/HotelContracting data still 
on Express wildcard routes

The contracting data (hotel_rates, cab_rates, cab_routes, 
sightseeing, etc.) queries through the Express generic 
wildcard routes in razorpay-server.ts. These are now 
whitelisted but still a single generic handler.

AUDIT ONLY (no code changes):
Check what specific table queries HotelContracting.tsx 
and CabContracting.tsx make through the wildcard routes.
List each table and the operation type.
Report whether dedicated PHP endpoints would be 
beneficial, or whether the whitelisted Express 
wildcards are sufficient for now.
This is an informational audit — do not implement 
anything based on this finding without a separate approval.

---

CONSTRAINTS
- Do NOT touch src/config/events.ts if it exists
- Do NOT modify schema.sql
- Do NOT implement checkout integration
- Do NOT change any package detail pages or hub pages 
  beyond replacing TODO fallback comments with real calls
- All changes must pass npm run build:dev

REPORT BACK:
1. Confirm events.ts exists (festival TODO already done)
2. TODO 1: List every file where getReviewsByDestination 
   replaced getFeaturedReviews fallback
3. TODO 2: Report the exact API response shape found,
   and whether client-side filtering was implemented 
   or left as decorative with updated documentation
4. TODO 3: Confirm itineraries_list.php created and 
   ReviewModeration dropdown now populated
5. TODO 4: List of tables used by contracting screens 
   via wildcard routes
6. npm run build:dev result
```
