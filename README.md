# Ghumo Firoo Journeys — Official Website & Travel CRM

Welcome to the official repository for **Ghumo Firoo Journeys** (`https://ghumofiroo.com`).

- **Official Web Portal**: [https://ghumofiroo.com](https://ghumofiroo.com)
- **GitHub Repository**: [https://github.com/nmmishra1/ghumo-firoo-journeys-site](https://github.com/nmmishra1/ghumo-firoo-journeys-site)
- **WhatsApp Microservice**: [https://ghumofiroo-whatsapp-service.onrender.com](https://ghumofiroo-whatsapp-service.onrender.com/pair)

---

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Shadcn UI.
- **Prerendering & SEO**: `react-snap` static prerendering with automated `sitemap.xml` generation.
- **Backend API**: PHP 8 (MySQL PDO with parameterized queries, auth middleware, and PDF quote generator).
- **Automation Service**: Node.js 20 + `@whiskeysockets/baileys` microservice hosted on Render.com.
- **CI/CD Deployment**: Automated GitHub Actions FTP workflow to live cPanel host.

---

## Local Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Check TypeScript types**:
   ```bash
   npx tsc --noEmit
   ```

4. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## License & Copyright

© 2026 Ghumo Firoo Journeys. All rights reserved.
