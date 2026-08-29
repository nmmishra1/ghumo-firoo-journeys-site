# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ba7a3dac-d19b-4e66-9178-030bb79a709c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ba7a3dac-d19b-4e66-9178-030bb79a709c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Brochure PDF Download (Unified Mode)

- Single optimized generator balances quality and performance.
- System font stacks (no webfont delays/CSP issues).
- Dynamic raster scale (1.5–2) with image readiness checks.
- Consistent final “Ready to Book?” contact page for all packages.
- Caching: in-memory + sessionStorage + IndexedDB; analytics event `brochure_perf`.

Backward compatibility:
- Older Fast/Rich options were removed from the UI.
- Legacy caches (v1/v2) are auto-migrated; new cache schema is `v3`.

Developer notes:
- Implementation: `src/components/packages/EnhancedBrochureDownload.tsx`
- To clear caches, clear sessionStorage and the IndexedDB database `BrochureCache`.

## Configuration

### Base URL

The application uses a centralized configuration for the base URL. This is defined in `src/config.ts`.

To update the base URL (e.g., when deploying to a new domain or environment), modify the `baseUrl` property in `src/config.ts`:

```typescript
// src/config.ts
export const config = {
  baseUrl: "https://ghumofiroo.com", // Update this value
  // ...
};
```

This value is used across the application for SEO (canonical URLs), Open Graph tags, and structured data (JSON-LD).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ba7a3dac-d19b-4e66-9178-030bb79a709c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
