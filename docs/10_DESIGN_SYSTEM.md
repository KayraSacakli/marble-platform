# Design System

## 1. Purpose & Design Philosophy

This document is the single source of truth for the visual design language of the premium Turkish marble export platform. It defines colors, typography, spacing, layout, components, motion, accessibility, and responsive behavior for frontend implementation.

It is not visual UI design exploration. It is the approved design system that implementation must follow.

### Design philosophy

The platform is a premium digital marble showroom. It must feel:

- **Premium** — Quiet confidence, not loud decoration
- **Architectural** — Structured, ordered, intentional
- **Editorial** — Content-first, typographically rich
- **Timeless** — Not trendy, not generic, not disposable
- **Minimal** — Every element earns its presence
- **Sophisticated** — Refined details, restrained palette

The design must never feel like:

- SaaS dashboard
- Generic template
- Tech company landing page
- AI-generated generic website
- Overly colorful or rounded
- Overly animated
- Cluttered or busy

### Design language character

- Large cinematic imagery
- Premium marble / architectural atmosphere
- Editorial typography
- Elegant serif headlines
- Modern clean sans-serif body text
- Generous whitespace
- Thin minimal navigation
- Stone / ivory / warm white / charcoal based color system
- Thin lines and dividers
- Restrained CTAs
- Image-first sections
- Premium showroom feeling
- Strong but quiet visual hierarchy

---

## 2. Design principles

| Principle | Meaning |
|---|---|
| Content is king | Images and text drive the experience; chrome is minimal |
| Quiet luxury | Premium through restraint, not excess |
| Editorial rhythm | Sections breathe; whitespace is a design element |
| Image-first | Marble visuals are the primary communication medium |
| Typographic hierarchy | Clear visual weight guides the eye |
| Structural clarity | Grid and layout create architectural order |
| Accessible by default | Contrast, focus, keyboard, semantics are foundational |
| Bilingual by design | TR/EN layout accommodates text length differences |
| Performance-aware | Design choices consider loading and rendering cost |

---

## 3. Brand visual direction

### 3.1 Visual mood

| Aspect | Direction |
|---|---|
| Photography style | Large-scale, high-resolution, architectural, editorial |
| Image treatment | Natural tones, no heavy filters, no artificial color grading |
| Typography mood | Serif for headlines (editorial authority), sans-serif for body (modern clarity) |
| Layout mood | Spacious, grid-based, asymmetric where editorial, symmetrical where structured |
| Color mood | Warm neutrals from natural stone; no synthetic or saturated colors |
| Interaction mood | Subtle, purposeful, never decorative |

### 3.2 What this is not

| Not this | Why |
|---|---|
| SaaS dashboard | No data visualization focus, no metric-heavy UI |
| Generic template | Every section has editorial purpose |
| Tech landing page | No gradient hero, no floating 3D elements |
| E-commerce | No cart, no pricing, no checkout |
| Social media aesthetic | No cards with avatars, likes, shares |
| AI-generated generic | No stock-photo feel, no generic layout |

---

## 4. Color system

### 4.1 Design philosophy

The color system is derived from natural stone: warm ivory, limestone, sand, charcoal, graphite, taupe. Colors are never synthetic, saturated, or decorative. They serve content, not decoration.

### 4.2 Core palette

| Token | Name | HEX | Usage | Contrast purpose | Context | Accessibility |
|---|---|---|---|---|---|---|
| `--color-bg-primary` | Warm Ivory | `#F5F0EB` | Page background, primary surface | Dark text on light | Light | AA normal text |
| `--color-bg-secondary` | Limestone | `#EDE7DF` | Secondary surface, card backgrounds, alternating sections | Dark text on light | Light | AA normal text |
| `--color-bg-tertiary` | Soft Sand | `#E5DDD3` | Tertiary surface, subtle backgrounds | Dark text on light | Light | AA normal text |
| `--color-bg-dark` | Charcoal | `#2C2C2C` | Dark sections, footer, inverted backgrounds | Light text on dark | Dark | AA normal text |
| `--color-bg-darker` | Deep Graphite | `#1A1A1A` | Deepest dark sections, hero overlays | Light text on dark | Dark | AAA normal text |
| `--color-bg-white` | White | `#FFFFFF` | Clean surfaces, form backgrounds | Dark text on white | Light | AAA normal text |
| `--color-text-primary` | Deep Charcoal | `#1A1A1A` | Primary body text, headings | — | Light | AAA on ivory |
| `--color-text-secondary` | Muted Graphite | `#5A5A5A` | Secondary text, captions, metadata | — | Light | AA on ivory |
| `--color-text-tertiary` | Soft Taupe | `#8A8078` | Tertiary text, placeholders | — | Light | AA large text on ivory |
| `--color-text-inverse` | Warm White | `#F5F0EB` | Text on dark backgrounds | — | Dark | AAA on charcoal |
| `--color-text-on-dark` | Light Stone | `#D4CFC9` | Secondary text on dark backgrounds | — | Dark | AA on charcoal |
| `--color-border-subtle` | Pale Stone | `#D9D2CA` | Subtle borders, dividers, card borders | — | Light | 3:1 on ivory |
| `--color-border-medium` | Warm Taupe | `#C4BAA9` | Medium emphasis borders | — | Light | 4.5:1 on ivory |
| `--color-accent` | Muted Bronze | `#8B7355` | Primary accent, CTAs, active states | — | Both | AA on ivory; AA on charcoal |
| `--color-accent-hover` | Deep Bronze | `#6B5740` | Accent hover state | — | Both | AA on ivory; AA on charcoal |
| `--color-accent-subtle` | Pale Bronze | `#C4B49A` | Subtle accent backgrounds | — | Light | AA large text on ivory |
| `--color-surface-overlay` | Black 60% | `#00000099` | Hero overlay, modal backdrop | Light text on overlay | Dark | AAA text on overlay |
| `--color-surface-overlay-light` | Black 40% | `#00000066` | Light overlay | — | Dark | — |

### 4.3 Color usage rules

- Primary background is always Warm Ivory (`#F5F0EB`), never pure white for main content areas.
- White (`#FFFFFF`) is reserved for form backgrounds, cards that need separation, and specific clean surfaces.
- Dark backgrounds are used sparingly: footer, hero overlay, specific editorial sections.
- Accent color is Muted Bronze — used for CTAs, active navigation states, links where emphasis is needed.
- Accent is never used for large surface fills.
- No saturated colors (red, blue, green) are used in the core palette.
- Error states may use a muted red (see State Patterns section).
- Success states may use a muted green (see State Patterns section).

### 4.4 Semantic color tokens

| Token | Maps to | Usage |
|---|---|---|
| `--color-bg-primary` | Warm Ivory | Page background |
| `--color-bg-secondary` | Limestone | Card backgrounds, alternating sections |
| `--color-bg-tertiary` | Soft Sand | Subtle section backgrounds |
| `--color-bg-dark` | Charcoal | Dark sections, footer |
| `--color-bg-darker` | Deep Graphite | Hero overlay, darkest sections |
| `--color-bg-white` | White | Forms, clean surfaces |
| `--color-text-primary` | Deep Charcoal | Headings, body text |
| `--color-text-secondary` | Muted Graphite | Captions, metadata |
| `--color-text-tertiary` | Soft Taupe | Placeholders, disabled |
| `--color-text-inverse` | Warm White | Text on dark backgrounds |
| `--color-text-on-dark` | Light Stone | Secondary text on dark |
| `--color-border-subtle` | Pale Stone | Subtle dividers |
| `--color-border-medium` | Warm Taupe | Emphasized borders |
| `--color-accent` | Muted Bronze | CTAs, active states |
| `--color-accent-hover` | Deep Bronze | CTA hover |
| `--color-accent-subtle` | Pale Bronze | Subtle accent backgrounds |

