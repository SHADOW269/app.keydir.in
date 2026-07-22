# KEYDIR — Design System

> **Version:** 1.0
> **Last Updated:** 2026-07-14

---

## 1. Design Philosophy

KEYDIR uses a **cyberpunk-industrial** aesthetic with **neo-brutalist** elements. The design is intentionally raw, terminal-inspired, and high-contrast — reflecting the technical, hands-on nature of the mechanical keyboard community.

**Core principles:**
- Zero border-radius (sharp edges everywhere)
- Hard box shadows (no blur, offset only)
- Monospace fonts for data, display fonts for headings
- High contrast (black on cream, yellow on black)
- Grid/dot background pattern
- Terminal-inspired UI elements

---

## 2. Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `--f-d` | Space Grotesk | Display font — headings, hero text, body |
| `--f-m` | JetBrains Mono | Monospace font — buttons, labels, data, nav, badges |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `--fw-regular` | 400 | Body text, descriptions |
| `--fw-bold` | 700 | Buttons, labels, nav links |
| `--fw-extrabold` | 800 | Headings, hero text, stats |

### Type Scale

| Token | Size | Usage |
|-------|------|-------|
| `--fs-hero` | `clamp(3rem, 8vw, 6.5rem)` | Hero title |
| `--fs-hero-sub` | `.95rem` | Hero subtitle |
| `--fs-section` | `clamp(2rem, 5vw, 4rem)` | Section headings |
| `--fs-cta` | `clamp(2.5rem, 6vw, 5rem)` | CTA heading |
| `--fs-btn` | `.88rem` | Button text |
| `--fs-btn-sm` | `.68rem` | Small button text |
| `--fs-badge` | `.65rem` | Badge text |
| `--fs-search` | `.9rem` | Search input |
| `--fs-filter-label` | `.68rem` | Filter labels |
| `--fs-filter-option` | `.72rem` | Filter options |
| `--fs-sec-tag` | `.72rem` | Section tags |
| `--fs-product-name` | `.92rem` | Product card name |
| `--fs-product-brand` | `.68rem` | Product card brand |
| `--fs-product-price` | `.92rem` | Product card price |
| `--fs-stat-num` | `2rem` | Stat box number |
| `--fs-stat-label` | `.62rem` | Stat box label |
| `--fs-stat-big` | `3rem` | Large stat number |
| `--fs-terminal` | `.82rem` | Terminal text |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--lh-hero` | `.88` | Hero title |
| `--lh-hero-sub` | `1.75` | Hero subtitle |
| `--lh-hero-homepage` | `.85` | Homepage hero |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--ls-hero` | `-.06em` | Hero title |
| `--ls-section` | `-.05em` | Section headings |
| `--ls-cta` | `-.05em` | CTA heading |

---

## 3. Colors

### Brand Palette (constant across themes)

| Token | Hex | Usage |
|-------|-----|-------|
| `--yellow` | `#FAFF00` | Primary accent, CTA background, active states |
| `--green` | `#00FF6A` | Success, lowest price, positive indicators |
| `--blue` | `#3B82F6` | Links, info |
| `--pink` | `#FF3FA4` | Warnings, Alice category |
| `--orange` | `#FF6B00` | Alerts, barebone category |
| `--red` | `#FF2A2A` | Errors, danger, switches category |
| `--purple` | `#A855F7` | Special, split category |
| `--cyan` | `#00E5FF` | Tech, hall effect category |
| `--teal` | `#00B4A0` | Low-profile, deskpad category |

### Light Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#FFFCF0` | Page background (warm cream) |
| `--bg-alt` | `#F5F2E4` | Alternate background |
| `--surface` | `#FFFCF0` | Card/panel background |
| `--surface-raised` | `#FFFFFF` | Raised elements |
| `--border` | `#111111` | Primary border |
| `--border-subtle` | `#CCCCCC` | Secondary border |
| `--text` | `#111111` | Primary text |
| `--text-inv` | `#FFFCF0` | Inverted text |
| `--text-muted` | `#555555` | Secondary text |
| `--text-dim` | `#999999` | Tertiary text |
| `--shadow` | `#111111` | Box shadow color |
| `--marquee-bg` | `#111111` | Marquee background |
| `--marquee-text` | `#FAFF00` | Marquee text |
| `--cta-bg` | `#FAFF00` | CTA background |
| `--cta-text` | `#111111` | CTA text |

