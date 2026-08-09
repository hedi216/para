---
name: LOLA Botanique & Science
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#424843'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#727972'
  outline-variant: '#c2c8c1'
  surface-tint: '#44664f'
  primary: '#44664f'
  on-primary: '#ffffff'
  primary-container: '#8fb399'
  on-primary-container: '#254631'
  inverse-primary: '#aacfb4'
  secondary: '#625e55'
  on-secondary: '#ffffff'
  secondary-container: '#e8e2d6'
  on-secondary-container: '#68645b'
  tertiary: '#496455'
  on-tertiary: '#ffffff'
  tertiary-container: '#94b19f'
  on-tertiary-container: '#2a4436'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c6eccf'
  primary-fixed-dim: '#aacfb4'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#2d4e39'
  secondary-fixed: '#e8e2d6'
  secondary-fixed-dim: '#cbc6ba'
  on-secondary-fixed: '#1e1c14'
  on-secondary-fixed-variant: '#4a473e'
  tertiary-fixed: '#ccead6'
  tertiary-fixed-dim: '#b0cdbb'
  on-tertiary-fixed: '#062014'
  on-tertiary-fixed-variant: '#324c3e'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-tablet: 32px
  margin-mobile: 16px
---

## Brand & Style

The design system embodies a "Modern Mediterranean Apothecary" aesthetic. It balances the precision of clinical science with the warmth of high-end beauty. The brand personality is expert, nurturing, and sophisticated, targeting a clientele that values both efficacy and the sensory experience of skincare.

The visual style is a blend of **Minimalism** and **Modern Corporate**, utilizing generous whitespace to evoke a sense of "clean air" and professional sterility, while using organic tones to remain approachable. The interface should feel like a premium physical boutique: quiet, organized, and intentional.

- **E-commerce:** High-editorial feel with large imagery and elegant serif typography.
- **POS/Admin:** High-utility versions of the same aesthetic, prioritizing density and clarity without losing the premium materiality.

## Colors

The palette is derived from natural Mediterranean flora and apothecary materials. 

- **Primary (Sage):** Used for primary actions, success states, and brand signifiers. It represents health and natural growth.
- **Secondary (Sand):** Used for subtle backgrounds, secondary buttons, and section dividers to add warmth.
- **Tertiary (Forest):** Used primarily for typography and high-contrast UI elements to ensure legibility and a grounded, professional feel.
- **Background (Ivory):** The base for all customer-facing layouts, providing a softer experience than pure white.
- **Surface (White):** Reserved for elevated cards, input fields, and containers to create depth against the Ivory background.

## Typography

This design system uses a dual-font strategy to balance editorial elegance with functional clarity.

1.  **Libre Caslon Text (Headlines):** Used for marketing copy, product names in e-commerce, and page titles. Its classic proportions suggest heritage and expertise.
2.  **Manrope (UI/Body):** A modern, highly legible sans-serif used for all functional text, body copy, and data-heavy POS/Admin views.

**Usage Rules:**
- Titles should use "Sentence case" to feel modern and friendly.
- Labels (buttons, tabs, overlines) should use "UPPERCASE" with slight letter spacing for a structured, organized appearance.
- In the POS app, prioritize `body-md` and `label-sm` for maximum data density.

## Layout & Spacing

The system follows an 8px grid-based rhythm. 

- **E-commerce:** Uses a fluid grid with expansive margins (`margin-desktop`) to create a "boutique" feel. Content is often centered with significant vertical breathing room (section spacing of 80px-120px).
- **Admin/POS:** Uses a standard 12-column grid with reduced margins and tighter vertical spacing (section spacing of 24px-40px). 
- **Adaptation:** On mobile, components should stack vertically, and horizontal margins should shrink to 16px to maximize screen real estate for product images.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Soft Ambient Shadows**.

1.  **Base Layer:** The Ivory background (#FAF9F6).
2.  **Surface Layer:** Pure White cards (#FFFFFF) sit on the base.
3.  **Shadows:** Use extremely soft, blurred shadows with a slight Forest Green tint (e.g., `rgba(45, 71, 57, 0.08)`). Shadows should look like natural light hitting a matte physical surface, not a digital glow.
4.  **Interaction:** On hover, cards should lift slightly (increasing shadow spread) or gain a thin, 1px border in Sage to indicate focus.

## Shapes

The shape language is "Softly Geometric." 

- **Standard Radius:** 8px (roundedness level 2) for buttons, input fields, and small cards. This conveys modernism while remaining approachable.
- **Large Radius:** 16px (rounded-lg) for main container cards and featured product imagery.
- **Full Radius:** Pill shapes are reserved exclusively for status indicators (chips/tags) and the search bar in the e-commerce header.

## Components

### Buttons
- **Primary:** Solid Sage (#8FB399) with White text. High-contrast, 8px radius.
- **Secondary:** Transparent with a Forest Green border or solid Sand (#E8E2D6) with Forest Green text.
- **Ghost:** Forest Green text with no background, used for low-priority actions.

### Input Fields
- Background should be Pure White with a subtle Sand border. 
- On focus, the border transitions to Sage. 
- Labels sit above the field in `label-sm` (Forest Green).

### Cards
- **Product Card:** Pure White background, no border, soft shadow. Imagery should have an 8px corner radius.
- **Admin Widget:** Pure White background, 1px Sand border, no shadow (to keep the interface flat and fast).

### Chips & Tags
- Used for categories (e.g., "Skincare", "Organic").
- Background: Very light Sage (10% opacity) with Sage text. 
- Shape: Pill-shaped.

### Data Tables (Admin/POS)
- Clean, minimalist rows with 1px Sand bottom borders.
- Header row uses the Background Ivory color with `label-sm` Forest Green text.
- Alternate row striping is discouraged; use whitespace to separate data.