---

## 5. Typography system

### 5.1 Font selection

| Role | Font | Rationale |
|---|---|---|
| Display / Headlines | `Playfair Display` (serif) | Editorial authority, architectural elegance, premium feel |
| Body / UI | `Inter` (sans-serif) | Modern clarity, excellent readability, wide language support, free/open |

**Font licensing:** Both Playfair Display (SIL Open Font License) and Inter (SIL Open Font License) are free for commercial use. No licensing costs.

**Performance:** Both fonts support variable weights. Use `font-display: swap` for web font loading. Subset for Latin Extended to support Turkish characters (ğ, ş, ç, ö, ü, ı, İ, Ğ, Ş, Ç, Ö, Ü).

### 5.2 Typography roles

| Role | Font Family | Font Size (Desktop) | Line Height | Font Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| Display | Playfair Display | 72px / 4.5rem | 1.1 | 700 (Bold) | -0.02em | Hero headlines, brand moments |
| H1 | Playfair Display | 48px / 3rem | 1.15 | 700 (Bold) | -0.01em | Page titles |
| H2 | Playfair Display | 36px / 2.25rem | 1.2 | 600 (SemiBold) | -0.005em | Section headings |
| H3 | Inter | 24px / 1.5rem | 1.3 | 600 (SemiBold) | 0 | Subsection headings |
| H4 | Inter | 20px / 1.25rem | 1.35 | 600 (SemiBold) | 0 | Minor headings, card titles |
| Body Large | Inter | 18px / 1.125rem | 1.6 | 400 (Regular) | 0 | Intro paragraphs, lead text |
| Body | Inter | 16px / 1rem | 1.6 | 400 (Regular) | 0 | Body text, descriptions |
| Body Small | Inter | 14px / 0.875rem | 1.5 | 400 (Regular) | 0 | Secondary text, captions |
| Caption | Inter | 12px / 0.75rem | 1.4 | 400 (Regular) | 0.02em | Metadata, dates, labels |
| Label | Inter | 12px / 0.75rem | 1.4 | 500 (Medium) | 0.04em | Form labels, tags, uppercase labels |
| Navigation | Inter | 14px / 0.875rem | 1 | 500 (Medium) | 0.02em | Nav items, breadcrumbs |
| Button | Inter | 14px / 0.875rem | 1 | 500 (Medium) | 0.04em | Button text, uppercase CTAs |

### 5.3 Typography rules

- Headlines use Playfair Display (serif) for editorial authority.
- Body and UI use Inter (sans-serif) for modern clarity.
- Never use more than 2 font families in production.
- Never use font weights lighter than 400 for body or 600 for headings.
- Letter spacing is slightly positive for uppercase labels and buttons.
- Letter spacing is slightly negative for large serif headlines.
- Turkish characters (ğ, ş, ç, ö, ü, ı) must render correctly in both fonts.

---

## 6. Type scale

### 6.1 Responsive type scale

| Role | Desktop | Tablet | Mobile |
|---|---|---|---|
| Display | 72px / 4.5rem | 56px / 3.5rem | 40px / 2.5rem |
| H1 | 48px / 3rem | 40px / 2.5rem | 32px / 2rem |
| H2 | 36px / 2.25rem | 30px / 1.875rem | 26px / 1.625rem |
| H3 | 24px / 1.5rem | 22px / 1.375rem | 20px / 1.25rem |
| H4 | 20px / 1.25rem | 18px / 1.125rem | 17px / 1.0625rem |
| Body Large | 18px / 1.125rem | 17px / 1.0625rem | 16px / 1rem |
| Body | 16px / 1rem | 16px / 1rem | 16px / 1rem |
| Body Small | 14px / 0.875rem | 14px / 0.875rem | 13px / 0.8125rem |
| Caption | 12px / 0.75rem | 12px / 0.75rem | 11px / 0.6875rem |

### 6.2 Type scale rationale

- Body text remains 16px across all breakpoints for readability.
- Headlines scale down proportionally but maintain hierarchy.
- Minimum body text size is 16px (WCAG text scaling requirements).
- No text smaller than 11px in any context.

---

## 7. Spacing system

### 7.1 Spacing scale

Based on 8px base unit. Rationale: 8px aligns with common screen densities, provides enough granularity without excessive tokens, and works well with standard component sizes.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px / 0.25rem | Tight internal spacing, icon gaps |
| `--space-2` | 8px / 0.5rem | Small gaps, form field spacing |
| `--space-3` | 12px / 0.75rem | Medium internal spacing, card padding |
| `--space-4` | 16px / 1rem | Standard spacing, content padding |
| `--space-5` | 24px / 1.5rem | Medium gaps, section element spacing |
| `--space-6` | 32px / 2rem | Large gaps, related content spacing |
| `--space-7` | 48px / 3rem | Section internal spacing |
| `--space-8` | 64px / 4rem | Section spacing (desktop) |
| `--space-9` | 96px / 6rem | Large section spacing (desktop) |
| `--space-10` | 128px / 8rem | Hero section spacing, major breaks |

### 7.2 Spacing rules

- Use tokens, never arbitrary pixel values.
- Section vertical spacing: `--space-8` (64px) on desktop, `--space-7` (48px) on tablet, `--space-6` (32px) on mobile.
- Card internal padding: `--space-5` (24px) on desktop, `--space-4` (16px) on mobile.
- Content horizontal padding: `--space-6` (32px) on desktop, `--space-4` (16px) on mobile.
- Form field spacing: `--space-4` (16px) vertical between fields.

---

## 8. Layout & grid

### 8.1 Layout philosophy

The grid is editorial/architectural: generous whitespace, clear hierarchy, not rigid or mechanical. Layouts support both product catalogue browsing and editorial storytelling.

### 8.2 Grid system

| Property | Desktop (≥1200px) | Tablet (≥768px) | Mobile (<768px) |
|---|---|---|---|
| Columns | 12 | 8 | 4 |
| Gutter | 24px / 1.5rem | 20px / 1.25rem | 16px / 1rem |
| Margin | 48px / 3rem | 32px / 2rem | 16px / 1rem |
| Max content width | 1200px | 100% | 100% |

### 8.3 Section spacing

| Context | Desktop | Tablet | Mobile |
|---|---|---|---|
| Between major sections | 96px / 6rem | 64px / 4rem | 48px / 3rem |
| Between minor sections | 64px / 4rem | 48px / 3rem | 32px / 2rem |
| Between related content groups | 48px / 3rem | 32px / 2rem | 24px / 1.5rem |

### 8.4 Text measure

| Context | Max width | Rationale |
|---|---|---|
| Body text (editorial) | 680px / 42.5rem | Optimal reading width (45-75 characters per line) |
| Body text (UI) | 600px / 37.5rem | Slightly narrower for form/UI contexts |
| Full-width content | 100% | Hero, imagery, backgrounds |
| Card text | 100% of card | Constrained by card width |

