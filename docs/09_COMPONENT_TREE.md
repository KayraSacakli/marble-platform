# Component Tree Architecture

## 1. Purpose

This document defines the reusable component architecture of the public website: which components exist, what each is responsible for, how they compose, and how they behave across pages, screen sizes, and accessibility requirements.

It transforms the structural wireframes from `08_PAGE_WIREFRAMES.md` into a component-level architecture without defining visual design, colors, typography tokens, spacing values, CSS, code, or framework-specific implementation.

It answers: "What components does this site use and what are their responsibility boundaries?"

---

## 2. Scope

Covers component architecture for all approved public page types. Does not define colors, typography tokens, spacing tokens, border radius, shadows, button visual styles, CSS architecture, React/Vue components, or animations in implementation detail.

---

## 3. Component architecture principles

### 3.1 Core rules

- Every component has a single clear responsibility.
- Components are content-type-aware, not page-specific wherever possible.
- State components are separate from content components.
- Media components handle accessibility, alt text, and fallback independently.
- Conversion components enforce the Quote Request XOR rule.
- Components do not embed domain logic, CMS fetching, SEO logic, or authorization.
- Components are composable but not deeply nested.
- "Not responsible for" is explicitly defined for every component.

### 3.2 Scope boundary

This document defines component structure and responsibility. Visual design system (colors, typography, spacing, tokens) belongs to `10_DESIGN_SYSTEM.md`. Code implementation belongs to development stages.

---

## 4. Naming convention

All components use PascalCase kavramsal isimler:

| Pattern | Example | Usage |
|---|---|---|
| `{Entity}{Purpose}` | `ProductCard`, `ProductGrid`, `ProductGallery` | Content-type components |
| `{EntityType}{Layout}` | `CollectionHero`, `ApplicationProducts` | Entity-specific sections |
| `{Function}{Type}` | `QuoteForm`, `ContactForm`, `FormField` | Conversion components |
| `{State}{Type}` | `LoadingState`, `EmptyState`, `ErrorState` | State components |
| `{Nav}{Type}` | `SiteHeader`, `DesktopNavigation`, `MobileNavigation` | Navigation components |
| `{Media}{Type}` | `ResponsiveImage`, `ImageGallery`, `HeroVideo` | Media components |
| `{Layout}{Type}` | `ContentContainer`, `SplitLayout`, `GridLayout` | Layout components |

---

## 5. Application shell

The Application Shell is the outermost structural wrapper. It is not a visual component; it defines the page skeleton.

```
AppShell
├── SiteHeader
│   ├── BrandLogo
│   ├── DesktopNavigation
│   ├── MobileNavigation
│   ├── LanguageSwitcher
│   └── GlobalCTA (Request Quote)
├── Breadcrumbs (conditional, not on Homepage)
├── MainContent (page-specific content)
└── SiteFooter
    ├── FooterNavigation
    ├── FooterCompanyLinks
    ├── FooterCatalogueLinks
    ├── FooterConversionLinks
    ├── FooterLegalLinks (conditional)
    └── LanguageSwitcher
```

| Component | Purpose | Responsibility | Not responsible for |
|---|---|---|---|
| AppShell | Outermost page skeleton | Defines global page structure; wraps header, content, footer | Content rendering, styling, data fetching |
| SiteHeader | Persistent top navigation bar | Contains brand, navigation, language switch, global CTA | Page-specific content, scrolling behavior |
| SiteFooter | Persistent bottom navigation bar | Contains company links, catalogue links, conversion links, legal links | Page-specific content, form handling |
| MainContent | Page content wrapper | Wraps page-specific sections; skip-to-content target | Global navigation, header, footer |

### 5.1 Responsive behavior

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| SiteHeader | Full horizontal layout | Condensed/hamburger | Hamburger/overlay |
| SiteFooter | Multi-column layout | Adjusted columns | Stacked columns |
| MainContent | Full-width | Full-width | Full-width |

### 5.2 Accessibility

- AppShell: skip-to-content link as first focusable element
- SiteHeader: semantic header landmark, keyboard navigation, ARIA labels
- SiteFooter: semantic footer landmark, keyboard navigation
- MainContent: semantic main landmark, id for skip-to-content

---

## 6. Layout components

Layout components define structural arrangements. They are used only where genuinely reusable across multiple pages.

| Component | Purpose | Responsibility | Not responsible for | Used on |
|---|---|---|---|---|
| FullWidthSection | Full-width content section | Renders section at full viewport width; provides consistent section wrapper | Content inside, styling, background | Homepage, all detail pages |
| ContentContainer | Centered content wrapper | Constrains content width; provides consistent horizontal padding | Content layout, grid behavior | All pages |
| SplitLayout | Two-column layout | Arranges content in two columns (e.g., gallery + info) | Column content, responsive stacking | Product Detail, Contact |
| EditorialLayout | Long-form content layout | Optimal reading width for editorial content | Content itself, media | Journal Detail, About, Quarry, Factory |
| GridLayout | Responsive grid | Arranges cards/items in responsive grid | Card/item content, grid values | Catalogue, Homepage sections |
| MediaContentLayout | Media + text side-by-side | Arranges media and content in two-column or stacked layout | Media rendering, content | Quarry, Factory, About |
| DetailLayout | Detail page skeleton | Provides consistent detail page structure (identity, content, related) | Page-specific content | Product Detail, Collection Detail, etc. |
| ListingLayout | Listing page skeleton | Provides consistent listing page structure (intro, grid, pagination) | Grid content, pagination | Catalogue, Journal Listing |
| PaginationLayout | Pagination wrapper | Wraps pagination controls with consistent structure | Page numbers, navigation logic | Catalogue, Journal Listing |

### 6.1 Layout component usage rules

- Use `GridLayout` for card-based content display across pages.
- Use `SplitLayout` only where two-column layout is genuinely needed.
- Do not create a layout component for every section; most sections use `FullWidthSection` + `ContentContainer`.
- Layout components do not render content; they define arrangement.