### Dark Theme (`[data-theme="dark"]`)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#181818` | Page background (dark gray) |
| `--bg-alt` | `#202020` | Alternate background |
| `--surface` | `#222222` | Card/panel background |
| `--surface-raised` | `#2A2A2A` | Raised elements |
| `--border` | `#484848` | Primary border |
| `--border-subtle` | `#333333` | Secondary border |
| `--text` | `#F0EDD8` | Primary text (warm white) |
| `--text-inv` | `#181818` | Inverted text |
| `--text-muted` | `#A8A490` | Secondary text |
| `--text-dim` | `#666666` | Tertiary text |
| `--shadow` | `#000000` | Box shadow color |
| `--marquee-bg` | `#0D0D0D` | Marquee background |
| `--marquee-text` | `#FAFF00` | Marquee text (same) |
| `--cta-bg` | `#252500` | CTA background |
| `--cta-text` | `#FAFF00` | CTA text |

---

## 4. Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--sp-1` | `4px` | Extra small gap |
| `--sp-2` | `8px` | Small gap |
| `--sp-3` | `12px` | Medium gap |
| `--sp-4` | `16px` | Default gap |
| `--sp-5` | `20px` | Medium padding |
| `--sp-6` | `24px` | Section gap |
| `--sp-8` | `32px` | Large gap |
| `--sp-10` | `40px` | XL gap |
| `--sp-12` | `48px` | 2XL gap |
| `--sp-16` | `64px` | 3XL gap |
| `--sp-20` | `80px` | Section padding |

---

## 5. Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--bd` | `1px solid var(--border)` | Default border |
| `--bd-subtle` | `1px solid var(--border-subtle)` | Subtle border |
| `--bd-thick` | `2px solid var(--border)` | Card/component border |
| `--bw-thin` | `1px` | Thin border width |
| `--bw-normal` | `2px` | Normal border width |
| `--bw-thick` | `3px` | Thick border width |
| `--bw-footer` | `4px` | Footer border |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--rad` | `0px` | All components (zero radius) |
| `--rad-round` | `50%` | Circles (status dots, avatars) |

---

## 6. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--sh` | `4px 4px 0 var(--shadow)` | Default shadow |
| `--sh-lg` | `8px 8px 0 var(--shadow)` | Large shadow |
| `--sh-xl` | `12px 12px 0 var(--shadow)` | XL shadow |

**Shadow behavior:**
- All shadows are hard (no blur), offset only
- On hover: shadow reduces (e.g., `sh` → `2px 2px 0`)
- Element translates on hover to simulate press (e.g., `translate(2px, 2px)`)

---

## 7. Cards

### Neo Card (`.neo-card`)
```css
background: var(--surface);
border: 2px solid var(--border);
box-shadow: 4px 4px 0 var(--shadow);
```

**Hover:**
```css
transform: translate(3px, 3px);
box-shadow: 1px 1px 0 var(--shadow);
```

### Dark Card (`.neo-card-dark`)
```css
background: var(--dark-card-bg);
border: 2px solid var(--border);
box-shadow: 4px 4px 0 var(--shadow);
color: var(--dark-card-text);
```

---

## 8. Buttons

### Primary (`.btn-primary`)
```css
padding: 13px 28px;
border: 2px solid var(--border);
background: var(--text);
color: var(--bg);
font-family: var(--f-m);
font-size: .88rem;
font-weight: 700;
text-transform: uppercase;
box-shadow: 4px 4px 0 var(--shadow);
```

**Hover:**
```css
background: var(--yellow);
color: #111;
transform: translate(2px, 2px);
box-shadow: 2px 2px 0 var(--shadow);
```

### Secondary (`.btn-secondary`)
- Same as primary but `background: var(--surface)` and `color: var(--text)`
- Hover: `background: var(--green)`

### Small (`.btn-sm`)
```css
padding: 5px 12px;
font-size: .68rem;
```

---

## 9. Forms

### Admin Input (`.admin-input`)
```css
width: 100%;
padding: 8px 12px;
border: 2px solid var(--border);
background: var(--surface);
color: var(--text);
font-family: var(--f-m);
font-size: .78rem;
font-weight: 600;
box-shadow: 4px 4px 0 var(--shadow);
```

**Focus:**
```css
background: var(--input-focus);
box-shadow: 8px 8px 0 var(--shadow);
```

### Admin Label (`.admin-label`)
```css
font-family: var(--f-m);
font-size: .68rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: .08em;
color: var(--text-muted);
```

---

## 10. Tables

### Price Table (`.price-table`)
```css
width: 100%;
border-collapse: collapse;
border: 2px solid var(--border);
```