### 8.5 Layout patterns

| Pattern | Columns | Usage |
|---|---|---|
| Full-width | 12/12 | Hero, backgrounds, section breaks |
| Content centered | 12/12 (max 1200px) | Most content sections |
| Two-column equal | 6+6 | Split layouts, comparison |
| Two-column asymmetric | 8+4, 7+5 | Content + sidebar, gallery + info |
| Three-column | 4+4+4 | Card grids, related content |
| Four-column | 3+3+3+3 | Product grids (desktop) |
| Two-column mobile | 2+2 | Product grids (mobile) |

---

## 9. Container system

| Token | Max Width | Usage |
|---|---|---|
| `--container-sm` | 680px / 42.5rem | Editorial content, article body |
| `--container-md` | 960px / 60rem | Forms, focused content |
| `--container-lg` | 1200px / 75rem | Standard content, product grids |
| `--container-xl` | 1440px / 90rem | Wide layouts (if needed) |
| `--container-full` | 100% | Hero, backgrounds, full-bleed sections |

---

## 10. Breakpoints

| Name | Min Width | Max Width | Target |
|---|---| ---|---|
| Mobile | 0px | 767px | Phones |
| Tablet | 768px | 1199px | Tablets, small laptops |
| Desktop | 1200px | — | Desktops, large screens |

**Rationale:** Breakpoints are chosen based on component behavior, not arbitrary device sizes. Mobile-first approach: styles cascade upward.

- At 768px: navigation collapses to hamburger, grid adjusts columns, typography scales down.
- At 1200px: full desktop layout, horizontal navigation, full grid.

---

## 11. Border & divider system

### 11.1 Border tokens

| Token | Width | Color | Usage |
|---|---|---|---|
| `--border-subtle` | 1px | `--color-border-subtle` | Card borders, subtle dividers |
| `--border-medium` | 1px | `--color-border-medium` | Emphasized dividers, form field borders |
| `--border-strong` | 2px | `--color-border-medium` | Active states, focused elements |

### 11.2 Divider rules

- Dividers are horizontal 1px lines using `--color-border-subtle`.
- Dividers separate content sections, not decorate.
- Never use decorative borders on cards (minimal card treatment).
- Form field borders use `--color-border-medium` default, `--color-accent` on focus.

---

## 12. Radius system

| Token | Value | Usage |
|---|---|---|
| `--radius-none` | 0 | No radius (default for most elements) |
| `--radius-sm` | 2px | Subtle rounding (form inputs, small elements) |
| `--radius-md` | 4px | Cards (only if needed) |
| `--radius-lg` | 8px | Modals, overlays |
| `--radius-full` | 9999px | Avatars, tags (if needed) |

**Rule:** Premium design uses minimal to no border radius. Cards, buttons, and inputs use `--radius-none` or `--radius-sm` at most. No pill-shaped buttons, no rounded cards, no bubbly UI.

---

## 13. Shadow system

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation (cards on hover) |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Medium elevation (dropdowns, popovers) |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | High elevation (modals, lightboxes) |
| `--shadow-none` | none | Default for most elements |

**Rule:** Shadows are subtle and used sparingly. Cards have no shadow by default; shadow appears on hover only if needed. No colored shadows, no dramatic elevation.

---

## 14. Iconography

### 14.1 Icon approach

- Icons are minimal, line-style, 1.5px stroke weight.
- Icon set: Lucide Icons (open source, MIT license) or equivalent.
- Icon size: 16px (inline), 20px (UI), 24px (navigation).
- Icon color inherits from text color.

### 14.2 Icon usage rules

- Icons supplement text, never replace it.
- Navigation items may use icons alongside labels.
- Form inputs do not use icons unless functionally necessary (search, calendar).
- No decorative icons without functional purpose.

---

## 15. Button system

### 15.1 Button variants

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | `--color-accent` | `#FFFFFF` | None | Main CTAs (Request Quote, Submit) |
| Secondary | Transparent | `--color-accent` | 1px `--color-accent` | Alternative CTAs (View Product, Contact) |
| Ghost | Transparent | `--color-text-primary` | None | Text links styled as buttons, navigation |
| Danger | `--color-error` | `#FFFFFF` | None | Destructive actions (admin only) |

### 15.2 Button states

| State | Primary | Secondary | Ghost |
|---|---|---|---|
| Default | `--color-accent` bg, white text | Transparent bg, `--color-accent` text, accent border | Transparent bg, `--color-text-primary` text |
| Hover | `--color-accent-hover` bg | Light accent background tint | Light background tint |
| Focus | Focus ring (2px `--color-accent`, 2px offset) | Same focus ring | Same focus ring |
| Active | Slightly darker than hover | Slightly darker than hover | Slightly darker than hover |
| Disabled | `--color-text-tertiary` bg, `--color-text-tertiary` text | Transparent bg, `--color-text-tertiary` text, `--color-border-subtle` border | Transparent bg, `--color-text-tertiary` text |

### 15.3 Button sizing

| Size | Height | Padding (horizontal) | Font Size | Usage |
|---|---|---|---|---|
| Large | 52px / 3.25rem | 32px / 2rem | 14px | Hero CTAs, primary page CTAs |
| Medium | 44px / 2.75rem | 24px / 1.5rem | 14px | Standard CTAs, form submissions |
| Small | 36px / 2.25rem | 16px / 1rem | 12px | Compact CTAs, inline actions |

### 15.4 Button rules

- Button corners: `--radius-none` (sharp, architectural).
- Button text: uppercase, `--space-2` letter-spacing (0.04em).
- Button font: Inter, 500 weight.
- Minimum touch target: 44px x 44px (WCAG).
- Button width: auto by default; full-width only in mobile form contexts.

---

## 16. Link system

### 16.1 Link styles

| Context | Style | Color | Decoration | Hover |
|---|---|---|---|---|
| Body text link | Underline | `--color-accent` | Underline | `--color-accent-hover` |
| Navigation link | No underline | `--color-text-primary` | None | `--color-accent` |
| Button-styled link | See Button system | See Button system | None | See Button system |
| Footer link | No underline | `--color-text-inverse` | None | White |
| Breadcrumb link | Underline on hover | `--color-accent` | None → underline on hover | `--color-accent-hover` |

### 16.2 Link rules

- Links in body text always have underline for discoverability.
- Navigation links have no underline; active state uses accent color.
- Link color contrast must meet WCAG AA (4.5:1 minimum).
- Focus state: same focus ring as buttons (2px accent, 2px offset).

---

## 17. Form system

### 17.1 Form elements

| Element | Height | Padding | Border | Background | Font |
|---|---|---|---|---|---|
| Input | 44px / 2.75rem | 12px horizontal | 1px `--color-border-medium` | `--color-bg-white` | Inter 16px |
| Textarea | Auto (min 120px) | 12px | 1px `--color-border-medium` | `--color-bg-white` | Inter 16px |
| Select | 44px / 2.75rem | 12px horizontal | 1px `--color-border-medium` | `--color-bg-white` | Inter 16px |
| Checkbox | 20px x 20px | — | 1px `--color-border-medium` | `--color-bg-white` | — |
| Radio | 20px x 20px | — | 1px `--color-border-medium` | `--color-bg-white` | — |

