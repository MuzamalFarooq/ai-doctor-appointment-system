# Color Theory & Palette Systems Guide

Color is an immediate emotional catalyst. A Senior Designer never selects colors at random; every shade is calibrated for emotional resonance, visual balance, and WCAG accessibility standards.

---

## 1. The 60-30-10 Composition Rule

Visual harmony is achieved through strict proportional distribution:

- **60% Dominant Canvas (Neutral / Base)**:
  - Background surface, main page container, large structural whitespace.
  - Light mode: Pure `#FFFFFF`, slate `#F8FAFC`, or warm porcelain `#FAFAF9`.
  - Dark mode: Deep obsidian `#0B0F19`, charcoal `#0F172A`, or midnight `#090D16`.
- **30% Secondary Structure (Cards & Surfaces)**:
  - Sidebars, modal containers, cards, borders, input backgrounds, table headers.
  - Gives shape, contrast, and depth to the 60% base canvas.
- **10% High-Impact Accent (Focus / Action)**:
  - Primary call-to-action buttons, active tabs, vital badges, focus rings, key metric highlights.
  - High saturation or luminosity. Must stand out immediately without competing with other colors.

---

## 2. HSL Color Modeling & Mathematical Harmonies

Using the `hsl(hue, saturation%, lightness%)` color space allows for scientific palette generation:

### A. Analogous Harmony (Calm, Trust, Unity)
- Hues within 20°–30° on the color wheel.
- *Medical/Health*: Ocean Teal `hsl(175, 75%, 40%)` + Seafoam Mint `hsl(160, 65%, 45%)` + Deep Cyan `hsl(190, 70%, 35%)`.

### B. Complementary Harmony (Dynamism, High Conversion)
- Exactly 180° opposite on the color wheel.
- *Rule*: Keep the base color dominant and slightly muted; make the complement a punchy 10% accent.
- *Fintech / Urgent*: Navy Slate `hsl(220, 60%, 20%)` with Electric Tangerine `hsl(28, 95%, 52%)`.

### C. Split-Complementary (Sophisticated Balance)
- Base hue plus two hues flanking its exact complement (150° and 210°).
- Delivers strong contrast without the jarring clash of direct opposites.

---

## 3. Dark Mode Elevation & Luminance Curves

In dark mode, never make surfaces pitch black (`#000000`) unless designing for pure OLED energy saving. Use surface elevation layers:

```text
Elevation Level        Hex Code    Lightness (HSL)   Usage
Level 0 (Canvas)       #0A0F1D    L: 8%             Main page background
Level 1 (Panels)       #111827    L: 11%            Sidebar, base card surface
Level 2 (Active Cards) #1F2937    L: 14%            Floating cards, dropdowns, modals
Level 3 (Popovers)     #374151    L: 20%            Tooltips, hover states, active inputs
Level 4 (Dividers)     #4B5563    L: 30% (30% alpha)Borders, separator lines
```

---

## 4. Curated Premium Palettes

### Palette 1: MediConnect AI (Modern Healthcare & Clinical Precision)
- **Canvas Base (60%)**: `#F8FAFC` (Slate 50) / Dark: `#0B132B`
- **Surface (30%)**: `#FFFFFF` / Dark: `#1C2541`
- **Primary Teal Accent (10%)**: `#0D9488` (Teal 600) / Hover: `#0F766E`
- **Secondary Cyan**: `#0284C7` (Sky 600)
- **Life Pulse Coral**: `#F43F5E` (Rose 500)
- **Text Headings**: `#0F172A` / Body: `#334155` / Muted: `#64748B`

### Palette 2: Luxury Minimalist (Boutique & High-End)
- **Canvas Base**: `#FAF9F6` (Alabaster) / Dark: `#121212`
- **Surface**: `#FFFFFF` / Dark: `#1E1E1E`
- **Champagne Accent**: `#D4AF37` / Deep Bronze: `#8C7853`
- **Text Headings**: `#1A1A1A` / Body: `#4A4A4A`

---

## 5. Accessibility & Contrast Verification (WCAG 2.1)

- **Normal Text (< 18pt / 24px)**: Minimum contrast ratio **4.5:1** (AAA standard: **7:1**).
- **Large Text (≥ 18pt / 24px or ≥ 14pt bold)**: Minimum contrast ratio **3:1** (AAA standard: **4.5:1**).
- **Interactive UI Components & Icons**: Minimum contrast ratio **3:1** against adjacent background.
- *Check trick*: View the design in pure grayscale. If readability or hierarchy is lost in grayscale, the color contrast is inadequate.