---

## 7. Content components

Content components are tied to domain entities. They render content for specific content types.

### 7.1 Product components

| Component | Purpose | Responsibility | Not responsible for | Related pages |
|---|---|---|---|---|
| ProductCard | Display one product in a grid | Renders product image, name, brief description; links to detail | Grid layout, filtering, sorting | Product Catalogue, Homepage, Collection Detail, Application Detail |
| ProductGrid | Display multiple products | Renders responsive grid of ProductCards | Card content, data fetching | Product Catalogue, Homepage |
| ProductGallery | Display product images | Renders primary image + gallery thumbnails; keyboard-navigable | Image loading, responsive image | Product Detail |
| ProductHero | Product identity section | Renders product name, primary image, brief tagline | Full gallery, description | Product Detail |
| ProductInfo | Product information display | Renders approved technical/commercial information (if available) | Description, gallery | Product Detail |
| ProductQuoteCTA | Product conversion section | Renders quote CTA with product context | Form handling, privacy notice | Product Detail |

**Product characteristics data dependency:** Technical/commercial information fields are content-dependent. `ProductInfo` renders only fields with approved data; unavailable fields are not shown. Exact fields are an OPEN DECISION per `01_MASTER_INFORMATION_ARCHITECTURE.md`.

### 7.2 Collection components

| Component | Purpose | Responsibility | Not responsible for | Related pages |
|---|---|---|---|---|
| CollectionCard | Display one collection in a grid | Renders collection image, name, brief description; links to detail | Grid layout | Homepage, Collection Listing |
| CollectionGrid | Display multiple collections | Renders responsive grid of CollectionCards | Card content | Homepage |
| CollectionHero | Collection identity section | Renders collection name, approved description | Products within collection | Collection Detail |
| CollectionProducts | Products in collection | Renders products belonging to this collection | Grid layout, card rendering | Collection Detail |

### 7.3 Application components

| Component | Purpose | Responsibility | Not responsible for | Related pages |
|---|---|---|---|---|
| ApplicationCard | Display one application in a grid | Renders application image, name, brief description; links to detail | Grid layout | Homepage, Application Listing |
| ApplicationGrid | Display multiple applications | Renders responsive grid of ApplicationCards | Card content | Homepage |
| ApplicationHero | Application identity section | Renders application name, approved editorial introduction | Products, projects | Application Detail |
| ApplicationProducts | Products for application | Renders products relevant to this application | Grid layout, card rendering | Application Detail |
| ApplicationProjects | Projects for application | Renders projects using this application | Grid layout, conditional visibility | Application Detail |

### 7.4 Project components

| Component | Purpose | Responsibility | Not responsible for | Related pages |
|---|---|---|---|---|
| ProjectCard | Display one project in a grid | Renders project image, name, brief description; links to detail | Grid layout, conditional visibility | Homepage, Project Listing |
| ProjectGrid | Display multiple projects | Renders responsive grid of ProjectCards | Card content, conditional visibility | Homepage, Project Listing |
| ProjectHero | Project identity section | Renders project name, approved case-study narrative | Gallery, products | Project Detail |
| ProjectGallery | Project images | Renders approved project images | Image loading, responsive image | Project Detail |
| ProjectInfo | Project information | Renders approved project description | Related content | Project Detail |
| ProjectQuoteCTA | Project conversion | Renders quote CTA with project context | Form handling | Project Detail |

**Project conditional visibility:** All Project components are only rendered when at least one qualifying published bilingual project exists per `01_MASTER_INFORMATION_ARCHITECTURE.md`. No empty states or placeholder projects.

### 7.5 Journal components

| Component | Purpose | Responsibility | Not responsible for | Related pages |
|---|---|---|---|---|
| JournalCard | Display one article in a grid | Renders article image, title, excerpt, publication date; links to detail | Grid layout | Journal Listing, Homepage |
| JournalGrid | Display multiple articles | Renders responsive grid of JournalCards | Card content, pagination | Journal Listing |
| JournalHero | Article hero section | Renders article title, metadata, hero media | Article content | Journal Detail |
| JournalContent | Article body | Renders approved editorial content | Related content, conversion | Journal Detail |
| JournalMetadata | Article metadata | Renders publication date, author (if approved) | Title, content | Journal Detail |
| RelatedJournalContent | Related articles | Renders related journal articles | Grid layout, card rendering | Journal Detail |

### 7.6 Company/About components

| Component | Purpose | Responsibility | Not responsible for | Related pages |
|---|---|---|---|---|
| CompanyIntro | Company identity section | Renders company name, approved brand statement | Story, contact | About |
| CompanyStory | Company narrative | Renders approved company story/content | Contact, media | About |
| CompanyCTA | Company conversion | Renders contact/quote CTA | Form handling | About |

**Truthfulness constraint:** Company components render only approved factual content. No invented claims, statistics, certifications, or capacity.

### 7.7 Quarry components

| Component | Purpose | Responsibility | Not responsible for | Related pages |
|---|---|---|---|---|
| QuarryHero | Quarry identity section | Renders quarry name, approved origin narrative | Media, products | Quarry |
| QuarryInfo | Quarry information | Renders approved origin story content | Products, conversion | Quarry |
| QuarryMedia | Quarry imagery | Renders approved quarry images | Image loading, responsive | Quarry |
| QuarryCTA | Quarry conversion | Renders quote/CTA with quarry context | Form handling | Quarry |

**Truthfulness constraint:** Quarry components render only approved factual content. No invented quarry ownership, reserves, capacity, or certifications.

### 7.8 Factory components

| Component | Purpose | Responsibility | Not responsible for | Related pages |
|---|---|---|---|---|
| FactoryHero | Factory identity section | Renders factory name, approved production narrative | Media, products | Factory |
| FactoryInfo | Factory information | Renders approved production story content | Products, conversion | Factory |
| FactoryMedia | Factory imagery | Renders approved factory images | Image loading, responsive | Factory |
| FactoryCTA | Factory conversion | Renders quote/CTA with factory context | Form handling | Factory |