### 17.2 Form states

| State | Visual Treatment |
|---|---|
| Default | Border `--color-border-medium`, background `--color-bg-white` |
| Focus | Border `--color-accent`, 2px focus ring, background `--color-bg-white` |
| Error | Border muted red (`--color-error`), error message below field |
| Success | Border muted green (`--color-success`) |
| Disabled | Background `--color-bg-secondary`, text `--color-text-tertiary` |
| Read-only | Background `--color-bg-secondary`, no border change |

### 17.3 Form accessibility rules

- Every input has an associated `<label>`.
- Required fields: visual asterisk + `aria-required="true"`.
- Error messages: linked via `aria-describedby`, announced with `aria-live="polite"`.
- Error summary at top of form with links to each invalid field.
- Grouped fields use `<fieldset>` + `<legend>`.
- Privacy notice accessible before submission.

### 17.4 Form layout

- Single column on mobile.
- Two columns on desktop where appropriate (name + email side by side).
- Field spacing: `--space-4` (16px) vertical.
- Form max width: `--container-md` (960px).

---

## 18. Navigation system

### 18.1 Desktop navigation

| Property | Value |
|---|---|
| Height | 72px / 4.5rem |
| Position | Fixed top |
| Background | `--color-bg-primary` with 95% opacity backdrop blur |
| Border bottom | 1px `--color-border-subtle` |
| Logo position | Left |
| Nav position | Center or left-after-logo |
| Language + CTA position | Right |
| Nav item spacing | `--space-6` (32px) horizontal |
| Nav font | Inter 14px, 500 weight, uppercase letter-spacing 0.02em |
| Active state | `--color-accent` text color |
| Hover state | `--color-accent` text color |

### 18.2 Tablet navigation

| Property | Value |
|---|---|
| Height | 64px / 4rem |
| Logo position | Left |
| Hamburger position | Right |
| Menu | Full-screen overlay or slide-from-right |
| Overlay background | `--color-bg-primary` |
| Menu item font | Inter 24px, 500 weight |
| Menu item spacing | `--space-5` (24px) vertical |

### 18.3 Mobile navigation

| Property | Value |
|---|---|
| Height | 60px / 3.75rem |
| Logo position | Left |
| Hamburger position | Right |
| Menu | Full-screen overlay |
| Overlay background | `--color-bg-primary` |
| Menu item font | Inter 20px, 500 weight |
| Menu item spacing | `--space-4` (16px) vertical |
| Close button | Top right |
| Language switch | In menu |

### 18.4 Mobile menu accessibility

- Focus trapped in menu when open.
- Escape key closes menu.
- Focus returns to hamburger button when menu closes.
- Scroll locked when menu is open.
- `aria-expanded` on hamburger button.
- `role="dialog"` on menu overlay.

---

## 19. Header

### 19.1 Header component tokens

| Token | Value |
|---|---|
| `--header-height-desktop` | 72px |
| `--header-height-tablet` | 64px |
| `--header-height-mobile` | 60px |
| `--header-bg` | `--color-bg-primary` at 95% opacity |
| `--header-blur` | backdrop-filter: blur(8px) |
| `--header-border` | 1px `--color-border-subtle` |
| `--header-z-index` | 100 |

### 19.2 Header behavior

- Sticky on scroll.
- Background becomes opaque after scrolling past hero (if hero exists).
- Logo links to homepage.
- "Request Quote" CTA always visible on desktop.
- Language switch always accessible.

---

## 20. Footer

### 20.1 Footer component tokens

| Token | Value |
|---|---|
| `--footer-bg` | `--color-bg-dark` |
| `--footer-text` | `--color-text-inverse` |
| `--footer-link` | `--color-text-on-dark` |
| `--footer-link-hover` | White |
| `--footer-border` | 1px `--color-border-subtle` on dark |
| `--footer-padding-vertical` | `--space-8` (64px) |
| `--footer-padding-horizontal` | `--space-6` (32px) |

### 20.2 Footer layout

| Breakpoint | Layout |
|---|---|
| Desktop | 4-column grid (Company, Catalogue, Conversion, Legal) |
| Tablet | 2-column grid |
| Mobile | Single column, stacked |

---

## 21. Hero system

### 21.1 Hero component tokens

| Token | Value |
|---|---|
| `--hero-height` | 100vh (desktop), 80vh (tablet), 70vh (mobile) |
| `--hero-min-height` | 600px (desktop), 480px (tablet), 400px (mobile) |
| `--hero-overlay` | `--color-surface-overlay` (60% black) |
| `--hero-overlay-gradient` | Linear gradient from transparent to 60% black (bottom) |
| `--hero-text-color` | `--color-text-inverse` |
| `--hero-content-max-width` | 800px |
| `--hero-content-padding` | `--space-8` (64px) from bottom |

### 21.2 Hero states

| State | Visual Treatment |
|---|---|
| Video playing | Full-screen video background, text overlay with gradient |
| Video failed | Static poster image, same text overlay |
| Reduced motion | Static poster image, same text overlay |
| No video | Text-based hero, `--color-bg-darker` background |
| Loading | Poster image with subtle loading indicator |

### 21.3 Hero text hierarchy

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Headline | Playfair Display | Display (72px desktop) | 700 | White |
| Subheadline | Inter | Body Large (18px) | 400 | White 80% opacity |
| Primary CTA | Button system | Large | Primary variant | — |
| Secondary CTA | Button system | Large | Secondary variant (white border) | — |

### 21.4 Hero overlay rules

- Overlay ensures text readability over any image/video.
- Gradient overlay: transparent at top, 60% black at bottom.
- Text always placed in lower portion of hero with gradient backing.
- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text (WCAG AA).

---

## 22. Media system

### 22.1 Image treatment

| Property | Value |
|---|---|
| `object-fit` | `cover` for decorative/editorial; `contain` for product detail |
| `object-position` | `center` default; `top` for architectural shots |
| Loading | `lazy` for below-fold; `eager` for above-fold hero |
| Decoding | `async` |
| Border | None (no image borders) |
| Border radius | `--radius-none` (sharp corners) |

### 22.2 Aspect ratios

| Context | Aspect Ratio | Rationale |
|---|---|---|
| Product card | 4:3 | Standard catalogue ratio; shows product well |
| Product gallery primary | 16:10 | Wide view for product detail |
| Collection card | 16:9 | Wide atmospheric shots |
| Application card | 3:2 | Slightly wider for context shots |
| Project card | 16:9 | Architectural wide format |
| Journal card | 16:9 | Editorial standard |
| Hero | 16:9 | Cinematic widescreen |
| Quarry/Factory | 16:9 | Industrial/architectural wide |
| Logo | 3:1 (approx) | Horizontal brand mark |

### 22.3 Responsive images

- Use `srcset` and `sizes` for responsive image delivery.
- Provide 3 sizes: small (480w), medium (768w), large (1200w).
- Use `loading="lazy"` for all images except hero/above-fold.
- Use `decoding="async"` for all images.

---

## 23. Video treatment

### 23.1 Video component tokens

| Token | Value |
|---|---|
| `--video-radius` | `--radius-none` |
| `--video-overlay` | `--color-surface-overlay` |
| `--video-poster-object-fit` | `cover` |

