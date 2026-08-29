# Ghumo Firoo Journeys - Backend API Service

Standalone PHP REST API & Database engine for Ghumo Firoo Journeys travel platform.

## 📁 Directory Structure
```
backend/
├── api/
│   ├── calculate_fare.php   # REST API for Rann Utsav Rate Card calculation engine
│   └── packages.php         # REST API for fetching package hotels & attractions
└── database/
    └── rann_utsav_hosting_setup.sql # Production MySQL database script
```

## 🚀 Deployment Instructions (cPanel / Apache / Nginx)

1. **Upload Files**: Upload the `backend/` directory to your web server (e.g. `public_html/api/` or sub-domain `api.ghumofiroo.com`).
2. **Database Import**: Import `database/rann_utsav_hosting_setup.sql` into phpMyAdmin.
3. **Database Credentials**: Update DB credentials in `api/packages.php` (`localhost`, `username`, `password`, `ghumofiroo_local`).
4. **CORS Headers**: Already configured with `Access-Control-Allow-Origin: *` for seamless communication with the React frontend.
