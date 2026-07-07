---
name: LvlUp Interface
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-base:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system focuses on a gamified self-improvement experience, targeting high-performers who track progress across multiple life domains. The brand personality is energetic, futuristic, and highly motivating. 

The aesthetic is a fusion of **Glassmorphism** and **Cyber-Minimalism**. By moving away from a single primary color to a multi-tonal spectrum, the interface uses color as a functional signifier for different life pillars. The UI should evoke a sense of digital "flow"—where soft glows and translucent layers make the user feel like they are interacting with a high-end command center for their life.

## Colors
The design system utilizes a "Domain-Driven" palette against a deep, dark canvas. The core background is a near-black neutral to allow vibrant accents and glass effects to pop.

- **Mind (Electric Blue):** Used for cognitive tasks, learning, and focus sessions.
- **Recovery (Soft Violet):** Used for sleep, meditation, and rest periods.
- **Discipline (Amber/Gold):** Used for habits, streaks, and physical training.
- **Capital (Emerald Green):** Used for finance, productivity metrics, and career growth.
- **Creative (Magenta):** Used for hobbies, ideation, and expression.

Each color should be paired with a corresponding "Glow" token—a 20% opacity version of the hex code used for background blurs and soft shadows.

## Typography
Plus Jakarta Sans is the exclusive typeface for the design system. Its modern, geometric curves complement the high roundedness of the UI components. 

Headlines should utilize a tighter letter-spacing to maintain a "tech-forward" feel. Body text remains spacious to ensure readability against dark backgrounds. Labels should almost always be uppercase with slight tracking to differentiate them from interactive body elements.

## Layout & Spacing
This design system employs a **Fluid Grid** model with a base-4 rhythm. Content is organized into cards that scale based on viewport width.

- **Mobile:** Single column with 16px side margins.
- **Tablet/Desktop:** 12-column grid. Components like "Stats Overview" span 3 columns, while "Main Feed" spans 6 or 9.
- **Spacing Logic:** Use larger gaps (32px+) between distinct life domains to prevent visual clutter, but tight internal spacing (8px) within domain-specific cards to keep data dense and actionable.

## Elevation & Depth
Elevation is achieved through **Glassmorphism** and **Tonal Layering** rather than traditional black shadows.

1.  **Base Layer:** Solid `#09090B`.
2.  **Card Layer:** Semi-transparent `#18181B` with a 1px border at 10% white opacity.
3.  **Active Layer:** Backdrop filter (blur: 12px) applied to surfaces, with a subtle "Domain Glow."
4.  **Glows:** High-priority elements use a `drop-shadow` with the domain color at 40% opacity and a 20px blur to create a neon-light effect that feels "leveled up."

## Shapes
The shape language is extremely organic and approachable. The design system uses "Pill-shaped" geometry for almost all interactive elements.

- **Primary Cards:** Use `rounded-xl` (1.5rem / 24px) to create a soft, container-like feel.
- **Buttons and Inputs:** Fully rounded (pill) to maximize the friendly, gamified aesthetic.
- **Visual Continuity:** Ensure that nested elements (like inner progress bars) also utilize high roundedness to match the outer container.

## Components
- **Domain Cards:** The centerpiece of the UI. Each card features a subtle top-border or inner glow matching the domain color (e.g., Mind Blue). Use backdrop-blur for the card body.
- **Action Buttons:** Large, pill-shaped buttons. Primary actions use a solid domain color with a white or high-contrast label. Secondary actions use an "Outline Glass" style—transparent fill with a 1px domain-colored border.
- **Progress Rings:** Use heavy stroke weights and rounded caps. The "empty" track should be a dark grey, while the "filled" track should glow with the domain's accent color.
- **Glass Inputs:** Background should be `rgba(255, 255, 255, 0.05)` with a 12px blur. On focus, the border should glow with the Mind (Electric Blue) color.
- **Chips:** Small, pill-shaped tags used for categorization. Use a low-opacity background of the domain color (15%) with a full-saturation text color.
- **Domain Switcher:** A floating navigation bar at the bottom of the screen using a heavy glass effect (blur: 20px) and high roundedness.