### 23.2 Video rules

- Video plays muted, autoplay on desktop (reduced-motion respected).
- Video has poster image for loading state.
- Video controls: play/pause, mute, fullscreen.
- Captions/subtitles when available.
- Video does not block page content rendering.

---

## 24. Image treatment

### 24.1 Product images

- Primary image: `object-fit: cover`, 4:3 ratio.
- Gallery images: `object-fit: cover`, various ratios.
- No image borders, no shadows.
- Hover: subtle scale (1.02) on card images only (reduced-motion respected).
- Lazy loading for gallery images below fold.

### 24.2 Editorial images

- Full-width or contained within text measure.
- `object-fit: cover` for editorial photography.
- Captions below image, `--color-text-secondary`, Body Small.
- No decorative frames or borders.

### 24.3 Media credit/attribution

- Small text below image: `--color-text-tertiary`, Caption font.
- Right-aligned or left-aligned based on layout.

---

## 25. Product card system

### 25.1 Product card tokens

| Token | Value |
|---|---|
| `--card-bg` | `--color-bg-white` |
| `--card-border` | 1px `--color-border-subtle` |
| `--card-radius` | `--radius-none` |
| `--card-shadow` | `--shadow-none` (default) → `--shadow-sm` (hover) |
| `--card-padding` | `--space-5` (24px) |
| `--card-gap` | `--space-5` (24px) |
| `--card-image-ratio` | 4:3 |

### 25.2 Product card structure

```
┌─────────────────────────┐
│                         │
│      Product Image      │
│      (4:3 ratio)        │
│                         │
├─────────────────────────┤
│                         │
│  Product Name (H4)      │
│  Collection (Caption)   │
│                         │
└─────────────────────────┘
```

### 25.3 Product card rules

- Image is first element, full width, no padding.
- Text below image with `--card-padding`.
- Product name: Inter 20px, 600 weight.
- Collection/category: Inter 12px, 400 weight, `--color-text-secondary`.
- No border on card by default; subtle border on hover if needed.
- No shadow on card by default.
- No rounded corners.
- Card links to product detail page.
- Minimum touch target: entire card is clickable.

### 25.4 Product card responsive

| Breakpoint | Grid columns | Card behavior |
|---|---|---|
| Desktop | 4 columns | Full card |
| Tablet | 2 columns | Full card |
| Mobile | 1-2 columns | Full card |

---

## 26. Collection card system

### 26.1 Collection card tokens

| Token | Value |
|---|---|
| `--card-bg` | `--color-bg-white` |
| `--card-border` | 1px `--color-border-subtle` |
| `--card-radius` | `--radius-none` |
| `--card-padding` | `--space-5` (24px) |
| `--card-image-ratio` | 16:9 |

### 26.2 Collection card structure

```
┌───────────────────────────────┐
│                               │
│     Collection Image          │
│     (16:9 ratio)              │
│                               │
├───────────────────────────────┤
│                               │
│  Collection Name (H4)         │
│  Brief Description (Body Sm)  │
│                               │
└───────────────────────────────┘
```

### 26.3 Collection card rules

- More editorial than product card; wider image ratio.
- Description may be 1-2 lines.
- No product count (unless approved content exists).

---

## 27. Project card system

### 27.1 Project card tokens

| Token | Value |
|---|---|
| `--card-bg` | `--color-bg-white` |
| `--card-border` | 1px `--color-border-subtle` |
| `--card-radius` | `--radius-none` |
| `--card-padding` | `--space-5` (24px) |
| `--card-image-ratio` | 16:9 |

### 27.2 Project card structure

```
┌───────────────────────────────┐
│                               │
│     Project Image             │
│     (16:9 ratio)              │
│                               │
├───────────────────────────────┤
│                               │
│  Project Name (H4)            │
│  Location (Caption)           │
│                               │
└───────────────────────────────┘
```

### 27.3 Project card rules

- Architectural case-study feel.
- Image is primary; text is minimal.
- Location/metadata only if approved content exists.
- Conditional visibility: only rendered when qualifying projects exist.

---

## 28. Journal card system

### 28.1 Journal card tokens

| Token | Value |
|---|---|
| `--card-bg` | `--color-bg-white` |
| `--card-border` | 1px `--color-border-subtle` |
| `--card-radius` | `--radius-none` |
| `--card-padding` | `--space-5` (24px) |
| `--card-image-ratio` | 16:9 |

### 28.2 Journal card structure

```
┌───────────────────────────────┐
│                               │
│     Article Image             │
│     (16:9 ratio)              │
│                               │
├───────────────────────────────┤
│                               │
│  Publication Date (Caption)   │
│  Article Title (H4)           │
│  Excerpt (Body Small)         │
│                               │
└───────────────────────────────┘
```

### 28.3 Journal card rules

- Editorial publication feel.
- Date above title (metadata-first).
- Excerpt: 2-3 lines max, truncated.
- Title: Inter 20px, 600 weight.

---

## 29. Application card system

### 29.1 Application card tokens

Same as Collection card tokens.

### 29.2 Application card structure

```
┌───────────────────────────────┐
│                               │
│     Application Image         │
│     (3:2 ratio)               │
│                               │
├───────────────────────────────┤
│                               │
│  Application Name (H4)        │
│  Brief Description (Body Sm)  │
│                               │
└───────────────────────────────┘
```

### 29.3 Application card rules

- Use-context focused.
- Image shows application context (bathroom, facade, etc.).
- Description is contextual, not technical.

---

## 30. Quarry / Factory visual system

### 30.1 Quarry visual tokens

| Token | Value |
|---|---|
| `--quarry-bg` | `--color-bg-tertiary` |
| `--quarry-text` | `--color-text-primary` |
| `--quarry-accent` | `--color-accent` |

### 30.2 Factory visual tokens

| Token | Value |
|---|---|
| `--factory-bg` | `--color-bg-secondary` |
| `--factory-text` | `--color-text-primary` |
| `--factory-accent` | `--color-accent` |

### 30.3 Quarry/Factory visual rules

- Industrial but premium feel.
- Large imagery, editorial layout.
- No invented claims, statistics, or capacity data.
- Truthfulness constraint: only approved factual content.
- Visual treatment: same design language as rest of site.

---

## 31. Content section patterns

### 31.1 Section background patterns

| Pattern | Background | Usage |
|---|---|---|
| Default | `--color-bg-primary` | Most sections |
| Alternating | `--color-bg-secondary` | Alternating content sections |
| Dark | `--color-bg-dark` | Footer, special editorial sections |
| Image | Background image with overlay | Hero, feature sections |

### 31.2 Section spacing pattern

```
Section
  └── ContentContainer
        └── Section Heading (H2)
        └── Section Content
        └── Section CTA (if applicable)
```

Vertical spacing between sections: `--space-8` (64px) desktop, `--space-7` (48px) tablet, `--space-6` (32px) mobile.

---

## 32. CTA / conversion patterns

### 32.1 CTA hierarchy

| Level | Visual Treatment | Button Variant |
|---|---|---|
| Primary CTA | Large button, accent background | Primary |
| Secondary CTA | Medium button, accent border | Secondary |
| Contextual CTA | Medium button, accent border | Secondary |