**Truthfulness constraint:** Factory components render only approved factual content. No invented machinery inventory, production statistics, or capacity.

---

## 8. Media components

Media components handle image, video, and media presentation with accessibility, fallback, and responsive behavior.

| Component | Purpose | Responsibility | Not responsible for | Used on |
|---|---|---|---|---|
| Image | Basic image display | Renders image with alt text; handles decorative vs informative semantics | Responsive sizing, lazy loading | All pages |
| ResponsiveImage | Responsive image with srcset | Renders image with multiple sizes/formats; handles responsive loading | Alt text content, media rights | All pages with images |
| ImageGallery | Image gallery grid/carousel | Renders multiple images; keyboard-navigable; supports thumbnails | Individual image rendering, lightbox | Product Detail, Project Detail |
| GalleryViewer | Full-screen/lightbox gallery | Renders full-screen image view; keyboard-navigable; focus trapped | Gallery grid, thumbnails | Product Detail, Project Detail |
| Video | Video player | Renders video with controls; respects reduced-motion | Video production, hosting | Factory, Journal |
| HeroVideo | Hero video with fallback | Renders cinematic video; manages fallback states (failure, disabled, reduced-motion, slow) | Video production, animation timeline | Homepage |
| VideoFallback | Video failure fallback | Renders static fallback when video fails, is disabled, or reduced-motion | Video itself | Homepage |
| PosterImage | Video poster image | Renders poster/preview image before video loads | Video itself | Homepage, any video |
| MediaCaption | Media caption text | Renders caption below media | Media rendering | All pages with captions |
| MediaCredit | Media rights/credit indicator | Renders credit/attribution text (if required) | Media rendering | All pages with credited media |

### 8.1 Hero video fallback states

The `HeroVideo` component must manage these states:

| State | Behavior |
|---|---|
| Video loads and plays | Full cinematic scroll-driven experience |
| Video fails to load | `VideoFallback` with static hero image + message + CTA |
| Video disabled by user | `VideoFallback` with static hero image + message + CTA |
| Reduced motion preference | `VideoFallback` with static hero image + message + CTA |
| Slow connection | `VideoFallback` with static hero image + message + CTA |
| JavaScript delayed/disabled | Core message and navigation remain functional |
| No media available | Text-based hero with message + CTA |

### 8.2 Media accessibility

- Informative images: meaningful alt text
- Decorative images: empty alt semantics
- No alt text as SEO keyword container
- Gallery: keyboard-navigable, focus management
- Video: captions/subtitles (when available), reduced-motion respect
- Lightbox: focus trapped, escape to close, aria labels

### 8.3 Media responsive behavior

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| ResponsiveImage | Full resolution with srcset | Scaled with srcset | Scaled with srcset |
| ImageGallery | Multi-column grid or carousel | Adjusted grid/carousel | Single-column or carousel |
| GalleryViewer | Full-screen overlay | Full-screen overlay | Full-screen overlay |
| HeroVideo | Full-width background | Full-width background | Fallback image |
| VideoFallback | Full-width static image | Full-width static image | Full-width static image |

---

## 9. Navigation components

Navigation components handle site navigation, wayfinding, and language switching.

| Component | Purpose | Responsibility | Not responsible for | Used on |
|---|---|---|---|---|
| Header | Persistent top bar | Contains brand, nav, language, CTA; fixed/sticky | Page content, scrolling | All pages |
| DesktopNavigation | Desktop horizontal nav | Renders primary navigation items; keyboard-navigable | Mobile behavior, content | All pages (desktop) |
| MobileNavigation | Mobile hamburger/overlay | Renders navigation in mobile menu; focus trapped when open | Desktop behavior, content | All pages (mobile) |
| LanguageSwitcher | TR/EN language toggle | Switches to equivalent locale variant; shows current language | Content translation, fallback | All pages |
| Breadcrumbs | Hierarchical wayfinding | Renders breadcrumb trail from homepage; locale-specific | Content hierarchy definition | All pages except Homepage |
| FooterNavigation | Footer link groups | Renders footer link sections (company, catalogue, conversion, legal) | Content, styling | All pages |
| Pagination | Page navigation | Renders page numbers, prev/next; keyboard-navigable | Content, data fetching | Catalogue, Journal Listing |
| ContextualNavigation | In-page section navigation | Renders section links for long pages (if needed) | Content, styling | Long editorial pages |
| RelatedContentNavigation | Related content links | Renders links to related content sections | Content, grid layout | Detail pages |

### 9.1 Navigation visibility rules

| Component | Visible When |
|---|---|
| DesktopNavigation | Always (Projects item conditional on qualifying projects) |
| MobileNavigation | Always (Projects item conditional on qualifying projects) |
| Breadcrumbs | All pages except Homepage |
| Pagination | When content spans multiple pages |
| RelatedContentNavigation | When related content exists |

### 9.2 Navigation responsive behavior

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| Header | Full horizontal | Condensed | Hamburger |
| DesktopNavigation | Horizontal menu | Condensed/hidden | Hidden |
| MobileNavigation | Hidden | Hamburger/overlay | Hamburger/overlay |
| Breadcrumbs | Full trail | Full trail | Truncated trail |
| FooterNavigation | Multi-column | Adjusted columns | Stacked |

### 9.3 Navigation accessibility

- Skip-to-content link as first focusable element
- Keyboard navigable (tab, arrow keys for dropdowns)
- Focus visible
- ARIA labels for landmarks
- Language switch announces current language
- Mobile nav: focus trapped when open, escape to close
- Breadcrumbs: semantic nav landmark, aria-label

---

## 10. Conversion components

Conversion components handle Quote Request and Contact form flows.

