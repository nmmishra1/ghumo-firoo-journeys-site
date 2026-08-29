# GhumoFiroo Luxury Design System (Phase 1)

Welcome to the GhumoFiroo.com Premium Luxury Design System. This document serves as the single source of truth for design tokens, typography, shadows, animations, and reusable UI primitive components.

---

## 1. Design Tokens

### Color Palette
- **Primary (Deep Luxury Navy)**: `#0B1026` / `hsl(var(--primary))`
- **Secondary (Midnight Blue)**: `#1A2342` / `hsl(var(--secondary))`
- **Accent (Bespoke Warm Gold)**: `#C9A25A` / `hsl(var(--accent))`
- **Accent Light (Soft Gold)**: `#D8B97A`
- **Muted Gray**: `hsl(var(--muted-foreground))`
- **Overlay Dark**: `rgba(11, 16, 38, 0.4)` / `rgba(11, 16, 38, 0.65)`

### Typography
- **Headings (Refined Serif)**: `Playfair Display` (mapped to `font-serif`). Used for titles, hero banners, and premium section callouts.
- **Body & Actions (Clean Sans)**: `Inter` and `Poppins` (mapped to `font-sans`). Used for clean, legible text blocks.
- **Display & Labels (Geometric Sans)**: `Montserrat` (mapped to `font-display`). Used for uppercase subtitles, tags, and kicker badges.

### Spacing & Whitespace Scale
Generous margins and paddings for a spacious, luxury feel:
- `lux-xs`: `1.25rem` (20px)
- `lux-sm`: `2rem` (32px)
- `lux-md`: `3.5rem` (56px)
- `lux-lg`: `5.5rem` (88px)
- `lux-xl`: `8rem` (128px)
- `lux-2xl`: `12rem` (192px)

### Border-Radius Scale
- `rounded-luxury-sm`: `0.375rem` (6px)
- `rounded-luxury-md`: `0.75rem` (12px)
- `rounded-luxury-lg`: `1.25rem` (20px)
- `rounded-luxury-xl`: `2rem` (32px)

### Box Shadows & Elevation
- `shadow-luxury-sm`: Subtle gold border outline overlay shadow.
- `shadow-luxury-md`: Smooth golden premium card elevation.
- `shadow-luxury-lg`: Immersive hovering luxury highlight.
- `shadow-glass-sm`: Minimal translucent background shadow.
- `shadow-glass-md`: Full backdrop reflection blur shadow.

### Easing & Transition Timing
- Timing function: `ease-luxury-ease` -> `cubic-bezier(0.16, 1, 0.3, 1)` (out-expo)
- Timing function: `ease-luxury-in-out` -> `cubic-bezier(0.76, 0, 0.24, 1)`
- Durations: `duration-luxury-slow` (600ms), `duration-luxury-medium` (400ms), `duration-luxury-fast` (200ms)

---

## 2. Core Reusable Components

### Button
Located at: `src/components/ui/button.tsx`
- **Variants**: Includes `luxury` (solid gradient gold text) and `luxuryOutline` (thin gold border, solid transition on hover).
- **Usage**:
  ```tsx
  import { Button } from "@/components/ui/button"

  // Solid gold luxury button
  <Button variant="luxury">Book Journey</Button>

  // Gold outlined button
  <Button variant="luxuryOutline">Connect with Travel Expert</Button>
  ```

### Card
Located at: `src/components/ui/card.tsx`
- **Variants**: Includes `luxury` (subtle gold border + hover shadow scale) and `glass` (translucent backdrop blur support).
- **Usage**:
  ```tsx
  import { Card, CardContent } from "@/components/ui/card"

  // Glassmorphic Card
  <Card variant="glass">
    <CardContent className="p-6">Luxury content here</CardContent>
  </Card>
  ```

### Badge / Tag
Located at: `src/components/ui/badge.tsx`
- **Variants**: 
  - `luxury` (gold background, dark navy text)
  - `luxuryOutline` (transparent background, gold border)
  - `luxuryNavy` (navy background, thin gold border, white text)
- **Usage**:
  ```tsx
  import { Badge } from "@/components/ui/badge"

  <Badge variant="luxury">Helicopter</Badge>
  <Badge variant="luxuryOutline">Luxury</Badge>
  <Badge variant="luxuryNavy">Senior Citizen</Badge>
  ```

### Scroll Reveal Wrapper
Located at: `src/components/ui/ScrollReveal.tsx`
- **Props**:
  - `variant` (`fade-in` | `fade-in-up` | `fade-in-scale` | `slide-left` | `slide-right`)
  - `delay` (number in ms)
  - `duration` (`slow` | `medium` | `fast`)
- **Usage**:
  ```tsx
  import ScrollReveal from "@/components/ui/ScrollReveal"

  <ScrollReveal variant="fade-in-up" delay={200} duration="slow">
    <div>This content will animate elegantly on scroll</div>
  </ScrollReveal>
  ```

### Section Heading
Located at: `src/components/ui/SectionHeading.tsx`
- **Props**:
  - `kicker` (optional uppercase display gold text)
  - `title` (serif heading text)
  - `subtitle` (light explanation text)
  - `align` (`center` | `left` | `right`)
- **Usage**:
  ```tsx
  import { SectionHeading } from "@/components/ui/SectionHeading"

  <SectionHeading
    kicker="Bespoke Collection"
    title="Signature Indian Escapes"
    subtitle="Hand-crafted immersive travel itineraries featuring palace accommodations, private transfers, and dedicated concierge."
    align="center"
  />
  ```

### Navbar Shell
Located at: `src/components/common/NavbarShell.tsx`
- **Features**: Transparent-to-blur header transition on scroll, structural links, and embedded luxury action buttons. Responsive slide-in mobile drawer.
- **Usage**:
  ```tsx
  import { NavbarShell } from "@/components/common/NavbarShell"

  <NavbarShell logoText="GhumoFiroo" />
  ```

### Footer Shell
Located at: `src/components/common/FooterShell.tsx`
- **Features**: Features premium email newsletter box, resource links, and formal travel credentials (IATA / Ministry of Tourism indicators).
- **Usage**:
  ```tsx
  import { FooterShell } from "@/components/common/FooterShell"

  <FooterShell />
  ```

### FAQ Accordion
Located at: `src/components/ui/FAQAccordion.tsx`
- **Features**: Refined dropdown panels using Playfair display/Montserrat highlights and gold details.
- **Usage**:
  ```tsx
  import { FAQAccordion } from "@/components/ui/FAQAccordion"

  const faqItems = [
    { id: "1", question: "What is inclusive?", answer: "Palace rooms, private drivers..." }
  ];

  <FAQAccordion items={faqItems} variant="luxury" />
  ```

### Sticky CTA Bar
Located at: `src/components/common/StickyCTA.tsx`
- **Features**: Scrolls into view fixed at bottom screen. Shows package name, entry price details, wishlist toggle, and quick-enquire links.
- **Usage**:
  ```tsx
  import { StickyCTA } from "@/components/common/StickyCTA"

  <StickyCTA
    packageName="Royal Rajasthan Sojourn"
    priceText="₹1,85,000"
    onPrimaryClick={() => openEnquiryModal()}
  />
  ```

### Lazy Image
Located at: `src/components/ui/LazyImage.tsx`
- **Features**: IntersectionObserver-based deferred loading, smooth gold spin loader animation, and adaptive error fallback handler.
- **Usage**:
  ```tsx
  import LazyImage from "@/components/ui/LazyImage"

  <LazyImage
    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"
    alt="Premium Heritage Hotel Suite"
    className="aspect-[16/9] w-full object-cover"
  />
  ```
