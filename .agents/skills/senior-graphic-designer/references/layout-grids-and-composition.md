# Layout Grids & Composition Guide

Composition is the deliberate choreography of visual attention. An elite layout guides the user's eye naturally from discovery to conversion without friction.

---

## 1. The 8-Point Spatial Grid System

All margins, paddings, line-heights, and component dimensions must be multiples of **8px** (with **4px** reserved for micro-spacers):

```text
Dimension  Scale        Common Usage
4px        Half unit    Icon-to-text gap, badge internal padding, border radiuses
8px        1 unit       Compact button padding, list item vertical spacing
16px       2 units      Card padding, form field vertical margins, icon sizes
24px       3 units      Gap between related cards, modal internal gutters
32px       4 units      Section margins, container padding on tablets
48px       6 units      Hero section margins, major block separation
64px       8 units      Page top padding, marketing feature breaks
```

### The Rule of Multiples:
When developers and designers align strictly to multiples of 8, every screen layout snaps into mathematical rhythm across any viewport scale (100%, 125%, 150%, 200%).

---

## 2. Visual Scanning Dynamics

1. **The Z-Pattern (Marketing & High-Level Discovery)**:
   - Path: Top-left (Logo/Brand) -> Top-right (Navigation/CTA) -> Diagonal sweep down to Hero Value Proposition -> Terminates at Primary Call to Action.
   - Ideal for: Landing pages, hero promotional sections, doctor recruitment banners.
2. **The F-Pattern (Information-Dense & Transactional)**:
   - Path: Top horizontal sweep (Global search, filters) -> Second horizontal sweep (Active tab, summary stats) -> Vertical scan down the left column (Appointment list, doctor cards).
   - Ideal for: Patient dashboards, booking slot selectors, analytics reports.

---

## 3. Gestalt Principles Applied to UI Design

- **Law of Proximity**: Related items must live closer together than unrelated items. (e.g., Doctor name and rating should have a 4px gap, but 24px separation from the next doctor card).
- **Law of Similarity**: Elements with the same visual weight, shape, and color are perceived as sharing a function.
- **Law of Common Region**: Enclosing related items within a card container or tinted background binds them into a single mental unit.
- **Figure-Ground Distinction**: Elevate active elements above the base canvas with blur backdrops (`backdrop-blur-md`) and layered ambient drop shadows.