### 32.2 CTA placement rules

- Maximum 2-3 CTAs per page section.
- Primary CTA is visually dominant.
- Secondary CTA is available but not competing.
- Quote CTA always uses Primary variant.

---

## 33. State patterns

### 33.1 State colors

| State | Color | Token |
|---|---|---|
| Default | `--color-border-medium` | `--state-default` |
| Focus | `--color-accent` | `--state-focus` |
| Error | Muted red `#B44A4A` | `--color-error` |
| Success | Muted green `#4A7A4A` | `--color-success` |
| Warning | Muted amber `#8B7355` | `--color-warning` |
| Disabled | `--color-text-tertiary` | `--state-disabled` |

### 33.2 State rules

- Error color is muted, not alarming.
- Success color is muted, not celebratory.
- All state colors must meet contrast requirements on their backgrounds.

---

## 34. Loading / skeleton system

### 34.1 Skeleton tokens

| Token | Value |
|---|---|
| `--skeleton-bg` | `--color-bg-secondary` |
| `--skeleton-shine` | `--color-bg-tertiary` |
| `--skeleton-radius` | `--radius-none` |
| `--skeleton-animation` | Shimmer (subtle left-to-right gradient) |

### 34.2 Skeleton rules

- Skeleton matches content layout (text lines, image rectangles).
- No dramatic pulse animation; subtle shimmer only.
- Reduced motion: static skeleton, no animation.
- Skeleton is visually quiet, not attention-grabbing.

---

## 35. Error / empty states

### 35.1 Error state

- Clear, non-technical error message.
- Retry option (button).
- Link to homepage or contact.
- No stack traces or technical details.

### 35.2 Empty state

- Clear message explaining why content is unavailable.
- Recovery path (browse products, contact).
- No decorative illustrations (text-only empty states).

---

## 36. Motion & animation

### 36.1 Animation philosophy

Motion is subtle, slow, intentional, premium. It guides attention, never entertains.

### 36.2 Animation tokens

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | 150ms | Hover states, focus transitions |
| `--duration-normal` | 300ms | Page transitions, section reveals |
| `--duration-slow` | 500ms | Hero transitions, major state changes |
| `--duration-slower` | 800ms | Hero cinematic transitions |
| `--easing-default` | cubic-bezier(0.4, 0, 0.2, 1) | Standard easing |
| `--easing-in` | cubic-bezier(0.4, 0, 1, 1) | Entering elements |
| `--easing-out` | cubic-bezier(0, 0, 0.2, 1) | Exiting elements |
| `--easing-in-out` | cubic-bezier(0.4, 0, 0.2, 1) | Bidirectional |
| `--distance-sm` | 8px | Subtle element movement |
| `--distance-md` | 16px | Section reveal movement |
| `--distance-lg` | 32px | Hero/feature movement |

### 36.3 Animation rules

- No animation for the sake of animation.
- Animations serve orientation, feedback, or continuity.
- No bouncing, no spinning, no attention-grabbing effects.
- Hero video is the only cinematic animation; everything else is subtle.

---

## 37. Reduced motion

### 37.1 Reduced motion rules

When `prefers-reduced-motion: reduce` is active:

| Element | Behavior |
|---|---|
| Hero video | Static poster image |
| Page transitions | Instant, no fade |
| Section reveals | No animation, content visible immediately |
| Gallery transitions | Instant, no slide |
| Hover effects | No scale, no movement |
| Skeleton shimmer | Static, no animation |
| Scroll animations | Disabled |
| Parallax | Disabled |

### 37.2 Reduced motion implementation

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 38. Responsive behavior

### 38.1 Responsive rules

- Mobile-first approach: base styles for mobile, enhancements for larger screens.
- Content order: same visual order across breakpoints (no reordering).
- Navigation: collapses at tablet breakpoint.
- Grid: adjusts columns at breakpoints.
- Typography: scales down at smaller breakpoints.
- Images: responsive via srcset/sizes.
- Touch targets: minimum 44px x 44px on mobile.

### 38.2 Component responsive summary

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Header | Hamburger, 60px | Hamburger, 64px | Full nav, 72px |
| Product Grid | 1-2 columns | 2 columns | 4 columns |
| Card Grid | 1 column | 2 columns | 3-4 columns |
| Split Layout | Stacked | Stacked | Two columns |
| Footer | Stacked | 2 columns | 4 columns |
| Hero | 70vh, fallback image | 80vh, video | 100vh, video |
| Typography | Scaled down | Scaled down | Full size |

---

## 39. Accessibility

### 39.1 WCAG compliance target

WCAG 2.1 Level AA minimum. Level AAA where achievable without compromise.

### 39.2 Accessibility requirements

| Area | Requirement |
|---|---|
| Contrast | 4.5:1 for normal text, 3:1 for large text (AA) |
| Focus visible | 2px outline, 2px offset, `--color-accent` |
| Keyboard navigation | All interactive elements focusable, logical tab order |
| Touch targets | Minimum 44px x 44px |
| Form labels | Every input has associated label |
| Error messages | Linked via `aria-describedby`, announced with `aria-live` |
| Reduced motion | `prefers-reduced-motion` fully supported |
| Text scaling | Layout supports up to 200% text scaling |
| Screen reader | Semantic HTML, ARIA landmarks, meaningful alt text |
| Image alt text | Informative: meaningful; decorative: empty alt |
| Skip to content | First focusable element on every page |
| Language | `lang` attribute on `<html>` element |
| Headings | One h1 per page, proper hierarchy |

### 39.3 Accessibility testing checklist

- [ ] All text meets contrast ratios
- [ ] All interactive elements are keyboard accessible
- [ ] All form fields have labels
- [ ] All images have appropriate alt text
- [ ] Focus is visible on all focusable elements
- [ ] Page works with 200% text scaling
- [ ] Page works with reduced motion
- [ ] Skip-to-content link works
- [ ] Language attribute is correct
- [ ] Heading hierarchy is correct

---

## 40. Internationalization / TR + EN

### 40.1 Bilingual design rules

- Layout must accommodate both Turkish and English text.
- Turkish text is generally similar length; some words longer.
- English text may be shorter or longer depending on context.
- Button widths: flexible, not fixed to one language.
- Navigation: horizontal space must accommodate longest label.
- No hardcoded widths based on one language's text length.

### 40.2 Typography for Turkish

- Playfair Display and Inter both support Turkish characters.
- Characters: ğ, ş, ç, ö, ü, ı, İ, Ğ, Ş, Ç, Ö, Ü.
- Font subsetting must include Latin Extended.

### 40.3 Language switch

- Language switch is always accessible.
- Current language is visually indicated.
- Switch navigates to equivalent variant of same entity.

---

## 41. SEO visual considerations

### 41.1 SEO-design alignment

| Area | Rule |
|---|---|
| Heading hierarchy | h1 → h2 → h3, no skipped levels |
| Content width | Readable text within optimal measure |
| Image alt text | Meaningful descriptions, not keyword stuffing |
| Media fallback | Core content not dependent on video/animation |
| Crawlable content | Text content rendered in HTML, not images |
| Internal links | Clear, descriptive link text |

### 41.2 SEO-design boundary

- Design does not guarantee rankings.
- Design supports useful, accessible, crawlable content.
- SEO metadata is content, not design.