| Component | Purpose | Responsibility | Not responsible for | Used on |
|---|---|---|---|---|
| QuoteCTA | Quote request button/link | Renders quote CTA; carries context (general or one entity) | Form handling, privacy | Product Detail, Application Detail, Project Detail, Homepage |
| QuoteContextSummary | Display quote context | Shows the entity being enquired about (product/project/application) | Form fields, submission | Quote Request |
| QuoteForm | Quote request form | Renders form fields, handles validation, submission, success/error | Privacy notice rendering, context display | Quote Request |
| ContactForm | Contact form | Renders contact form fields, handles validation, submission | Contact info display | Contact |
| FormField | Individual form field | Renders label, input, validation message; accessible | Other fields, form submission | Quote Form, Contact Form |
| ValidationMessage | Form validation error | Renders error message near field; announced to screen readers | Field rendering | Quote Form, Contact Form |
| SuccessState | Form submission success | Renders confirmation message, request reference | Form, error states | Quote Request, Contact |
| ErrorState | Form/system error | Renders error message, retry option | Form, success states | All pages (form and non-form) |

### 10.1 Quote Request XOR rule enforcement

`QuoteContextSummary` and `QuoteCTA` enforce the XOR rule from `01_MASTER_INFORMATION_ARCHITECTURE.md`:

- General Quote Request: no context displayed
- Product-context: exactly one Product displayed
- Project-context: exactly one Project displayed
- Application-context: exactly one Application displayed
- Multiple contexts never permitted
- Context validated server-side; component displays validated context only

### 10.2 Conversion responsive behavior

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| QuoteCTA | Inline button | Inline button | Full-width or sticky |
| QuoteForm | Centered, multi-column fields | Centered, stacked fields | Full-width stacked |
| ContactForm | Two-column (info + form) | Stacked | Full-width stacked |
| FormField | Standard layout | Standard layout | Full-width |

### 10.3 Conversion accessibility

- Form labels associated with inputs
- Required fields indicated
- Error messages near relevant fields
- Errors announced to screen readers
- Privacy notice accessible before submission
- Success state announced
- Keyboard navigable
- Focus management on submission

---

## 11. State components

State components handle loading, empty, error, and special states. They are separate from content components to maintain clear responsibility.

### 11.1 Global state components

| Component | Purpose | Responsibility | Not responsible for | Used on |
|---|---|---|---|---|
| LoadingState | Loading indicator | Renders skeleton/placeholder while content loads | Content rendering, data fetching | All pages |
| ErrorState | Error display | Renders error message, retry option | Content, loading, success states | All pages |
| NotFound404 | 404 page | Renders recovery message, navigation links | Content, other error states | 404 |
| ServerError500 | 500 page | Renders server error message | Content, other error states | 500 |

### 11.2 Content-specific state components

| Component | Purpose | Responsibility | Not responsible for | Used on |
|---|---|---|---|---|
| EmptyState | Empty content display | Renders message when content list is empty; provides recovery path | Content, error states | Catalogue, Journal Listing, Collection Detail |
| UnpublishedState | Unpublished content handler | Redirects to appropriate SEO outcome (404/410/301) | Content display | Any unpublished URL |
| MissingLanguageState | Missing language variant | Shows available language with disabled/unavailable switch indicator | Content from other language | Any page with missing variant |
| MissingMediaState | Missing media fallback | Renders placeholder when media is unavailable | Media rendering | Product Detail, Project Detail, Journal Detail |
| UnavailableRelationshipState | Unavailable related content | Renders message when related content is unavailable | Related content display | Detail pages with broken relationships |

### 11.3 Form state components

| Component | Purpose | Responsibility | Not responsible for | Used on |
|---|---|---|---|---|
| FormSuccessState | Form success display | Renders confirmation, request reference, next steps | Form, error states | Quote Request, Contact |
| FormErrorState | Form error display | Renders validation errors, submission errors | Form, success states | Quote Request, Contact |

### 11.4 State component placement

| State | Global or Page-Specific |
|---|---|
| LoadingState | Global (used across all pages) |
| ErrorState | Global (used across all pages) |
| NotFound404 | Page-specific (404 page) |
| ServerError500 | Page-specific (500 page) |
| EmptyState | Global (used on listing pages) |
| UnpublishedState | Global (handles redirect logic) |
| MissingLanguageState | Global (used on all multilingual pages) |
| MissingMediaState | Global (used on all pages with media) |
| UnavailableRelationshipState | Global (used on all detail pages) |
| FormSuccessState | Page-specific (Quote Request, Contact) |
| FormErrorState | Page-specific (Quote Request, Contact) |

---

## 12. Accessibility patterns

### 12.1 Semantic HTML patterns

| Pattern | Implementation |
|---|---|
| Page structure | `<header>`, `<nav>`, `<main>`, `<footer>` landmarks |
| Headings | One h1 per page; h2 for sections; h3 for subsections; no skipped levels |
| Lists | `<ul>`/`<ol>` for navigation, card grids, related content |
| Tables | `<table>` with `<th>` for structured data (if any) |
| Forms | `<form>`, `<label>`, `<fieldset>`, `<legend>` where appropriate |

### 12.2 Keyboard navigation patterns

| Pattern | Behavior |
|---|---|
| Skip-to-content | First focusable element; jumps to main content |
| Tab order | Logical reading order; no positive tabindex |
| Focus visible | Visible focus indicator on all interactive elements |
| Arrow keys | Navigation within menus, galleries, carousels |
| Escape | Close modals, lightboxes, mobile nav |
| Enter/Space | Activate buttons, links |

### 12.3 Focus management patterns

| Pattern | When |
|---|---|
| Focus on page load | Main content or first interactive element |
| Focus on modal open | First focusable element in modal |
| Focus on modal close | Element that triggered the modal |
| Focus on error | First error message or field |
| Focus on success | Success message |
| Focus on language switch | Equivalent element on new locale page |

### 12.4 Accessible forms patterns

| Pattern | Implementation |
|---|---|
| Labels | Every input has associated `<label>` |
| Required fields | Visual indicator + `aria-required` |
| Error messages | `aria-describedby` linking error to field |
| Error announcement | `aria-live="polite"` for error summary |
| Grouped fields | `<fieldset>` + `<legend>` for related fields |
| Privacy notice | Accessible before submission; linked or inline |