**Header:**
```css
font-family: var(--f-m);
font-size: .68rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: .06em;
padding: 10px 14px;
background: var(--text);
color: var(--bg);
```

**Lowest price row:**
```css
background: rgba(0,255,106,.06);
font-weight: 800;
```

---

## 11. Profile Layout

### Profile Page Structure
```
┌─────────────────────────────────────────┐
│  Navbar                                 │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ Identicon │  │ Username             │ │
│  │ (SVG)    │  │ Display Name         │ │
│  │          │  │ Rank: Member         │ │
│  │          │  │ Member since Month Y │ │
│  │          │  │ Bio                  │ │
│  │          │  │ Social Links         │ │
│  └──────────┘  └──────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ [Wishlist] [Collection]             │ │
│  ├─────────────────────────────────────┤ │
│  │ Product cards grid                  │ │
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  Footer                                 │
└─────────────────────────────────────────┘
```

---

## 12. Product Page Layout

### Product Detail Structure
```
┌─────────────────────────────────────────┐
│  Navbar                                 │
├─────────────────────────────────────────┤
│  Breadcrumb: HOME > Category > Product  │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ Product Image │  │ Product Name     │ │
│  │ (neo-card)    │  │ Vote Widget      │ │
│  │              │  │ Lowest Price     │ │
│  │              │  │ Description      │ │
│  │              │  │ Save Buttons     │ │
│  └──────────────┘  └──────────────────┘ │
├─────────────────────────────────────────┤
│  SPECIFICATIONS                         │
│  ┌─────────────────────────────────────┐│
│  │ General                             ││
│  │ ├─ Layout: 75%                      ││
│  │ ├─ Case Material: Aluminum          ││
│  │ └─ Mount Type: Gasket               ││
│  ├─────────────────────────────────────┤│
│  │ PCB                                 ││
│  │ ├─ Type: Hot-swap                   ││
│  │ └─ Connectivity: Wireless           ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  WHERE TO BUY                           │
│  ┌─────────────────────────────────────┐│
│  │ VendorCard: Meckeys  ₹8,999  BUY → ││
│  │ VendorCard: StackKB   ₹9,499  BUY → ││
│  │ VendorCard: Loadout  ₹9,999  BUY → ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  PRICE HISTORY                          │
│  ┌─────────────────────────────────────┐│
│  │ [7D] [30D] [90D] [ALL]             ││
│  │ ┌─────────────────────────────────┐ ││
│  │ │     SVG Chart with line/area    │ ││
│  │ │     Grid, crosshair, tooltip    │ ││
│  │ └─────────────────────────────────┘ ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Footer                                 │
└─────────────────────────────────────────┘
```

---

## 13. Vendor Cards

### Standard Vendor Card
```css
background: var(--surface);
border: 2px solid var(--border);
box-shadow: 4px 4px 0 var(--shadow);
padding: 20px;
```

**Hover:**
```css
transform: translate(2px, 2px);
box-shadow: 2px 2px 0 var(--shadow);
```

### Lowest Price Vendor Card
```css
border-color: var(--green);
box-shadow: 4px 4px 0 rgba(0,255,106,.25);
```

---

## 14. Admin Dashboard Layout

### Admin Shell
```
┌──────────┬──────────────────────────────────┐
│ SIDEBAR  │  MAIN CONTENT                    │
│          │                                   │
│ Dashboard│  ┌──────┐ ┌──────┐ ┌──────┐     │
│ Products │  │Stat 1│ │Stat 2│ │Stat 3│     │
│ Vendors  │  └──────┘ └──────┘ └──────┘     │
│ Brands   │                                   │
│ Categories│  QUICK ACTIONS                   │
│ Banners  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ Users    │  │Add │ │Add │ │Add │ │Add │   │
│ Votes    │  │Prod│ │Vend│ │Brand│ │Cat │   │
│ Community│  └────┘ └────┘ └────┘ └────┘   │
│ Settings │                                   │
│          │  TWO-COLUMN                       │
│ Back     │  ┌──────────────┐ ┌──────────┐  │
│ to Site  │  │Recent Activity│ │Sys Health│  │
│          │  │              │ │          │  │
│          │  │              │ │Signups   │  │
│          │  │              │ │          │  │
│          │  │              │ │Votes     │  │
│          │  └──────────────┘ └──────────┘  │
└──────────┴──────────────────────────────────┘
```

**Sidebar:**
- Width: 220px
- Sticky positioning
- Border-right: 3px solid var(--border)
- Background: var(--surface)

**Main content:**
- Flex: 1
- Padding: 20px

---

## 15. Animations

