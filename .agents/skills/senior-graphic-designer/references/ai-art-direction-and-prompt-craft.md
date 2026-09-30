# AI Art Direction & Prompt Craft Guide

Creating gallery-grade, commercially viable imagery using the `generate_image` tool requires art-directing every visual dimension rather than hoping for a good outcome.

---

## 1. The 6-Layer Master Prompt Formula

A master prompt is structured deliberately:

```
[Layer 1: Focal Subject & Action]
+ [Layer 2: Style & Medium]
+ [Layer 3: Lighting & Atmosphere]
+ [Layer 4: Curated Color Palette]
+ [Layer 5: Camera Angle, Framing & Optics]
+ [Layer 6: Production Finish & Details]
```

### Layer Breakdown

1. **Subject & Action**:
   - *Weak*: "A doctor talking to a patient"
   - *Master*: "A serene, empathetic specialist physician reviewing a holographic medical diagnostic tablet with a patient in a sunlit modern clinical consultation suite"
2. **Style & Medium**:
   - *3D / Digital Render*: "3D isometric clay render with smooth matte surfaces", "hyper-detailed octane render", "frosted translucent glassmorphism with acrylic refraction"
   - *Photography*: "Editorial studio commercial photography", "high-fashion clean editorial still", "architectural interior photograph"
   - *Vector / Flat*: "Precision geometric vector illustration", "minimalist dual-tone flat graphic", "contemporary risograph art"
3. **Lighting & Atmosphere**:
   - *Softbox / Studio*: "Diffused volumetric softbox key lighting, gentle rim light defining silhouettes, warm subtle ambient fill"
   - *Natural*: "Late morning sunbeams streaming through floor-to-ceiling glass, golden hour ambient bounce"
   - *Cinematic / Tech*: "High-tech bioluminescent cyan and deep violet edge lighting, low-key cinematic chiaroscuro"
4. **Curated Color Palette**:
   - State explicit tones: "palette of clean medical teal, soft slate white, and brushed champagne gold", "monochromatic graphite with electric cyan accents", "warm terracotta, sand, and cream neutrals"
5. **Camera & Optics**:
   - *Focal Length*: 85mm portrait lens (for people/avatars), 35mm street/lifestyle lens, 50mm documentary lens, or 45-degree orthographic isometric angle.
   - *Aperture / Depth*: "f/1.8 shallow depth of field with creamy bokeh background", "f/8 sharp edge-to-edge focus".
6. **Production Finish**:
   - "Ultra-crisp commercial product finish, 8k resolution textures, clean studio aesthetic, no blur, pristine craftsmanship".

---

## 2. Choosing the Proper Aspect Ratio

Always match the `AspectRatio` parameter in `generate_image` to the intended UI container:

| UI Placement | Recommended AspectRatio | Why |
| :--- | :--- | :--- |
| **Hero Banners & Headers** | `16:9` | Wide horizontal landscape view fitting wide desktop viewports. |
| **Feature Cards & Blog Previews** | `3:2` or `4:3` | Balanced proportions for cards, grids, and modal headers. |
| **Avatars, Badges & App Icons** | `1:1` | Symmetrical square frame, ideal for circular clipping. |
| **Mobile Stories / Vertical Panels** | `9:16` or `2:3` | Tall mobile screen canvas or side drawer banners. |

---

## 3. Style Presets for High-Converting Web & App Assets

### Preset A: High-Tech Healthcare & Medical 3D
> *"3D isometric render of a modern AI-powered medical diagnostic station with floating glowing holographic vital signs and a pristine digital stethoscope, frosted glass surfaces, soft matte ceramic finishes, clinical teal and clean white palette, soft ambient studio lighting, octane render, 8k"*

### Preset B: Editorial Human Healthcare Portrait
> *"Commercial editorial photography of a confident smiling female doctor wearing modern navy medical scrubs with a minimalist stethoscope, neutral minimalist clinic background with soft blurred greenery, natural morning window illumination, 85mm lens f/2.0 shallow depth of field, award-winning healthcare magazine cover aesthetic"*

### Preset C: Sleek Glassmorphism 3D Icon
> *"A 3D glassmorphic shield icon with a glowing green pulse heartbeat line inside, frosted acrylic texture with chromatic dispersion, floating on a dark navy canvas, soft cyan backlight and subtle neon rim lighting, raytraced reflection, ultra-premium app asset"*