### 12.5 Accessible media patterns

| Pattern | Implementation |
|---|---|
| Image alt text | Meaningful description for informative; empty for decorative |
| Video captions | When available |
| Reduced motion | Respect `prefers-reduced-motion` |
| Gallery navigation | Keyboard-navigable; focus management |
| Lightbox | Focus trapped; escape to close; aria labels |

### 12.6 Reduced motion

| Component | Reduced motion behavior |
|---|---|
| HeroVideo | Falls back to static image; no animation |
| ImageGallery | No carousel animation |
| GalleryViewer | No transition animation |
| All animations | Respect `prefers-reduced-motion: reduce` |

---

## 13. Responsive component behavior

### 13.1 Content components responsive behavior

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| ProductCard | Full card | Full card | Full card |
| ProductGrid | 4-column | 2-column | 1-2 column |
| ProductGallery | Multi-image grid/carousel | Adjusted grid/carousel | Single image or carousel |
| ProductHero | Two-column (image + identity) | Stacked | Stacked |
| CollectionCard | Full card | Full card | Full card |
| CollectionGrid | 3-column | 2-column | 1 column |
| ApplicationCard | Full card | Full card | Full card |
| ApplicationGrid | 3-column | 2-column | 1 column |
| ProjectCard | Full card | Full card | Full card |
| ProjectGrid | 3-column | 2-column | 1 column |
| ProjectGallery | Multi-image | Adjusted | Single image |
| JournalCard | Full card | Full card | Full card |
| JournalGrid | 3-column | 2-column | 1 column |

### 13.2 Layout components responsive behavior

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| SplitLayout | Two columns | Stacked | Stacked |
| GridLayout | Multi-column | Adjusted columns | Single column |
| EditorialLayout | Optimal reading width | Full-width | Full-width |
| MediaContentLayout | Two columns | Stacked | Stacked |

### 13.3 Navigation components responsive behavior

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| Header | Full horizontal | Condensed/hamburger | Hamburger/overlay |
| DesktopNavigation | Horizontal | Condensed/hidden | Hidden |
| MobileNavigation | Hidden | Overlay | Overlay |
| Breadcrumbs | Full trail | Full trail | Truncated |
| Pagination | Full numbers | Full numbers | Simplified |

---

## 14. Component responsibility matrix

### 14.1 Global reusable components

Components used across multiple pages:

| Component | Pages Used On |
|---|---|
| AppShell | All |
| SiteHeader | All |
| SiteFooter | All |
| MainContent | All |
| LanguageSwitcher | All |
| Breadcrumbs | All except Homepage |
| LoadingState | All |
| ErrorState | All |
| NotFound404 | 404 |
| ServerError500 | 500 |
| ResponsiveImage | All with images |
| Image | All with images |
| FormField | Quote Form, Contact Form |
| ValidationMessage | Quote Form, Contact Form |

### 14.2 Content-type components

Components tied to specific domain entities:

| Component | Domain Entity | Pages |
|---|---|---|
| ProductCard | Product | Catalogue, Homepage, Collection Detail, Application Detail |
| ProductGrid | Product | Catalogue, Homepage |
| ProductGallery | Product | Product Detail |
| ProductHero | Product | Product Detail |
| ProductInfo | Product | Product Detail |
| ProductQuoteCTA | Product | Product Detail |
| CollectionCard | Collection | Homepage, Collection Listing |
| CollectionGrid | Collection | Homepage |
| CollectionHero | Collection | Collection Detail |
| CollectionProducts | Collection | Collection Detail |
| ApplicationCard | Application | Homepage, Application Listing |
| ApplicationGrid | Application | Homepage |
| ApplicationHero | Application | Application Detail |
| ApplicationProducts | Application | Application Detail |
| ApplicationProjects | Application | Application Detail |
| ProjectCard | Project | Homepage, Project Listing |
| ProjectGrid | Project | Homepage, Project Listing |
| ProjectHero | Project | Project Detail |
| ProjectGallery | Project | Project Detail |
| ProjectInfo | Project | Project Detail |
| ProjectQuoteCTA | Project | Project Detail |
| JournalCard | Journal | Journal Listing, Homepage |
| JournalGrid | Journal | Journal Listing |
| JournalHero | Journal | Journal Detail |
| JournalContent | Journal | Journal Detail |
| JournalMetadata | Journal | Journal Detail |
| RelatedJournalContent | Journal | Journal Detail |
| CompanyIntro | Company/About | About |
| CompanyStory | Company/About | About |
| CompanyCTA | Company/About | About |
| QuarryHero | Quarry | Quarry |
| QuarryInfo | Quarry | Quarry |
| QuarryMedia | Quarry | Quarry |
| QuarryCTA | Quarry | Quarry |
| FactoryHero | Factory | Factory |
| FactoryInfo | Factory | Factory |
| FactoryMedia | Factory | Factory |
| FactoryCTA | Factory | Factory |

### 14.3 Page-specific components

Components used on specific pages only:

| Component | Page |
|---|---|
| HeroVideo | Homepage |
| VideoFallback | Homepage |
| PosterImage | Homepage, any video page |
| QuoteContextSummary | Quote Request |
| QuoteForm | Quote Request |
| ContactForm | Contact |
| FormSuccessState | Quote Request, Contact |
| NotFound404 | 404 |
| ServerError500 | 500 |

### 14.4 Primitive/UI components

Truly fundamental building blocks:

| Component | Purpose |
|---|---|
| Image | Basic image rendering |
| ResponsiveImage | Responsive image with srcset |
| FormField | Individual form field |
| ValidationMessage | Form validation error |
| Button (conceptual) | Interactive trigger (visual styling in Design System) |
| Link (conceptual) | Navigation trigger (visual styling in Design System) |