### Fade Up
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
}
```
Usage: Hero elements, staggered entry (`.08s`, `.16s`, `.22s` delays)

### Blink
```css
@keyframes blink {
  50% { opacity: 0; }
}
```
Usage: Status dots, terminal indicators

### Marquee
```css
@keyframes march {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```
Usage: Scrolling marquee strip (28s linear infinite)

### Slide In
```css
@keyframes slide-in {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: none; opacity: 1; }
}
```
Usage: Mobile navigation overlay

---

## 16. Hover Effects

### Button Hover
- Background changes to accent color (yellow/green)
- Text color changes
- Translates `2px, 2px` (press effect)
- Shadow reduces from `4px 4px` to `2px 2px`

### Card Hover
- Translates `3px, 3px`
- Shadow reduces from `4px 4px` to `1px 1px`

### Link Hover
- Background changes to `var(--text)`
- Color changes to `var(--bg)`

### Search Input Focus
- Background changes to `var(--yellow)`
- Shadow increases from `sh` to `sh-lg`
- Translates `-2px, -2px` (lift effect)

---

## 17. Responsive Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `--bp-desktop` | `1100px` | Desktop layout |
| `--bp-tablet` | `900px` | Tablet layout |
| `--bp-mobile` | `860px` | Mobile breakpoint |
| `--bp-small` | `600px` | Small screens |
| `--bp-theme-toggle` | `480px` | Theme toggle visibility |

### Breakpoint behavior:
- **> 1100px**: Full desktop layout, sidebar visible
- **900px - 1100px**: Condensed desktop, sidebar collapsible
- **< 860px**: Mobile layout, hamburger menu, filter modal
- **< 600px**: Compact mobile, stacked layouts

---

## 18. Grid System

### Container
```css
max-width: 1380px;
padding: 0 24px;
```

### Background Grid
```css
background-image:
  radial-gradient(var(--dot-bg) 1.2px, transparent 1.2px),
  linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
  linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
background-size: 36px 36px, 100px 100px, 100px 100px;
```

### Common Grid Layouts
- **4-column**: Stat cards, admin quick actions
- **5-column**: Category grid
- **2-column**: Product hero, admin dashboard
- **Auto-fill**: Product card grid (responsive)

---

## 19. Dark Theme Rules

- Theme toggled via `data-theme="dark"` on `<html>`
- Managed by `next-themes` library
- FOUC prevention via `ThemeScript` component
- All colors defined as CSS custom properties switch automatically
- Same design tokens, different values
- Brand palette (yellow, green, etc.) remains constant

---

## 20. Component Sizing

| Component | Height | Width |
|-----------|--------|-------|
| Navbar | 68px | Full width |
| Button | 40px (default) | Auto |
| Button Small | 28px | Auto |
| Badge | 20px | Auto |
| Input | 34px (nav) / 40px (admin) | 100% |
| Card | Auto | Auto |
| Filter sidebar | Auto | 256px |
| Admin sidebar | calc(100vh - 68px) | 220px |
| Product hero | 520px min | Full width |
| Price chart | 320px | 100% |

---

## 21. Icon Usage

- **Library:** Lucide React (`lucide-react`)
- **Primary icons:** `SlidersHorizontal` (filters), `User` (profile), `Search` (search)
- **Emoji icons:** Used for categories (⌨ 🔘 ⬛ 🖱), terminal elements, and stat indicators
- **No custom SVG icons** — use Lucide or emoji only

---

## 22. Loading States

### Progress Bar
- Fixed at top of page
- Yellow (`var(--yellow)`) bar
- Width transitions from 0% to 100%

### Skeleton Loading
```css
--skeleton-a: #f0f0f0;  /* light theme */
--skeleton-b: #e0e0e0;
--skeleton-a: #2A2A2A;  /* dark theme */
--skeleton-b: #333333;
```

### Suspense Fallback
- Server Components use `<Suspense fallback={null}>`
- Client Components show skeleton or spinner

---

## 23. Empty States

- Centered text with `var(--text-dim)` color
- Monospace font (`var(--f-m)`)
- Example: "No recent activity", "No users yet"
- No illustrations or icons — just text

---

## 24. Error States

### Form Errors
- Redirect with error query param: `/auth/login?error=...`
- Error displayed on target page

### Not Found
- Next.js `notFound()` function
- Renders 404 page

### API Errors
- `NextResponse.json({ error: '...' }, { status: 400/500 })`

### Admin Validation Errors
- Returned as `{ error: 'Message' }` from server actions
- Displayed inline in form