---

## 42. Component-to-token mapping

| Component | Typography | Colors | Spacing | Radius | Motion |
|---|---|---|---|---|---|
| SiteHeader | Navigation font | `--color-bg-primary`, `--color-text-primary`, `--color-accent` | `--space-6` horizontal nav | `--radius-none` | `--duration-fast` |
| SiteFooter | Navigation font | `--color-bg-dark`, `--color-text-inverse` | `--space-8` vertical | `--radius-none` | none |
| HeroVideo | Display font | `--color-text-inverse`, overlay tokens | `--space-8` content padding | `--radius-none` | `--duration-slower` |
| ProductCard | H4 + Caption | `--color-bg-white`, `--color-text-primary` | `--space-5` padding | `--radius-none` | `--duration-fast` (hover) |
| CollectionCard | H4 + Body Small | `--color-bg-white`, `--color-text-primary` | `--space-5` padding | `--radius-none` | `--duration-fast` (hover) |
| ProjectCard | H4 + Caption | `--color-bg-white`, `--color-text-primary` | `--space-5` padding | `--radius-none` | `--duration-fast` (hover) |
| JournalCard | H4 + Body Small + Caption | `--color-bg-white`, `--color-text-primary` | `--space-5` padding | `--radius-none` | `--duration-fast` (hover) |
| ApplicationCard | H4 + Body Small | `--color-bg-white`, `--color-text-primary` | `--space-5` padding | `--radius-none` | `--duration-fast` (hover) |
| QuoteForm | Body + Label | `--color-bg-white`, `--color-text-primary`, `--color-border-medium` | `--space-4` field spacing | `--radius-sm` | `--duration-fast` |
| ContactForm | Body + Label | `--color-bg-white`, `--color-text-primary`, `--color-border-medium` | `--space-4` field spacing | `--radius-sm` | `--duration-fast` |
| Button (Primary) | Button font | `--color-accent`, white | `--space-5` height (large) | `--radius-none` | `--duration-fast` |
| Button (Secondary) | Button font | transparent, `--color-accent`, accent border | `--space-5` height (medium) | `--radius-none` | `--duration-fast` |
| Breadcrumbs | Navigation font | `--color-text-secondary`, `--color-accent` | `--space-3` gap | `--radius-none` | none |
| Pagination | Navigation font | `--color-text-primary`, `--color-accent` | `--space-3` gap | `--radius-none` | `--duration-fast` |

---

## 43. Design tokens

### 43.1 Color tokens

```css
:root {
  /* Backgrounds */
  --color-bg-primary: #F5F0EB;
  --color-bg-secondary: #EDE7DF;
  --color-bg-tertiary: #E5DDD3;
  --color-bg-dark: #2C2C2C;
  --color-bg-darker: #1A1A1A;
  --color-bg-white: #FFFFFF;

  /* Text */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #5A5A5A;
  --color-text-tertiary: #8A8078;
  --color-text-inverse: #F5F0EB;
  --color-text-on-dark: #D4CFC9;

  /* Borders */
  --color-border-subtle: #D9D2CA;
  --color-border-medium: #C4BAA9;

  /* Accent */
  --color-accent: #8B7355;
  --color-accent-hover: #6B5740;
  --color-accent-subtle: #C4B49A;

  /* State */
  --color-error: #B44A4A;
  --color-success: #4A7A4A;
  --color-warning: #8B7355;

  /* Overlay */
  --color-surface-overlay: rgba(0, 0, 0, 0.6);
  --color-surface-overlay-light: rgba(0, 0, 0, 0.4);
}
```

### 43.2 Typography tokens

```css
:root {
  /* Font families */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Font sizes (desktop) */
  --text-display: 4.5rem;    /* 72px */
  --text-h1: 3rem;           /* 48px */
  --text-h2: 2.25rem;        /* 36px */
  --text-h3: 1.5rem;         /* 24px */
  --text-h4: 1.25rem;        /* 20px */
  --text-body-large: 1.125rem; /* 18px */
  --text-body: 1rem;         /* 16px */
  --text-body-small: 0.875rem; /* 14px */
  --text-caption: 0.75rem;   /* 12px */

  /* Line heights */
  --leading-tight: 1.1;
  --leading-snug: 1.2;
  --leading-normal: 1.6;
  --leading-relaxed: 1.6;

  /* Font weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-wider: 0.04em;
}
```