Note: Button and Link are conceptual primitives. Their visual variants (primary, secondary, ghost) belong to `10_DESIGN_SYSTEM.md`.

---

## 15. Component composition

### 15.1 Composition pattern

Components compose hierarchically but not deeply:

```
Page
→ AppShell
  → SiteHeader
    → DesktopNavigation / MobileNavigation
    → LanguageSwitcher
    → QuoteCTA
  → Breadcrumbs
  → MainContent
    → FullWidthSection
      → ContentContainer
        → GridLayout
          → ProductCard
            → ResponsiveImage
            → Link
    → SplitLayout
      → ProductGallery
        → ImageGallery
          → ResponsiveImage
      → ProductInfo
    → RelatedContentNavigation
  → SiteFooter
    → FooterNavigation
```

### 15.2 Composition rules

- Maximum nesting depth: 6 levels (Page → Shell → Content → Section → Layout → Card → Image)
- Most compositions are 3-4 levels deep
- Do not compose components that have no parent-child relationship
- State components (Loading, Error, Empty) wrap content components, not nest inside them
- Media components are leaf nodes; they do not compose other components

### 15.3 Composition examples

**Product Detail page:**
```
DetailLayout
→ ProductHero
  → ResponsiveImage
  → Product identity text
→ SplitLayout
  → ProductGallery
    → ImageGallery
      → ResponsiveImage (multiple)
  → ProductInfo
→ RelatedContentNavigation
  → CollectionCard (if applicable)
  → ApplicationCard (if applicable)
  → ProjectCard (if applicable, conditional)
  → JournalCard (if applicable)
→ ProductQuoteCTA
```

**Homepage:**
```
FullWidthSection (Hero)
→ HeroVideo / VideoFallback
  → PosterImage
  → CTA links
FullWidthSection (Featured Products)
→ ContentContainer
  → ProductGrid
    → ProductCard (multiple)
      → ResponsiveImage
FullWidthSection (Collections)
→ ContentContainer
  → CollectionGrid
    → CollectionCard (multiple)
FullWidthSection (Applications)
→ ContentContainer
  → ApplicationGrid
    → ApplicationCard (multiple)
FullWidthSection (Quarry & Factory)
→ MediaContentLayout
  → QuarryHero / FactoryHero
FullWidthSection (Projects)
→ ContentContainer
  → ProjectGrid
    → ProjectCard (multiple)
FullWidthSection (Journal)
→ ContentContainer
  → JournalGrid
    → JournalCard (multiple)
FullWidthSection (Final CTA)
→ QuoteCTA
```

---

## 16. Page → Component matrix

| Page | Components Used |
|---|---|
| Homepage | AppShell, SiteHeader, LanguageSwitcher, HeroVideo/VideoFallback, ProductGrid, ProductCard, CollectionGrid, CollectionCard, ApplicationGrid, ApplicationCard, QuarryHero, FactoryHero, ProjectGrid, ProjectCard, JournalGrid, JournalCard, QuoteCTA, SiteFooter |
| Product Catalogue | AppShell, SiteHeader, Breadcrumbs, ListingLayout, ContentContainer, ProductGrid, ProductCard, Pagination, QuoteCTA, SiteFooter |
| Product Detail | AppShell, SiteHeader, Breadcrumbs, DetailLayout, ProductHero, ProductGallery, ImageGallery, ProductInfo, ProductQuoteCTA, CollectionCard, ApplicationCard, ProjectCard, JournalCard, SiteFooter |
| Collection Detail | AppShell, SiteHeader, Breadcrumbs, DetailLayout, CollectionHero, CollectionProducts, ProductCard, ApplicationCard, QuoteCTA, SiteFooter |
| Application Detail | AppShell, SiteHeader, Breadcrumbs, DetailLayout, ApplicationHero, ApplicationProducts, ProductCard, ApplicationProjects, ProjectCard, JournalCard, QuoteCTA, SiteFooter |
| Project Detail | AppShell, SiteHeader, Breadcrumbs, DetailLayout, ProjectHero, ProjectGallery, ProjectInfo, ProductCard, ApplicationCard, ProjectQuoteCTA, SiteFooter |
| Journal Listing | AppShell, SiteHeader, Breadcrumbs, ListingLayout, ContentContainer, JournalGrid, JournalCard, Pagination, SiteFooter |
| Journal Detail | AppShell, SiteHeader, Breadcrumbs, EditorialLayout, JournalHero, JournalMetadata, JournalContent, ProductCard, ApplicationCard, ProjectCard, RelatedJournalContent, SiteFooter |
| About | AppShell, SiteHeader, Breadcrumbs, EditorialLayout, CompanyIntro, CompanyStory, CompanyCTA, SiteFooter |
| Quarry | AppShell, SiteHeader, Breadcrumbs, MediaContentLayout, QuarryHero, QuarryInfo, QuarryMedia, ProductCard, QuarryCTA, SiteFooter |
| Factory | AppShell, SiteHeader, Breadcrumbs, MediaContentLayout, FactoryHero, FactoryInfo, FactoryMedia, ProductCard, FactoryCTA, SiteFooter |
| Contact | AppShell, SiteHeader, Breadcrumbs, SplitLayout, ContactForm, FormField, ValidationMessage, SiteFooter |
| Quote Request | AppShell, SiteHeader, Breadcrumbs, QuoteContextSummary, QuoteForm, FormField, ValidationMessage, SuccessState, SiteFooter |
| 404 | AppShell, SiteHeader, NotFound404, SiteFooter |
| 500 | AppShell, SiteHeader, ServerError500, SiteFooter |

---

## 17. Design system dependencies

The following must be defined in `10_DESIGN_SYSTEM.md`:

### 17.1 Typography roles needed

| Role | Usage |
|---|---|
| Page heading (h1) | Page titles |
| Section heading (h2) | Section titles |
| Subsection heading (h3) | Subsection titles |
| Body text | Paragraphs, descriptions |
| Caption text | Media captions, credits |
| Label text | Form labels |
| Button text | CTAs, form submissions |
| Metadata text | Dates, authors, tags |
| Navigation text | Nav items, breadcrumbs |
| Error text | Validation messages |
| Success text | Confirmation messages |

