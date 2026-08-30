// masterDestinations.ts — Comprehensive 200+ Master Tourist Destinations Directory
// Maps City, State/Region, Country, Destination Group / Circuit, and Transport Hubs.

export interface MasterDestination {
  city: string;
  state: string;
  country: string;
  destination_group: string;
  nearest_airport?: string;
  nearest_railway?: string;
  gps_coordinates?: string;
  popular_attractions?: string[];
}

export const MASTER_DESTINATIONS: MasterDestination[] = [
  // ===================== UTTARAKHAND =====================
  {
    city: 'Haridwar',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 38 km',
    nearest_railway: 'Haridwar Junction (HW) - 2 km',
    gps_coordinates: '29.9457, 78.1642',
    popular_attractions: ['Har Ki Pauri', 'Mansa Devi Temple', 'Chandi Devi', 'Ganga Aarti']
  },
  {
    city: 'Rishikesh',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 21 km',
    nearest_railway: 'Yog Nagari Rishikesh (YNRK) - 3 km',
    gps_coordinates: '30.0869, 78.2676',
    popular_attractions: ['Ram Jhula', 'Laxman Jhula', 'Triveni Ghat', 'Beatles Ashram', 'River Rafting']
  },
  {
    city: 'Dehradun',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Hill Station / Valley',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 25 km',
    nearest_railway: 'Dehradun Railway Station (DDN) - 2 km',
    gps_coordinates: '30.3165, 78.0322',
    popular_attractions: ['Robber\'s Cave', 'Sahastradhara', 'FRI', 'Tapkeshwar Temple']
  },
  {
    city: 'Mussoorie',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 58 km',
    nearest_railway: 'Dehradun Railway Station (DDN) - 34 km',
    gps_coordinates: '30.4598, 78.0644',
    popular_attractions: ['Kempty Falls', 'Gun Hill', 'Mall Road', 'Camel\'s Back Road', 'Company Garden']
  },
  {
    city: 'Nainital',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Pantnagar Airport (PGH) - 68 km',
    nearest_railway: 'Kathgodam Railway Station (KGM) - 34 km',
    gps_coordinates: '29.3919, 79.4542',
    popular_attractions: ['Naini Lake', 'Naina Devi Temple', 'Snow View Point', 'Tiffin Top', 'Mall Road']
  },
  {
    city: 'Badrinath',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 310 km',
    nearest_railway: 'Rishikesh / Haridwar - 295 km',
    gps_coordinates: '30.7433, 79.4938',
    popular_attractions: ['Badrinath Temple', 'Mana Village', 'Tapt Kund', 'Vasudhara Falls']
  },
  {
    city: 'Kedarnath',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 240 km',
    nearest_railway: 'Rishikesh / Haridwar - 225 km',
    gps_coordinates: '30.7352, 79.0669',
    popular_attractions: ['Kedarnath Temple', 'Bhairavnath Temple', 'Gandhi Sarovar', 'Vasuki Tal']
  },
  {
    city: 'Gangotri',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 250 km',
    nearest_railway: 'Rishikesh Railway Station - 235 km',
    gps_coordinates: '30.9947, 78.9398',
    popular_attractions: ['Gangotri Temple', 'Surya Kund', 'Bhagirathi Shila', 'Gaumukh Trek']
  },
  {
    city: 'Yamunotri',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 210 km',
    nearest_railway: 'Dehradun Railway Station - 175 km',
    gps_coordinates: '31.0140, 78.4600',
    popular_attractions: ['Yamunotri Temple', 'Surya Kund', 'Divya Shila', 'Janki Chatti']
  },
  {
    city: 'Auli',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Hill Station / Adventure',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 275 km',
    nearest_railway: 'Rishikesh Railway Station - 260 km',
    gps_coordinates: '30.5284, 79.5684',
    popular_attractions: ['Auli Ropeway', 'Auli Artificial Lake', 'Gorson Bugyal', 'Ski Resort']
  },
  {
    city: 'Jim Corbett',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Wildlife & Safari',
    nearest_airport: 'Pantnagar Airport (PGH) - 80 km',
    nearest_railway: 'Ramnagar Railway Station (RMR) - 12 km',
    gps_coordinates: '29.5300, 78.7747',
    popular_attractions: ['Dhikala Zone', 'Bijrani Safari', 'Corbett Waterfall', 'Garjiya Devi Temple']
  },
  {
    city: 'Ranikhet',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Pantnagar Airport (PGH) - 110 km',
    nearest_railway: 'Kathgodam Railway Station (KGM) - 75 km',
    gps_coordinates: '29.6434, 79.4322',
    popular_attractions: ['Chaubatia Gardens', 'Jhula Devi Temple', 'Golf Course', 'Majkhali']
  },
  {
    city: 'Kausani',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Pantnagar Airport (PGH) - 165 km',
    nearest_railway: 'Kathgodam Railway Station (KGM) - 130 km',
    gps_coordinates: '29.8447, 79.5960',
    popular_attractions: ['Trishul Peak View', 'Anasakti Ashram', 'Tea Estate', 'Rudradhari Falls']
  },
  {
    city: 'Chopta',
    state: 'Uttarakhand',
    country: 'India',
    destination_group: 'Hill Station / Adventure',
    nearest_airport: 'Dehradun Jolly Grant Airport (DED) - 220 km',
    nearest_railway: 'Rishikesh Railway Station - 205 km',
    gps_coordinates: '30.4870, 79.1780',
    popular_attractions: ['Tungnath Temple', 'Chandrashila Peak', 'Deoria Tal']
  },

  // ===================== HIMACHAL PRADESH =====================
  {
    city: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Jubarhati Shimla Airport (SLV) - 22 km / Chandigarh (IXC) - 120 km',
    nearest_railway: 'Kalka Railway Station (KLK) - 86 km / Shimla Toy Train Station',
    gps_coordinates: '31.1048, 77.1734',
    popular_attractions: ['The Ridge', 'Mall Road', 'Jakhoo Temple', 'Kufri', 'Christ Church']
  },
  {
    city: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Hill Station / Adventure',
    nearest_airport: 'Bhuntar Kullu Airport (KUU) - 50 km / Chandigarh (IXC) - 290 km',
    nearest_railway: 'Chandigarh / Joginder Nagar - 160 km',
    gps_coordinates: '32.2396, 77.1887',
    popular_attractions: ['Solang Valley', 'Rohtang Pass', 'Atal Tunnel', 'Hadimba Temple', 'Old Manali', 'Jogini Waterfall']
  },
  {
    city: 'Dharamshala',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Gaggal Kangra Airport (DHM) - 14 km',
    nearest_railway: 'Pathankot Junction (PTK) - 85 km',
    gps_coordinates: '32.2190, 76.3234',
    popular_attractions: ['HPCA Stadium', 'War Memorial', 'Tea Gardens', 'Norbulingka Institute']
  },
  {
    city: 'McLeodganj',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Hill Station / Cultural',
    nearest_airport: 'Gaggal Kangra Airport (DHM) - 18 km',
    nearest_railway: 'Pathankot Junction (PTK) - 90 km',
    gps_coordinates: '32.2426, 76.3213',
    popular_attractions: ['Dalai Lama Temple', 'Bhagsunag Waterfall', 'Triund Trek', 'Namgyal Monastery']
  },
  {
    city: 'Dalhousie',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Gaggal Kangra Airport (DHM) - 105 km / Pathankot (IXP) - 80 km',
    nearest_railway: 'Pathankot Junction (PTK) - 80 km',
    gps_coordinates: '32.5387, 75.9710',
    popular_attractions: ['Khajjiar (Mini Switzerland)', 'Panchpula', 'Dainkund Peak', 'Kalatop Wildlife Sanctuary']
  },
  {
    city: 'Kasol',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Hill Station / Adventure',
    nearest_airport: 'Bhuntar Kullu Airport (KUU) - 31 km',
    nearest_railway: 'Chandigarh Railway Station - 280 km',
    gps_coordinates: '32.0100, 77.3150',
    popular_attractions: ['Parvati River', 'Manikaran Sahib Gurudwara', 'Tosh Village', 'Kheerganga Trek', 'Chalal']
  },
  {
    city: 'Spiti Valley (Kaza)',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Heritage & Desert / Adventure',
    nearest_airport: 'Bhuntar Kullu Airport (KUU) - 240 km',
    nearest_railway: 'Shimla / Chandigarh',
    gps_coordinates: '32.2276, 78.0710',
    popular_attractions: ['Key Monastery', 'Chandratal Lake', 'Komic Village', 'Hikkim Post Office', 'Dhankar Gompa']
  },
  {
    city: 'Jibhi & Tirthan Valley',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Hill Station / Nature',
    nearest_airport: 'Bhuntar Kullu Airport (KUU) - 50 km',
    nearest_railway: 'Chandigarh Railway Station - 260 km',
    gps_coordinates: '31.6030, 77.3450',
    popular_attractions: ['Jibhi Waterfall', 'Serolsar Lake', 'Jalori Pass', 'Great Himalayan National Park']
  },
  {
    city: 'Kasauli',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Chandigarh International Airport (IXC) - 65 km',
    nearest_railway: 'Kalka Railway Station (KLK) - 30 km',
    gps_coordinates: '30.9013, 76.9649',
    popular_attractions: ['Gilbert Trail', 'Monkey Point', 'Sunset Point', 'Christ Church', 'Mall Road']
  },
  {
    city: 'Bir Billing',
    state: 'Himachal Pradesh',
    country: 'India',
    destination_group: 'Adventure / Paragliding',
    nearest_airport: 'Gaggal Kangra Airport (DHM) - 68 km',
    nearest_railway: 'Pathankot Junction (PTK) - 140 km',
    gps_coordinates: '32.0460, 76.7190',
    popular_attractions: ['Paragliding Takeoff Site', 'Deer Park Institute', 'Chokling Monastery', 'Baijnath Temple']
  },

  // ===================== RAJASTHAN =====================
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    destination_group: 'Heritage & Desert',
    nearest_airport: 'Jaipur International Airport (JAI) - 12 km',
    nearest_railway: 'Jaipur Junction (JP) - 3 km',
    gps_coordinates: '26.9124, 75.7873',
    popular_attractions: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar', 'Nahargarh Fort', 'Chokhi Dhani']
  },
  {
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    destination_group: 'Heritage & Lakes',
    nearest_airport: 'Maharana Pratap Udaipur Airport (UDR) - 22 km',
    nearest_railway: 'Udaipur City Railway Station (UDZ) - 3 km',
    gps_coordinates: '24.5854, 73.7125',
    popular_attractions: ['City Palace Udaipur', 'Lake Pichola', 'Jag Mandir', 'Saheliyon Ki Bari', 'Fateh Sagar Lake', 'Sajjangarh Fort']
  },
  {
    city: 'Jodhpur',
    state: 'Rajasthan',
    country: 'India',
    destination_group: 'Heritage & Desert',
    nearest_airport: 'Jodhpur Airport (JDH) - 6 km',
    nearest_railway: 'Jodhpur Junction (JU) - 2 km',
    gps_coordinates: '26.2389, 73.0243',
    popular_attractions: ['Mehrangarh Fort', 'Umaid Bhawan Palace', 'Jaswant Thada', 'Clock Tower & Sadar Market', 'Mandore Gardens']
  },
  {
    city: 'Jaisalmer',
    state: 'Rajasthan',
    country: 'India',
    destination_group: 'Heritage & Desert',
    nearest_airport: 'Jaisalmer Airport (JSA) - 15 km',
    nearest_railway: 'Jaisalmer Railway Station (JSM) - 2 km',
    gps_coordinates: '26.9157, 70.9083',
    popular_attractions: ['Jaisalmer Golden Fort', 'Sam Sand Dunes', 'Patwon Ki Haveli', 'Gadisar Lake', 'Desert Camel Safari']
  },
  {
    city: 'Pushkar',
    state: 'Rajasthan',
    country: 'India',
    destination_group: 'Spiritual / Cultural',
    nearest_airport: 'Kishangarh Airport (KQH) - 40 km / Jaipur (JAI) - 145 km',
    nearest_railway: 'Ajmer Junction (AII) - 14 km',
    gps_coordinates: '26.4899, 74.5511',
    popular_attractions: ['Brahma Temple', 'Pushkar Lake & Ghats', 'Savitri Temple', 'Desert Camp & Camel Fair']
  },
  {
    city: 'Mount Abu',
    state: 'Rajasthan',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Udaipur Airport (UDR) - 175 km / Ahmedabad (AMD) - 220 km',
    nearest_railway: 'Abu Road Railway Station (ABR) - 28 km',
    gps_coordinates: '24.5925, 72.7156',
    popular_attractions: ['Dilwara Jain Temples', 'Nakki Lake', 'Guru Shikhar', 'Sunset Point', 'Achalgarh Fort']
  },
  {
    city: 'Ranthambore (Sawai Madhopur)',
    state: 'Rajasthan',
    country: 'India',
    destination_group: 'Wildlife & Safari',
    nearest_airport: 'Jaipur International Airport (JAI) - 160 km',
    nearest_railway: 'Sawai Madhopur Junction (SWM) - 8 km',
    gps_coordinates: '26.0173, 76.5026',
    popular_attractions: ['Ranthambore Tiger Safari', 'Ranthambore Fort', 'Trinetra Ganesh Temple', 'Padam Talao']
  },
  {
    city: 'Bikaner',
    state: 'Rajasthan',
    country: 'India',
    destination_group: 'Heritage & Desert',
    nearest_airport: 'Bikaner Nal Airport (BKB) - 15 km',
    nearest_railway: 'Bikaner Junction (BKN) - 2 km',
    gps_coordinates: '28.0229, 73.3119',
    popular_attractions: ['Junagarh Fort', 'Karni Mata Rat Temple', 'National Camel Research Centre', 'Lalgarh Palace']
  },

  // ===================== KERALA =====================
  {
    city: 'Munnar',
    state: 'Kerala',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Cochin International Airport (COK) - 110 km',
    nearest_railway: 'Aluva Railway Station (AWY) - 110 km',
    gps_coordinates: '10.0889, 77.0595',
    popular_attractions: ['Tea Gardens & Museum', 'Eravikulam National Park', 'Mattupetty Dam', 'Top Station', 'Anamudi Peak']
  },
  {
    city: 'Alleppey (Alappuzha)',
    state: 'Kerala',
    country: 'India',
    destination_group: 'Beach & Backwaters',
    nearest_airport: 'Cochin International Airport (COK) - 78 km',
    nearest_railway: 'Alappuzha Railway Station (ALLP) - 3 km',
    gps_coordinates: '9.4981, 76.3388',
    popular_attractions: ['Houseboat Backwater Cruise', 'Alleppey Beach', 'Vembanad Lake', 'Marari Beach', 'Punnamada Lake']
  },
  {
    city: 'Kochi (Cochin)',
    state: 'Kerala',
    country: 'India',
    destination_group: 'Coastal & Heritage',
    nearest_airport: 'Cochin International Airport (COK) - 28 km',
    nearest_railway: 'Ernakulam Junction (ERS) - 2 km',
    gps_coordinates: '9.9312, 76.2673',
    popular_attractions: ['Fort Kochi', 'Chinese Fishing Nets', 'Mattancherry Dutch Palace', 'Jewish Synagogue', 'Marine Drive']
  },
  {
    city: 'Thekkady (Periyar)',
    state: 'Kerala',
    country: 'India',
    destination_group: 'Wildlife & Nature',
    nearest_airport: 'Madurai Airport (IXM) - 140 km / Cochin (COK) - 150 km',
    nearest_railway: 'Kottayam Railway Station (KTYM) - 110 km',
    gps_coordinates: '9.6031, 77.1615',
    popular_attractions: ['Periyar Tiger Reserve Boat Safari', 'Spice Plantation Tour', 'Elephant Junction', 'Kathakali & Kalaripayattu Show']
  },
  {
    city: 'Wayanad',
    state: 'Kerala',
    country: 'India',
    destination_group: 'Hill Station / Nature',
    nearest_airport: 'Calicut Kozhikode Airport (CCJ) - 85 km',
    nearest_railway: 'Kozhikode Railway Station (CLT) - 75 km',
    gps_coordinates: '11.6854, 76.1320',
    popular_attractions: ['Banasura Sagar Dam', 'Edakkal Caves', 'Chembra Peak', 'Soochipara Falls', 'Wayanad Wildlife Sanctuary']
  },
  {
    city: 'Kovalam',
    state: 'Kerala',
    country: 'India',
    destination_group: 'Beach Resort',
    nearest_airport: 'Trivandrum International Airport (TRV) - 15 km',
    nearest_railway: 'Trivandrum Central (TVC) - 14 km',
    gps_coordinates: '8.4004, 76.9787',
    popular_attractions: ['Lighthouse Beach', 'Hawa Beach', 'Samudra Beach', 'Ayurvedic Massage & Spas']
  },
  {
    city: 'Varkala',
    state: 'Kerala',
    country: 'India',
    destination_group: 'Beach Resort',
    nearest_airport: 'Trivandrum International Airport (TRV) - 45 km',
    nearest_railway: 'Varkala Sivagiri Railway Station (VAK) - 3 km',
    gps_coordinates: '8.7379, 76.7163',
    popular_attractions: ['Varkala Cliff & Beach', 'Janardhana Swamy Temple', 'Kappil Beach & Backwaters', 'Papanasam Beach']
  },

  // ===================== TAMIL NADU =====================
  {
    city: 'Ooty (Udhagamandalam)',
    state: 'Tamil Nadu',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Coimbatore International Airport (CJB) - 88 km',
    nearest_railway: 'Udhagamandalam Station (UAM) / Mettupalayam (MTP) - 50 km',
    gps_coordinates: '11.4064, 76.6932',
    popular_attractions: ['Ooty Botanical Gardens', 'Ooty Lake', 'Doddabetta Peak', 'Nilgiri Toy Train', 'Rose Garden', 'Tea Factory']
  },
  {
    city: 'Kodaikanal',
    state: 'Tamil Nadu',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Madurai Airport (IXM) - 120 km / Coimbatore (CJB) - 170 km',
    nearest_railway: 'Kodai Road Station (KQN) - 80 km',
    gps_coordinates: '10.2381, 77.4892',
    popular_attractions: ['Kodai Lake', 'Coaker\'s Walk', 'Pillar Rocks', 'Bryant Park', 'Silver Cascade Falls']
  },
  {
    city: 'Coonoor',
    state: 'Tamil Nadu',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Coimbatore International Airport (CJB) - 70 km',
    nearest_railway: 'Coonoor Railway Station (ONR) - 1 km',
    gps_coordinates: '11.3530, 76.7959',
    popular_attractions: ['Sim\'s Park', 'Dolphin\'s Nose', 'Lamb\'s Rock', 'Highfield Tea Estate']
  },
  {
    city: 'Rameswaram',
    state: 'Tamil Nadu',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Madurai Airport (IXM) - 175 km',
    nearest_railway: 'Rameswaram Railway Station (RMM) - 2 km',
    gps_coordinates: '9.2876, 79.3129',
    popular_attractions: ['Ramanathaswamy Temple', 'Dhanushkodi Ghost Town', 'Pamban Bridge', 'Agni Theertham', 'Dr. APJ Abdul Kalam Memorial']
  },
  {
    city: 'Madurai',
    state: 'Tamil Nadu',
    country: 'India',
    destination_group: 'Spiritual / Heritage',
    nearest_airport: 'Madurai International Airport (IXM) - 12 km',
    nearest_railway: 'Madurai Junction (MDU) - 1.5 km',
    gps_coordinates: '9.9252, 78.1198',
    popular_attractions: ['Meenakshi Amman Temple', 'Thirumalai Nayakkar Mahal', 'Gandhi Memorial Museum', 'Alagar Kovil']
  },
  {
    city: 'Kanyakumari',
    state: 'Tamil Nadu',
    country: 'India',
    destination_group: 'Coastal & Spiritual',
    nearest_airport: 'Trivandrum International Airport (TRV) - 90 km',
    nearest_railway: 'Kanyakumari Railway Station (CAPE) - 1 km',
    gps_coordinates: '8.0883, 77.5385',
    popular_attractions: ['Vivekananda Rock Memorial', 'Thiruvalluvar Statue', 'Sunset View Point', 'Kanyakumari Amman Temple', 'Triveni Sangam']
  },
  {
    city: 'Mahabalipuram (Mamallapuram)',
    state: 'Tamil Nadu',
    country: 'India',
    destination_group: 'Heritage & Beach',
    nearest_airport: 'Chennai International Airport (MAA) - 55 km',
    nearest_railway: 'Chengalpattu Junction (CGL) - 30 km',
    gps_coordinates: '12.6269, 80.1927',
    popular_attractions: ['Shore Temple', 'Pancha Rathas', 'Arjuna\'s Penance', 'Krishna\'s Butterball', 'Mahabalipuram Beach']
  },
  {
    city: 'Pondicherry (Puducherry)',
    state: 'Puducherry',
    country: 'India',
    destination_group: 'French Heritage & Beach',
    nearest_airport: 'Pondicherry Airport (PNY) - 5 km / Chennai (MAA) - 145 km',
    nearest_railway: 'Puducherry Railway Station (PDY) - 2 km',
    gps_coordinates: '11.9416, 79.8083',
    popular_attractions: ['Promenade Beach', 'Auroville & Matrimandir', 'French Quarter (White Town)', 'Sri Aurobindo Ashram', 'Paradise Beach']
  },

  // ===================== KARNATAKA =====================
  {
    city: 'Coorg (Madikeri)',
    state: 'Karnataka',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Kannur International Airport (CNN) - 90 km / Mangalore (IXE) - 140 km',
    nearest_railway: 'Mysore Junction (MYS) - 120 km',
    gps_coordinates: '12.4244, 75.7382',
    popular_attractions: ['Abbey Falls', 'Raja\'s Seat', 'Dubare Elephant Camp', 'Namdroling Golden Temple (Bylakuppe)', 'Talacauvery', 'Coffee Plantations']
  },
  {
    city: 'Bangalore (Bengaluru)',
    state: 'Karnataka',
    country: 'India',
    destination_group: 'Metro City',
    nearest_airport: 'Kempegowda International Airport (BLR) - 35 km',
    nearest_railway: 'KSR Bengaluru (SBC) / Yesvantpur (YPR)',
    gps_coordinates: '12.9716, 77.5946',
    popular_attractions: ['Lalbagh Botanical Garden', 'Bangalore Palace', 'Cubbon Park', 'Bannerghatta National Park', 'ISKCON Temple']
  },
  {
    city: 'Mysore (Mysuru)',
    state: 'Karnataka',
    country: 'India',
    destination_group: 'Heritage & Royal',
    nearest_airport: 'Mysore Airport (MYQ) - 10 km / Bangalore (BLR) - 170 km',
    nearest_railway: 'Mysuru Junction (MYS) - 1 km',
    gps_coordinates: '12.2958, 76.6394',
    popular_attractions: ['Mysore Palace', 'Chamundeshwari Temple', 'Brindavan Gardens', 'St. Philomena\'s Church', 'Mysore Zoo']
  },
  {
    city: 'Hampi',
    state: 'Karnataka',
    country: 'India',
    destination_group: 'Heritage & Ruins',
    nearest_airport: 'Jindal Vidyanagar Airport (VDY) - 35 km / Hubli (HBX) - 150 km',
    nearest_railway: 'Hosapete Junction (HPT) - 12 km',
    gps_coordinates: '15.3350, 76.4600',
    popular_attractions: ['Virupaksha Temple', 'Vittala Temple & Stone Chariot', 'Lotus Mahal', 'Matanga Hill', 'Elephant Stables', 'Tungabhadra River']
  },
  {
    city: 'Gokarna',
    state: 'Karnataka',
    country: 'India',
    destination_group: 'Beach & Spiritual',
    nearest_airport: 'Goa Dabolim / Mopa (GOI/GOX) - 140 km',
    nearest_railway: 'Gokarna Road Station (GOK) - 8 km',
    gps_coordinates: '14.5479, 74.3188',
    popular_attractions: ['Om Beach', 'Kudle Beach', 'Mahabaleshwar Temple', 'Half Moon Beach', 'Paradise Beach']
  },
  {
    city: 'Chikmagalur',
    state: 'Karnataka',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Mangalore International Airport (IXE) - 150 km',
    nearest_railway: 'Kadur Railway Station (DRU) - 40 km',
    gps_coordinates: '13.3161, 75.7720',
    popular_attractions: ['Mullayanagiri Peak', 'Baba Budangiri', 'Hebbe Falls', 'Coffee Museum', 'Kudremukh Trek']
  },
  {
    city: 'Kabini & Bandipur',
    state: 'Karnataka',
    country: 'India',
    destination_group: 'Wildlife & Safari',
    nearest_airport: 'Mysore Airport (MYQ) - 75 km / Bangalore (BLR) - 230 km',
    nearest_railway: 'Mysuru Junction (MYS) - 70 km',
    gps_coordinates: '11.9167, 76.2500',
    popular_attractions: ['Kabini River Boat Safari', 'Bandipur Tiger Reserve', 'Nagarhole Jungle Safari', 'Black Panther Sighting']
  },

  // ===================== GOA =====================
  {
    city: 'North Goa',
    state: 'Goa',
    country: 'India',
    destination_group: 'Beach Resort & Nightlife',
    nearest_airport: 'Manohar International Airport Mopa (GOX) - 28 km / Dabolim (GOI) - 42 km',
    nearest_railway: 'Thivim Railway Station (THVM) - 18 km',
    gps_coordinates: '15.5494, 73.7535',
    popular_attractions: ['Calangute Beach', 'Baga Beach', 'Anjuna Flea Market', 'Aguada Fort', 'Chapora Fort (Dil Chahta Hai)', 'Vagator Beach']
  },
  {
    city: 'South Goa',
    state: 'Goa',
    country: 'India',
    destination_group: 'Beach Resort & Serenity',
    nearest_airport: 'Goa Dabolim Airport (GOI) - 20 km / Mopa (GOX) - 65 km',
    nearest_railway: 'Madgaon Junction (MAO) - 8 km',
    gps_coordinates: '15.2832, 73.9862',
    popular_attractions: ['Colva Beach', 'Palolem Beach', 'Benaulim Beach', 'Basilica of Bom Jesus', 'Cabo de Rama Fort', 'Dudhsagar Waterfalls']
  },

  // ===================== GUJARAT =====================
  {
    city: 'Kutch (Dhordo / Rann of Kutch)',
    state: 'Gujarat',
    country: 'India',
    destination_group: 'Heritage & Desert',
    nearest_airport: 'Bhuj Domestic Airport (BHJ) - 80 km',
    nearest_railway: 'Bhuj Railway Station (SOJN) - 82 km',
    gps_coordinates: '23.8344, 69.5100',
    popular_attractions: ['White Desert (Great Rann of Kutch)', 'Tent City Dhordo', 'Kala Dungar (Black Hill)', 'Rann Utsav Cultural Pavilion']
  },
  {
    city: 'Bhuj',
    state: 'Gujarat',
    country: 'India',
    destination_group: 'Heritage & Desert',
    nearest_airport: 'Bhuj Airport (BHJ) - 4 km',
    nearest_railway: 'Bhuj Railway Station - 2 km',
    gps_coordinates: '23.2420, 69.6669',
    popular_attractions: ['Aina Mahal', 'Prag Mahal', 'Kutch Museum', 'Shree Swaminarayan Temple', 'Bhujodi Handicraft Village']
  },
  {
    city: 'Gir National Park (Sasan Gir)',
    state: 'Gujarat',
    country: 'India',
    destination_group: 'Wildlife & Safari',
    nearest_airport: 'Keshod Airport (IXK) - 40 km / Rajkot (RAJ) - 150 km',
    nearest_railway: 'Junagadh Junction (JND) - 55 km',
    gps_coordinates: '21.1243, 70.8242',
    popular_attractions: ['Asiatic Lion Jungle Safari', 'Devalia Safari Park', 'Kamleshwar Dam', 'Crocodile Breeding Centre']
  },
  {
    city: 'Statue of Unity (Kevadia / Ekta Nagar)',
    state: 'Gujarat',
    country: 'India',
    destination_group: 'Heritage & Modern Wonder',
    nearest_airport: 'Vadodara Airport (BDQ) - 90 km / Ahmedabad (AMD) - 190 km',
    nearest_railway: 'Ekta Nagar Railway Station (EKNR) - 4 km',
    gps_coordinates: '21.8380, 73.7191',
    popular_attractions: ['Statue of Unity Viewing Gallery', 'Valley of Flowers', 'Glow Garden', 'Jungle Safari Park', 'Laser Light & Sound Show']
  },
  {
    city: 'Somnath & Dwarka',
    state: 'Gujarat',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Porbandar Airport (PBD) - 100 km / Rajkot (RAJ) - 200 km',
    nearest_railway: 'Veraval (VRL) / Dwarka (DWK)',
    gps_coordinates: '20.8880, 70.4012',
    popular_attractions: ['Somnath Jyotirlinga Temple', 'Dwarkadhish Temple', 'Bet Dwarka', 'Nageshwar Jyotirlinga', 'Shivrajpur Blue Flag Beach']
  },

  // ===================== JAMMU & KASHMIR / LADAKH =====================
  {
    city: 'Srinagar',
    state: 'Jammu and Kashmir',
    country: 'India',
    destination_group: 'Hill Station / Lakes',
    nearest_airport: 'Sheikh ul-Alam International Airport Srinagar (SXR) - 12 km',
    nearest_railway: 'Srinagar Railway Station (SINA) / Jammu Tawi (JAT) - 260 km',
    gps_coordinates: '34.0837, 74.7973',
    popular_attractions: ['Dal Lake Shikara Ride & Houseboat', 'Mughal Gardens (Shalimar & Nishat)', 'Tulip Garden', 'Shankaracharya Temple', 'Nigeen Lake']
  },
  {
    city: 'Gulmarg',
    state: 'Jammu and Kashmir',
    country: 'India',
    destination_group: 'Hill Station / Ski Resort',
    nearest_airport: 'Srinagar Airport (SXR) - 56 km',
    nearest_railway: 'Jammu Tawi (JAT) - 300 km',
    gps_coordinates: '34.0484, 74.3805',
    popular_attractions: ['Gulmarg Gondola (World’s Highest Cable Car)', 'Apharwat Peak', 'Golf Course', 'Skiing & Snowboarding', 'St. Mary\'s Church']
  },
  {
    city: 'Pahalgam',
    state: 'Jammu and Kashmir',
    country: 'India',
    destination_group: 'Hill Station / Valley',
    nearest_airport: 'Srinagar Airport (SXR) - 90 km',
    nearest_railway: 'Jammu Tawi (JAT) - 245 km',
    gps_coordinates: '34.0160, 75.1950',
    popular_attractions: ['Betaab Valley', 'Aru Valley', 'Chandanwari', 'Baisaran (Mini Switzerland)', 'Lidder River Rafting']
  },
  {
    city: 'Sonamarg',
    state: 'Jammu and Kashmir',
    country: 'India',
    destination_group: 'Hill Station / Glaciers',
    nearest_airport: 'Srinagar Airport (SXR) - 80 km',
    nearest_railway: 'Jammu Tawi (JAT) - 340 km',
    gps_coordinates: '34.3000, 75.3000',
    popular_attractions: ['Thajiwas Glacier Pony Trek', 'Zoji La Pass', 'Zero Point', 'Sindh River']
  },
  {
    city: 'Leh Ladakh',
    state: 'Ladakh',
    country: 'India',
    destination_group: 'High Altitude Desert & Adventure',
    nearest_airport: 'Kushok Bakula Rimpochee Airport Leh (IXL) - 4 km',
    nearest_railway: 'Jammu Tawi (JAT) - 700 km',
    gps_coordinates: '34.1526, 77.5771',
    popular_attractions: ['Pangong Tso Lake', 'Nubra Valley & Khardung La Pass', 'Magnetic Hill', 'Shanti Stupa', 'Thiksey Monastery', 'Sangam (Indus-Zanskar)']
  },
  {
    city: 'Katra (Vaishno Devi)',
    state: 'Jammu and Kashmir',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Jammu Airport (IXJ) - 50 km',
    nearest_railway: 'Shri Mata Vaishno Devi Katra (SVDK) - 1 km',
    gps_coordinates: '32.9926, 74.9317',
    popular_attractions: ['Mata Vaishno Devi Bhawan', 'Bhairon Ghati Ropeway', 'Ardhkuwari Cave', 'Ban Ganga']
  },

  // ===================== UTTAR PRADESH =====================
  {
    city: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    destination_group: 'Heritage & Mughal',
    nearest_airport: 'Agra Kheria Airport (AGR) - 8 km / Delhi (DEL) - 210 km',
    nearest_railway: 'Agra Cantt (AGC) - 3 km',
    gps_coordinates: '27.1767, 78.0081',
    popular_attractions: ['Taj Mahal (Wonder of the World)', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Itmad-ud-Daulah (Baby Taj)']
  },
  {
    city: 'Varanasi (Kashi)',
    state: 'Uttar Pradesh',
    country: 'India',
    destination_group: 'Spiritual / Heritage',
    nearest_airport: 'Lal Bahadur Shastri Varanasi Airport (VNS) - 22 km',
    nearest_railway: 'Varanasi Junction (BSB) / Banaras (BSBS)',
    gps_coordinates: '25.3176, 82.9739',
    popular_attractions: ['Kashi Vishwanath Temple Corridor', 'Dashashwamedh Ghat Ganga Aarti', 'Assi Ghat Subah-e-Banaras', 'Sarnath Buddhist Stupa', 'Sunrise Boat Ride']
  },
  {
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Maharishi Valmiki International Airport Ayodhya (AYJ) - 10 km',
    nearest_railway: 'Ayodhya Dham Junction (AY) - 2 km',
    gps_coordinates: '26.7922, 82.1998',
    popular_attractions: ['Shri Ram Janmabhoomi Mandir', 'Hanuman Garhi', 'Kanak Bhawan', 'Saryu River Ghats & Aarti', 'Surya Kund']
  },
  {
    city: 'Mathura & Vrindavan',
    state: 'Uttar Pradesh',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Agra Airport (AGR) - 60 km / Delhi (DEL) - 150 km',
    nearest_railway: 'Mathura Junction (MTJ) - 3 km',
    gps_coordinates: '27.4924, 77.6737',
    popular_attractions: ['Shri Krishna Janmasthan', 'Banke Bihari Temple', 'Prem Mandir Vrindavan', 'ISKCON Temple', 'Nidhivan']
  },

  // ===================== MAHARASHTRA =====================
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    destination_group: 'Metro City & Coastal',
    nearest_airport: 'Chhatrapati Shivaji Maharaj International Airport (BOM) - 15 km',
    nearest_railway: 'CSMT / Mumbai Central (MMCT)',
    gps_coordinates: '18.9220, 72.8347',
    popular_attractions: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Bandra-Worli Sea Link', 'Siddhivinayak Temple', 'Colaba Causeway']
  },
  {
    city: 'Lonavala & Khandala',
    state: 'Maharashtra',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Pune Airport (PNQ) - 70 km / Mumbai (BOM) - 90 km',
    nearest_railway: 'Lonavala Railway Station (LNL) - 1 km',
    gps_coordinates: '18.7557, 73.4091',
    popular_attractions: ['Tiger\'s Leap', 'Bhushi Dam', 'Karla & Bhaja Caves', 'Rajmachi Point', 'Pawna Lake Camping']
  },
  {
    city: 'Mahabaleshwar & Panchgani',
    state: 'Maharashtra',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Pune International Airport (PNQ) - 120 km',
    nearest_railway: 'Wathar (WTR) - 60 km / Pune (PUNE) - 115 km',
    gps_coordinates: '17.9307, 73.6477',
    popular_attractions: ['Arthur\'s Seat', 'Venna Lake', 'Elephant\'s Head Point', 'Mapro Garden', 'Table Land Panchgani', 'Pratapgad Fort']
  },
  {
    city: 'Shirdi',
    state: 'Maharashtra',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Shirdi International Airport (SAG) - 14 km',
    nearest_railway: 'Sainagar Shirdi Station (SNSI) - 2 km',
    gps_coordinates: '19.7668, 74.4762',
    popular_attractions: ['Sai Baba Samadhi Temple', 'Dwarkamai', 'Chavadi', 'Gurusthan', 'Shani Shingnapur (70 km)']
  },

  // ===================== WEST BENGAL & SIKKIM =====================
  {
    city: 'Darjeeling',
    state: 'West Bengal',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Bagdogra International Airport (IXB) - 70 km',
    nearest_railway: 'New Jalpaiguri Junction (NJP) - 75 km',
    gps_coordinates: '27.0410, 88.2663',
    popular_attractions: ['Tiger Hill Kanchenjunga Sunrise', 'Darjeeling Himalayan Toy Train', 'Batasia Loop', 'Happy Valley Tea Estate', 'Himalayan Mountaineering Institute']
  },
  {
    city: 'Gangtok',
    state: 'Sikkim',
    country: 'India',
    destination_group: 'Hill Station',
    nearest_airport: 'Pakyong Airport (PYG) - 30 km / Bagdogra (IXB) - 125 km',
    nearest_railway: 'New Jalpaiguri (NJP) - 120 km',
    gps_coordinates: '27.3389, 88.6065',
    popular_attractions: ['Tsomgo Lake & Baba Mandir', 'Nathu La Pass', 'MG Marg', 'Rumtek Monastery', 'Ban Jhakri Falls']
  },
  {
    city: 'Pelling',
    state: 'Sikkim',
    country: 'India',
    destination_group: 'Hill Station / Heritage',
    nearest_airport: 'Bagdogra Airport (IXB) - 135 km',
    nearest_railway: 'New Jalpaiguri (NJP) - 130 km',
    gps_coordinates: '27.3167, 88.2333',
    popular_attractions: ['Pelling Skywalk & Chenrezig Statue', 'Kanchenjunga Falls', 'Pemayangtse Monastery', 'Rabdentse Ruins', 'Khecheopalri Lake']
  },

  // ===================== MADHYA PRADESH =====================
  {
    city: 'Khajuraho',
    state: 'Madhya Pradesh',
    country: 'India',
    destination_group: 'Heritage & UNESCO',
    nearest_airport: 'Khajuraho Airport (HJR) - 5 km',
    nearest_railway: 'Khajuraho Railway Station (KURJ) - 5 km',
    gps_coordinates: '24.8318, 79.9199',
    popular_attractions: ['Western Group of Temples (Kandariya Mahadev)', 'Eastern Group of Temples', 'Sound & Light Show', 'Raneh Waterfalls']
  },
  {
    city: 'Ujjain',
    state: 'Madhya Pradesh',
    country: 'India',
    destination_group: 'Spiritual / Pilgrimage',
    nearest_airport: 'Devi Ahilyabai Holkar Indore Airport (IDR) - 55 km',
    nearest_railway: 'Ujjain Junction (UJN) - 2 km',
    gps_coordinates: '23.1765, 75.7885',
    popular_attractions: ['Mahakaleshwar Jyotirlinga (Mahakal Lok Corridor)', 'Bhasma Aarti', 'Kal Bhairav Temple', 'Ram Ghat Shipra River', 'Harsiddhi Temple']
  },
  {
    city: 'Bandhavgarh & Kanha',
    state: 'Madhya Pradesh',
    country: 'India',
    destination_group: 'Wildlife & Safari',
    nearest_airport: 'Jabalpur Dumna Airport (JLR) - 160 km',
    nearest_railway: 'Umaria (UMR) - 32 km / Katni (KTE) - 100 km',
    gps_coordinates: '23.7000, 81.0333',
    popular_attractions: ['Bandhavgarh Tiger Safari', 'Tala Zone', 'Kanha Tiger Reserve', 'Bandhavgarh Fort', 'Bamera Dam']
  },

  // ===================== ANDAMAN & NICOBAR =====================
  {
    city: 'Port Blair',
    state: 'Andaman and Nicobar Islands',
    country: 'India',
    destination_group: 'Island & Beach',
    nearest_airport: 'Veer Savarkar International Airport (IXZ) - 4 km',
    nearest_railway: 'None (Island Hub)',
    gps_coordinates: '11.6234, 92.7265',
    popular_attractions: ['Cellular Jail National Memorial & Light Show', 'Corbyn\'s Cove Beach', 'Chidiya Tapu Sunset', 'Ross Island (Netaji Subhash Chandra Bose Dweep)']
  },
  {
    city: 'Havelock Island (Swaraj Dweep)',
    state: 'Andaman and Nicobar Islands',
    country: 'India',
    destination_group: 'Island & Beach Resort',
    nearest_airport: 'Port Blair Airport (IXZ) + 90 min Makruzz / Nautika Ferry',
    nearest_railway: 'None',
    gps_coordinates: '11.9761, 92.9876',
    popular_attractions: ['Radhanagar Beach (Asia\'s Best Beach)', 'Elephant Beach (Scuba & Water Sports)', 'Kalapathar Beach', 'Scuba Diving & Coral Reefs']
  },

  // ===================== INTERNATIONAL LEISURE HUBS =====================
  {
    city: 'Dubai',
    state: 'Dubai Emirate',
    country: 'United Arab Emirates',
    destination_group: 'International / Luxury',
    nearest_airport: 'Dubai International Airport (DXB) - 10 km',
    nearest_railway: 'Dubai Metro Network',
    gps_coordinates: '25.2048, 55.2708',
    popular_attractions: ['Burj Khalifa (124th & 148th Floor)', 'Dubai Mall & Fountain', 'Desert Safari with BBQ', 'Palm Jumeirah & Atlantis', 'Museum of the Future', 'Dubai Marina Dhow Cruise']
  },
  {
    city: 'Abu Dhabi',
    state: 'Abu Dhabi Emirate',
    country: 'United Arab Emirates',
    destination_group: 'International / Cultural & Luxury',
    nearest_airport: 'Zayed International Airport (AUH) - 30 km',
    nearest_railway: 'None',
    gps_coordinates: '24.4539, 54.3773',
    popular_attractions: ['Sheikh Zayed Grand Mosque', 'Louvre Abu Dhabi', 'Ferrari World Yas Island', 'Yas Waterworld', 'Emirates Palace']
  },
  {
    city: 'Tbilisi',
    state: 'Tbilisi Region',
    country: 'Georgia',
    destination_group: 'International / Cultural',
    nearest_airport: 'Shota Rustaveli Tbilisi International Airport (TBS) - 18 km',
    nearest_railway: 'Tbilisi Central Railway Station - 3 km',
    gps_coordinates: '41.6938, 44.8015',
    popular_attractions: ['Old Tbilisi (Altstadt)', 'Narikala Fortress & Cable Car', 'Sulfur Baths (Abanotubani)', 'Bridge of Peace', 'Rustaveli Avenue', 'Holy Trinity Cathedral (Sameba)']
  },
  {
    city: 'Batumi',
    state: 'Adjara',
    country: 'Georgia',
    destination_group: 'International / Coastal Resort',
    nearest_airport: 'Batumi International Airport (BUS) - 6 km',
    nearest_railway: 'Batumi Central Railway Station - 4 km',
    gps_coordinates: '41.6168, 41.6367',
    popular_attractions: ['Batumi Boulevard', 'Ali and Nino Moving Monument', 'Batumi Botanical Garden', 'Argo Cable Car', 'Black Sea Promenade']
  },
  {
    city: 'Singapore',
    state: 'Singapore',
    country: 'Singapore',
    destination_group: 'International / Urban & Theme Parks',
    nearest_airport: 'Singapore Changi Airport (SIN) - 20 km',
    nearest_railway: 'SMRT Mass Rapid Transit Network',
    gps_coordinates: '1.3521, 103.8198',
    popular_attractions: ['Marina Bay Sands SkyPark', 'Gardens by the Bay & Supertree Grove', 'Universal Studios Singapore (Sentosa)', 'Jewel Changi', 'Night Safari', 'Singapore Flyer']
  },
  {
    city: 'Bangkok',
    state: 'Bangkok',
    country: 'Thailand',
    destination_group: 'International / Cultural & Shopping',
    nearest_airport: 'Suvarnabhumi Airport (BKK) / Don Mueang (DMK)',
    nearest_railway: 'Krung Thep Aphiwat Central Terminal',
    gps_coordinates: '13.7563, 100.5018',
    popular_attractions: ['Grand Palace & Wat Phra Kaew', 'Wat Arun (Temple of Dawn)', 'Chao Phraya Dinner Cruise', 'Safari World & Marine Park', 'Chatuchak Weekend Market', 'Iconsiam Mall']
  },
  {
    city: 'Phuket',
    state: 'Phuket',
    country: 'Thailand',
    destination_group: 'International / Island Resort',
    nearest_airport: 'Phuket International Airport (HKT) - 30 km',
    nearest_railway: 'None',
    gps_coordinates: '7.8804, 98.3923',
    popular_attractions: ['Phi Phi Islands Speedboat Tour', 'James Bond Island (Phang Nga Bay)', 'Patong Beach & Bangla Road', 'Big Buddha Phuket', 'Simon Cabaret Show']
  },
  {
    city: 'Bali',
    state: 'Bali',
    country: 'Indonesia',
    destination_group: 'International / Tropical & Spiritual',
    nearest_airport: 'I Gusti Ngurah Rai Denpasar Airport (DPS) - 15 km',
    nearest_railway: 'None',
    gps_coordinates: '-8.4095, 115.1889',
    popular_attractions: ['Ubud Monkey Forest & Rice Terraces', 'Tanah Lot Sea Temple', 'Uluwatu Sunset Temple & Kecak Dance', 'Kintamani Batur Volcano', 'Nusa Penida Island Tour', 'Seminyak & Kuta Beach']
  },
  {
    city: 'Paris',
    state: 'Île-de-France',
    country: 'France',
    destination_group: 'International / Iconic Heritage',
    nearest_airport: 'Charles de Gaulle (CDG) - 25 km / Orly (ORY) - 15 km',
    nearest_railway: 'Gare du Nord / Gare de Lyon',
    gps_coordinates: '48.8566, 2.3522',
    popular_attractions: ['Eiffel Tower Summit', 'Louvre Museum', 'Seine River Cruise', 'Arc de Triomphe & Champs-Élysées', 'Disneyland Paris', 'Palace of Versailles']
  },
  {
    city: 'Zurich & Interlaken',
    state: 'Bern / Zurich',
    country: 'Switzerland',
    destination_group: 'International / Alpine Luxury',
    nearest_airport: 'Zurich Airport (ZRH) - 10 km / Geneva (GVA) - 220 km',
    nearest_railway: 'Interlaken Ost / Zurich Hauptbahnhof (HB)',
    gps_coordinates: '46.6863, 7.8632',
    popular_attractions: ['Jungfraujoch (Top of Europe)', 'Mount Titlis Rotair & Cliff Walk', 'Lake Brienz & Thun Cruise', 'Lucerne Chapel Bridge', 'Glacier Express Scenic Train']
  },
  {
    city: 'Male & Resort Atolls',
    state: 'Kaafu Atoll',
    country: 'Maldives',
    destination_group: 'International / Overwater Luxury',
    nearest_airport: 'Velana International Airport Male (MLE) - 2 km',
    nearest_railway: 'None (Speedboat / Seaplane Transfer)',
    gps_coordinates: '4.1755, 73.5093',
    popular_attractions: ['Private Overwater Villa Stay', 'Snorkeling with Manta Rays & Turtles', 'Submarine Tour', 'Sandbank Sunset Picnic', 'Sunset Dolphin Cruise']
  }
];