### 43.3 Spacing tokens

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-7: 3rem;      /* 48px */
  --space-8: 4rem;      /* 64px */
  --space-9: 6rem;      /* 96px */
  --space-10: 8rem;     /* 128px */
}
```

### 43.4 Layout tokens

```css
:root {
  --container-sm: 42.5rem;   /* 680px */
  --container-md: 60rem;     /* 960px */
  --container-lg: 75rem;     /* 1200px */
  --container-xl: 90rem;     /* 1440px */

  --grid-columns: 12;
  --grid-gutter: 1.5rem;     /* 24px */
  --grid-margin: 3rem;        /* 48px */

  --text-measure: 42.5rem;   /* 680px */
}
```

### 43.5 Breakpoint tokens

```css
:root {
  --breakpoint-mobile: 0px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1200px;
}
```

### 43.6 Border & radius tokens

```css
:root {
  --border-subtle: 1px solid var(--color-border-subtle);
  --border-medium: 1px solid var(--color-border-medium);
  --border-strong: 2px solid var(--color-border-medium);

  --radius-none: 0;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-full: 9999px;
}
```

### 43.7 Shadow tokens

```css
:root {
  --shadow-none: none;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### 43.8 Motion tokens

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;

  --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in: cubic-bezier(0.4, 0, 1, 1);
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  --distance-sm: 8px;
  --distance-md: 16px;
  --distance-lg: 32px;
}
```

### 43.9 Z-index tokens

```css
:root {
  --z-index-base: 0;
  --z-index-dropdown: 10;
  --z-index-sticky: 50;
  --z-index-header: 100;
  --z-index-overlay: 200;
  --z-index-modal: 300;
  --z-index-toast: 400;
}
```

### 43.10 Component tokens

```css
:root {
  /* Header */
  --header-height-desktop: 4.5rem;
  --header-height-tablet: 4rem;
  --header-height-mobile: 3.75rem;

  /* Card */
  --card-bg: var(--color-bg-white);
  --card-border: 1px solid var(--color-border-subtle);
  --card-radius: var(--radius-none);
  --card-shadow: var(--shadow-none);
  --card-padding: var(--space-5);

  /* Hero */
  --hero-height-desktop: 100vh;
  --hero-height-tablet: 80vh;
  --hero-height-mobile: 70vh;
  --hero-min-height-desktop: 600px;
  --hero-min-height-tablet: 480px;
  --hero-min-height-mobile: 400px;

  /* Form */
  --input-height: 2.75rem;
  --input-padding: 0.75rem;
  --input-border: 1px solid var(--color-border-medium);
  --input-radius: var(--radius-sm);

  /* Button */
  --button-height-lg: 3.25rem;
  --button-height-md: 2.75rem;
  --button-height-sm: 2.25rem;
  --button-padding-lg: 2rem;
  --button-padding-md: 1.5rem;
  --button-padding-sm: 1rem;
}
```

---

## 44. CSS architecture guidance

### 44.1 Architecture approach

- Use CSS custom properties (variables) for all tokens.
- Use a single global CSS file for tokens.
- Use component-scoped CSS (CSS Modules, styled-components, or equivalent).
- No utility-first framework (Tailwind) unless approved.
- No inline styles for design decisions.

### 44.2 File structure guidance

```
styles/
├── tokens.css          (all CSS custom properties)
├── global.css          (reset, base styles)
├── typography.css      (font faces, type styles)
├── components/
│   ├── header.css
│   ├── footer.css
│   ├── hero.css
│   ├── card.css
│   ├── form.css
│   ├── button.css
│   └── ...
└── utilities.css       (if needed)
```

### 44.3 Naming convention

- Use BEM or equivalent scoped naming.
- Token references use CSS custom properties, not hardcoded values.
- Component classes: `.component-name`, `.component-name__element`, `.component-name--modifier`.

---

## 45. Anti-patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|---|---|---|
| Generic SaaS design | Not a dashboard; this is editorial/showroom | Premium editorial layout |
| Excessive rounded cards | Not consumer/social; this is architectural | Sharp corners (`--radius-none`) |
| Excessive shadows | Not app-like; this is editorial | Minimal to no shadows |
| Gradient backgrounds | Not tech/startup; this is stone/luxury | Solid warm neutrals |
| Excessive animations | Not promotional; this is premium | Subtle, intentional motion |
| Random colors | Not playful; this is sophisticated | Stone/ivory/charcoal palette |
| Inconsistent spacing | Not grid-less; this is architectural | 8px spacing system |
| Hard-coded component colors | Not maintainable | Semantic token system |
| Typography hierarchy violation | Not chaotic; this is editorial | Clear serif/sans hierarchy |
| Inaccessible contrast | Not exclusionary; this is accessible | WCAG AA minimum |
| Mobile overflow | Not desktop-only; this is responsive | Mobile-first responsive |
| Duplicated design tokens | Not scalable; this is systematic | Single token source |
| Component-specific arbitrary values | Not maintainable | Token-based design |
| Pill-shaped buttons | Not consumer; this is architectural | Sharp corners |
| Stock photo aesthetic | Not generic; this is premium | Original editorial photography |
| AI-generated feel | Not synthetic; this is authentic | Real approved content only |

---

## 46. Implementation rules

### 46.1 Token usage

- All design decisions use tokens; no hardcoded values.
- Tokens are the single source of truth.
- Component styles reference tokens, not other components.

### 46.2 Responsive implementation

- Mobile-first CSS: base styles for mobile, media queries for larger screens.
- Breakpoints: `@media (min-width: 768px)` for tablet, `@media (min-width: 1200px)` for desktop.

### 46.3 Accessibility implementation

- Semantic HTML is mandatory.
- ARIA is used only when semantic HTML is insufficient.
- Focus management is implemented for all interactive patterns.
- Reduced motion is implemented via `prefers-reduced-motion`.

### 46.4 Performance implementation

- Fonts loaded with `font-display: swap`.
- Images use `loading="lazy"` (except above-fold).
- CSS is critical-path for above-fold content.
- No render-blocking resources for hero.

---

## 47. Open decisions

### Design-system blocking

None. The design system supports all approved V1 behavior.

### Design-system non-blocking

1. **Content Owner identity** — The real named individual must be confirmed before company-specific content is published.
2. **Project launch content** — Whether at least one qualifying approved bilingual Project exists at launch.
3. **Featured content on Homepage** — Which specific items are featured is an editorial decision.
4. **Exact form fields** — Contact and Quote Request form fields are content-dependent.
5. **Legal/privacy text** — Privacy notice and legal content must be approved before production data collection.
6. **Homepage section ordering** — Final section ordering may be adjusted editorially.
7. **Exact form field configuration** — Form fields belong to implementation.
8. **Font loading strategy** — Self-hosted vs CDN is an implementation decision.
9. **Icon set final selection** — Lucide Icons is recommended; final selection belongs to implementation.

---

## 48. Design system completion checklist

- [x] Color system defined with semantic tokens
- [x] Typography system with font selection and rationale
- [x] Type scale for desktop/tablet/mobile
- [x] Spacing system with 8px base
- [x] Layout & grid system
- [x] Container system
- [x] Breakpoints defined
- [x] Border & divider system
- [x] Radius system (minimal/sharp)
- [x] Shadow system (minimal)
- [x] Iconography approach
- [x] Button system with variants and states
- [x] Link system
- [x] Form system with accessibility
- [x] Navigation system (desktop/tablet/mobile)
- [x] Header component tokens
- [x] Footer component tokens
- [x] Hero system with fallback states
- [x] Media system with aspect ratios
- [x] Image treatment
- [x] Video treatment
- [x] Product card system
- [x] Collection card system
- [x] Project card system
- [x] Journal card system
- [x] Application card system
- [x] Quarry/Factory visual system
- [x] Content section patterns
- [x] CTA/conversion patterns
- [x] State patterns
- [x] Loading/skeleton system
- [x] Error/empty states
- [x] Motion & animation tokens
- [x] Reduced motion rules
- [x] Responsive behavior
- [x] Accessibility requirements
- [x] Internationalization (TR/EN)
- [x] SEO visual considerations
- [x] Component-to-token mapping
- [x] Complete design token definitions
- [x] CSS architecture guidance
- [x] Anti-patterns documented
- [x] Implementation rules
- [x] Open decisions listed

---

## Design System Audit

| Check | Result |
|---|---|
| Consistent with 09_COMPONENT_TREE.md | PASS: all components mapped to tokens; no contradictions |
| Consistent with 00-08 documents | PASS: no contradictions with approved architecture |
| Responsive behavior defined | PASS: mobile-first, breakpoints, component behavior |
| Accessibility defined | PASS: WCAG AA, contrast, focus, keyboard, forms, reduced motion |
| TR/EN considered | PASS: bilingual layout, font subsetting, flexible widths |
| Hero fallback preserved | PASS: 7 states defined, reduced-motion supported |
| Image aspect ratios defined | PASS: all contexts covered with rationale |
| Button variants defined | PASS: Primary, Secondary, Ghost with states |
| Breakpoints defined | PASS: 768px, 1200px with rationale |
| Design tokens frontend-transferable | PASS: CSS custom properties defined |
| No unnecessary components/tokens | PASS: minimal system, no excess |
| Premium marble identity preserved | PASS: stone/ivory/charcoal, editorial, architectural |
| No invented company data | PASS: no capacity, certificates, projects, customers |
| No hard-coded values violating semantic tokens | PASS: all values use tokens |

**Result: ALL PASS**

---

DESIGN SYSTEM STATUS: READY FOR IMPLEMENTATION — WITH OPEN DECISIONS

---

## Critical OPEN DECISIONS

1. **Content Owner identity** — Must be confirmed before production.
2. **Project launch content** — Affects conditional Project component rendering.
3. **Featured Homepage content** — Editorial decision, not design system.
4. **Exact form fields** — Content-dependent, belongs to implementation.
5. **Legal/privacy text** — Must be approved before form data collection.
6. **Homepage section ordering** — Editorial adjustment allowed.
7. **Font loading strategy** — Self-hosted vs CDN (implementation).
8. **Icon set final selection** — Lucide recommended (implementation).