### 17.2 Button variants needed

| Variant | Usage |
|---|---|
| Primary | Main CTA (Request Quote, Explore Marbles) |
| Secondary | Alternative CTA (Contact, View Product) |
| Ghost/Text | Inline links, navigation items |
| Disabled | Inactive state |

### 17.3 Spacing requirements

| Context | Requirement |
|---|---|
| Section spacing | Vertical space between page sections |
| Card spacing | Space between grid items |
| Content padding | Horizontal space within containers |
| Form field spacing | Space between form fields |
| Component internal spacing | Padding within components |

### 17.4 Grid requirements

| Context | Requirement |
|---|---|
| Product grid | 4-column desktop, 2-column tablet, 1-2 column mobile |
| Card grid | 3-column desktop, 2-column tablet, 1 column mobile |
| Content container | Max-width constraint, centered |
| Split layout | Two-column with responsive stacking |

### 17.5 Image aspect-ratio requirements

| Context | Aspect Ratio |
|---|---|
| Product card | TBD (content-dependent) |
| Product gallery primary | TBD (content-dependent) |
| Hero image | TBD (content-dependent) |
| Collection card | TBD (content-dependent) |
| Application card | TBD (content-dependent) |
| Project card | TBD (content-dependent) |
| Journal card | TBD (content-dependent) |

### 17.6 Motion requirements

| Context | Requirement |
|---|---|
| Hero video | Scroll-driven cinematic sequence |
| Reduced motion | Static fallback for all animated content |
| Page transitions | Minimal or none (V1) |
| Gallery transitions | Simple fade or slide |
| Loading states | Skeleton pulse animation |

### 17.7 Form control requirements

| Control | Usage |
|---|---|
| Text input | Name, email, subject, message |
| Textarea | Message, enquiry details |
| Submit button | Form submission |
| Select (if needed) | Context type, subject |
| Checkbox | Privacy acknowledgement |

---

## 18. Homepage hero component model

### 18.1 Component structure

```
HeroVideo
├── VideoFallback (fallback state)
│   ├── PosterImage
│   ├── Hero message (heading + subheading)
│   └── CTA links (Explore Marbles, Request Quote)
├── Video (cinematic state)
│   ├── Scroll-driven sequence
│   │   ├── Scene 1: Quarry loader carrying marble block
│   │   ├── Scene 2: Factory / SIMEC katrak cutting block
│   │   ├── Scene 3: Water/drops transition
│   │   ├── Scene 4: Premium showroom
│   │   └── Scene 5: Brand / CTA reveal
│   └── CTA links (Explore Marbles, Request Quote)
```

### 18.2 State management

| State | Component Active | Behavior |
|---|---|---|
| Video loads | Video | Full cinematic experience |
| Video fails | VideoFallback | Static image + message + CTA |
| User disables | VideoFallback | Static image + message + CTA |
| Reduced motion | VideoFallback | Static image + message + CTA |
| Slow connection | VideoFallback | Static image + message + CTA |
| JS disabled | Static HTML | Core message + navigation |

### 18.3 Implementation boundary

This document defines component structure and fallback behavior only. Video production, animation timeline, scroll-driven implementation, color, typography, and visual styling belong to stages 10 (Design System) and 11 (Hero Video Storyboard).

---

## 19. Anti-patterns

The following patterns must be avoided:

| Anti-Pattern | Why | Correct Approach |
|---|---|---|
| Giant component | Component does too many things; hard to maintain | Split into focused components |
| Duplicated component | Same component built twice with slight differences | Create one configurable component |
| Global page-specific component | Component used on one page but made global | Keep page-specific components page-specific |
| Domain logic in UI component | Business rules embedded in presentation | Separate data/logic from presentation |
| CMS/data fetching in presentational component | Data concerns mixed with rendering | Fetch data at page level; pass as props |
| SEO logic scattered across components | SEO concerns not centralized | SEO logic in page/head components |
| Authorization logic in UI | Security mixed with presentation | Authorization at route/API level |
| Design token hard-coding | Colors/spacing hardcoded in components | Use design tokens from Design System |
| Overly flexible component | One component used for too many unrelated purposes | Create separate focused components |
| Missing "Not responsible for" | Unclear component boundaries | Define explicit boundaries |

---

## 20. Open decisions

### Component-tree blocking

None. The component architecture supports all approved V1 behavior.

### Component-tree non-blocking

1. **Content Owner identity** — The real named individual must be confirmed before company-specific content components render approved content.
2. **Project launch content** — Whether at least one qualifying approved bilingual Project exists at launch determines whether Project components are rendered.
3. **Featured content on Homepage** — Which specific items are featured is an editorial decision; the component architecture supports featured sections without prescribing selection.
4. **Exact form fields** — Contact and Quote Request form fields are content-dependent; exact field configuration belongs to implementation.
5. **Legal/privacy text** — Privacy notice and legal content for forms must be approved before production data collection.
6. **Homepage section ordering** — Final section ordering may be adjusted editorially within the approved component architecture.
7. **Image aspect ratios** — Exact aspect ratios for different image contexts belong to Design System.
8. **Button visual variants** — Exact button visual styles (primary, secondary, ghost) belong to Design System.
9. **Breakpoint values** — Exact responsive breakpoints belong to Design System.

---

## 21. Traceability

