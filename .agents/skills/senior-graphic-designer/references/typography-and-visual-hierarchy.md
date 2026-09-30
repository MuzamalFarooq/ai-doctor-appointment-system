# Typography & Visual Hierarchy Guide

Typography accounts for over 90% of digital user interfaces and graphic assets. A Senior Graphic Designer pairs typefaces with precision and implements mathematical modular scales.

---

## 1. Modular Type Scales

Never select arbitrary font sizes. Use a geometric progression based on a 16px (1rem) root.

### The Major Third Scale (1.25x Ratio)

```text
Level           Calculation         Size         Line Height   Letter Spacing   Weight
Display / Hero  16px * 1.25^4      ~39px -> 40px  1.15         -0.03em (-1.2px) 700 / 800
H1 (Page Title) 16px * 1.25^3      ~31px -> 32px  1.20         -0.025em         700
H2 (Section)    16px * 1.25^2      ~25px -> 24px  1.25         -0.02em          600
H3 (Card/Group) 16px * 1.25^1      ~20px -> 20px  1.30         -0.015em         600
Body Base       16px * 1.25^0       16px         1.55-1.60     0 (normal)       400 / 500
Caption / Meta  16px * 1.25^-1     ~13px -> 13px  1.40         +0.01em          400 / 500
Micro Tag/Badge 16px * 1.25^-2     ~10px -> 11px  1.30         +0.04em (UPPER)  600
```

---

## 2. Senior Type Pairing Formulas

A design system should restrict itself to **two font families**:

1. **Modern Medical & High-Trust Tech**:
   - **Display / Headings**: *Plus Jakarta Sans* or *Outfit* (clean geometric curves, friendly authority).
   - **Body / Interface**: *Inter* or *system-ui* (neutral grotesque, ultra-legible at 12–14px).
2. **High-End Contemporary Brand**:
   - **Display**: *Cabinet Grotesk* or *Satoshi* (sculptural personality, high contrast).
   - **Body**: *Plus Jakarta Sans* or *General Sans*.
3. **Clinical / Analytical POS**:
   - **Display & Headings**: *Space Grotesk* or *Geist Sans*.
   - **Numerical Data & Codes**: *Geist Mono* or *JetBrains Mono* (monospaced alignment for timestamps, prices, and IDs).

---

## 3. Optical Rules & Micro-Typography

### Tracking (Letter Spacing) Rules
- **Large Headings**: As font size increases, letter spacing must become *tighter* (`-0.02em` to `-0.035em`) to prevent letters from drifting apart visually.
- **Micro-Caps / Small Badges**: At 10–12px uppercase text, letter spacing must be *expanded* (`+0.04em` to `+0.08em`) to preserve legibility.
- **Body Text**: Maintain natural font metrics (`0` or normal).

### Line Height (Leading) Mechanics
- Short, large titles need tight leading (`1.1` to `1.2`).
- Multi-line paragraph body text needs breathing room (`1.5` to `1.65`).
- Optimal line length (measure) for comfortable reading is **45 to 75 characters per line** (approx. 450px – 650px container width). Never stretch paragraphs across a 1200px widescreen.
