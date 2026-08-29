# Package Page Standards

## Overview

This document outlines the standardized components and patterns for package detail pages in the Ghumo Firoo Journeys website. The goal is to ensure consistency in UI, functionality (especially the "Book Now" flow), and code maintainability.

## Core Components

### 1. PackageSidebar (`src/components/packages/PackageSidebar.tsx`)

The `PackageSidebar` is the primary container for the booking/enquiry actions on the package detail page. It resides in the right-hand column on desktop and stacks responsibly on mobile.

**Usage:**

```tsx
import PackageSidebar from '@/components/packages/PackageSidebar';

// ... inside your component
<PackageSidebar 
  packageDetails={{
    title: packageDetails.title,
    duration: packageDetails.duration,
    price: `₹${packageDetails.price.toLocaleString()}`,
    rating: packageDetails.rating,
    reviews: packageDetails.reviews,
    highlights: packageDetails.highlights
  }}
  packageType="domestic" // or "international"
  destination="Destination Name"
  quickFacts={{
    groupSize: "2-15 People",
    bestTime: "Oct - Mar",
    difficulty: "Easy",
    ageLimit: "All Ages",
    accommodation: "Hotel/Resort",
    meals: "Breakfast",
    transport: "AC Vehicle"
  }}
/>
```

**Features:**
- Displays price, rating, and quick facts.
- **Integrates `PackageActionButtons` automatically.**
- Handles the "Book Now" and "Enquire Now" calls to action.
- Responsive design (sticky on desktop, standard flow on mobile).

### 2. PackageActionButtons (`src/components/packages/PackageActionButtons.tsx`)

This component encapsulates the logic for the "Book Now" and "Enquire Now" buttons. It is used internally by `PackageSidebar` but can be used standalone if necessary (though `PackageSidebar` is preferred).

**Key Functionality:**
- **Standardized "Book Now" Logic:** Generates a pre-filled WhatsApp message based on the package details.
- **Lead Generation:** Triggers `leadService.createLead` to capture user intent in the CRM.
- **Analytics:** Fires `pushEvent` for tracking "book_now_click" and "enquire_now_click".
- **Responsive & Accessible:** Uses semantic HTML buttons with proper labels and accessible focus states.

**Props:**

```typescript
interface PackageActionButtonsProps {
  packageTitle: string;
  price?: string;
  className?: string;
  variant?: 'default' | 'sidebar' | 'bottom-fixed';
}
```

## "Book Now" Flow Standardization

The "Book Now" button must always trigger the following sequence:
1.  **Lead Creation:** A lead is created in the backend with status 'new' and source 'website'.
2.  **Analytics:** A 'book_now_click' event is pushed to the data layer.
3.  **WhatsApp Redirection:** The user is redirected to WhatsApp with a pre-filled message:
    > "Hi, I am interested in booking the [Package Name] package starting at [Price]. Please share more details."

**Implementation Detail:**
This logic is centralized in `handleBookNow` within `PackageActionButtons.tsx`. Do not reimplement this logic in individual page files.

## Style Guide & Best Practices

- **Avoid Hardcoded Buttons:** Do not use `<Button>Book Now</Button>` directly in package pages. Use `PackageSidebar`.
- **Price Formatting:** Ensure prices are formatted as strings with currency symbols (e.g., `₹25,000`) when passing to `PackageSidebar`.
- **Responsive Layout:**
    - Use a grid layout: `grid grid-cols-1 lg:grid-cols-3 gap-12`.
    - Main content: `lg:col-span-2`.
    - Sidebar: `div` (default col span 1).
- **Accessibility:** Ensure all interactive elements are reachable via keyboard. `PackageActionButtons` handles this for the main actions.

## Migration Checklist

When creating a new package page or refactoring an old one:
- [ ] Import `PackageSidebar`.
- [ ] Remove any custom "Book Now" / "Enquire" forms or buttons.
- [ ] Pass correct `packageDetails` and `quickFacts` props.
- [ ] Verify the "Book Now" button opens WhatsApp with the correct message.