| Component Decision | Source |
|---|---|
| Page inventory | `01_MASTER_INFORMATION_ARCHITECTURE.md` — Complete page inventory |
| Content relationships | `02_DOMAIN_MODEL.md` — Domain relationships; `03_DATABASE_ER.md` — Typed junctions |
| Quote Request XOR | `01` — V1 quote-context rule; `02` — Inquiry domain; `04_API_CONTRACT.md` — Quote endpoints |
| Project conditional visibility | `01` — Project availability at launch; `02` — Project launch rule |
| Multilingual behavior | `00_PROJECT_RULES.md` — Language rules; `01` — Multilingual architecture |
| Hero fallback | `00` — Hero video fallback requirement; `01` — Homepage hero concept |
| Lifecycle states | `00` — Content lifecycle; `05_CMS_CONTRACT.md` — Lifecycle management |
| Media accessibility | `00` — Accessibility requirements; `08_PAGE_WIREFRAMES.md` — Accessibility structure |
| SEO URL patterns | `06_SEO_URL_ARCHITECTURE.md` — URL pattern matrix |
| Internal links | `07_INTERNAL_LINK_GRAPH.md` — Link graph, breadcrumbs |
| Wireframe sections | `08_PAGE_WIREFRAMES.md` — Section inventory, page wireframes |
| Truthfulness | `00` — Truthfulness rules; `01` — No invented claims |

---

## 22. Consistency audit

### Against 00_PROJECT_RULES.md

| Check | Result |
|---|---|
| Truthfulness | Pass: no invented claims in components; content-dependent sections render only approved content |
| Bilingual scope | Pass: LanguageSwitcher on all pages; components are locale-aware |
| Lifecycle | Pass: State components handle Draft/Approved/Published/Unpublished/Archived/Removed |
| V1 scope | Pass: no advanced features (search, filters, comparison, commerce) |
| Accessibility | Pass: keyboard navigation, focus management, forms, media, reduced-motion |
| Hero fallback | Pass: HeroVideo with VideoFallback for all failure states |
| Quote Request | Pass: XOR rule enforced by QuoteContextSummary and QuoteCTA |
| Governance | Pass: content components depend on approved CMS content |

### Against 01_MASTER_INFORMATION_ARCHITECTURE.md

| Check | Result |
|---|---|
| Page inventory | Pass: all mandatory public pages have component compositions |
| User journeys | Pass: all four user journeys supported by component architecture |
| Navigation | Pass: primary nav matches approved structure; Projects conditional |
| Content hierarchy | Pass: component hierarchy matches approved content hierarchy |
| Product discovery | Pass: ProductGrid supports 100+ products, pagination |
| Conversion | Pass: QuoteCTA and ContactForm as conversion components |
| Project visibility | Pass: Project components conditional on qualifying content |

### Against 02_DOMAIN_MODEL.md

| Check | Result |
|---|---|
| Entity relationships | Pass: content components mirror approved domain relationships |
| Language variants | Pass: LanguageSwitcher targets equivalent variant |
| Lifecycle states | Pass: State components map to lifecycle states |
| Quote Request | Pass: XOR context rule preserved |

### Against 03_DATABASE_ER.md

| Check | Result |
|---|---|
| Data dependencies | Pass: content components reference approved junction entities |
| Media relationships | Pass: media components reference ContentMedia |
| Slug uniqueness | Pass: components use localized slugs for links |

### Against 04_API_CONTRACT.md

| Check | Result |
|---|---|
| Public endpoints | Pass: content components correspond to public API resources |
| Locale handling | Pass: components require locale; no implicit fallback |
| Publication gate | Pass: content components depend on published, eligible content |
| Pagination | Pass: Pagination component handles catalogue and listing pagination |

### Against 05_CMS_CONTRACT.md

| Check | Result |
|---|---|
| Content management | Pass: all content components are CMS-manageable |
| Lifecycle | Pass: State components align with CMS lifecycle management |
| Revision/approval | Pass: content components depend on approved content |
| Media | Pass: media components depend on rights-verified media |
| Quote Request | Pass: QuoteForm and QuoteContextSummary align with CMS capabilities |

### Against 06_SEO_URL_ARCHITECTURE.md

| Check | Result |
|---|---|
| URL patterns | Pass: components use correct URL patterns for links |
| Canonical | Pass: components do not override canonical behavior |
| Hreflang | Pass: LanguageSwitcher aligns with hreflang architecture |
| Indexability | Pass: components do not affect indexability rules |

### Against 07_INTERNAL_LINK_GRAPH.md

| Check | Result |
|---|---|
| Internal links | Pass: content components render approved contextual links |
| Breadcrumbs | Pass: Breadcrumbs component matches link graph architecture |
| Conversion links | Pass: QuoteCTA matches link graph conversion architecture |
| Navigation | Pass: navigation components match link graph navigation section |

### Against 08_PAGE_WIREFRAMES.md

| Check | Result |
|---|---|
| Section coverage | Pass: all wireframe sections have corresponding components |
| Section order | Pass: component composition follows wireframe section order |
| Content priority | Pass: component responsibility matches wireframe content priority |
| CTA placement | Pass: QuoteCTA and other CTAs match wireframe CTA hierarchy |
| Responsive | Pass: responsive behavior matches wireframe responsive matrix |
| Accessibility | Pass: accessibility patterns match wireframe accessibility structure |
| States | Pass: state components match wireframe states matrix |
| Content dependencies | Pass: component content dependencies match wireframe dependencies |

---

COMPONENT TREE STATUS [READY FOR DESIGN SYSTEM]

---

## Critical OPEN DECISIONS

1. **Content Owner identity** — The real named individual must be confirmed before company-specific content components render approved content.
2. **Project launch content** — Whether at least one qualifying approved bilingual Project exists at launch determines whether Project components are rendered.
3. **Featured content on Homepage** — Which specific items are featured is an editorial decision; the component architecture supports featured sections without prescribing selection.
4. **Exact form fields** — Contact and Quote Request form fields are content-dependent; exact field configuration belongs to implementation.
5. **Legal/privacy text** — Privacy notice and legal content for forms must be approved before production data collection.
6. **Homepage section ordering** — Final section ordering may be adjusted editorially within the approved component architecture.
7. **Image aspect ratios** — Exact aspect ratios for different image contexts belong to Design System.
8. **Button visual variants** — Exact button visual styles belong to Design System.
9. **Breakpoint values** — Exact responsive breakpoints belong to Design System.
