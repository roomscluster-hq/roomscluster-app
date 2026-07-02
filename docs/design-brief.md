# RoomsCluster — Design Brief
### Professional Visual Redesign — Web & Mobile

---

## 1. Context & Objective

RoomsCluster is a browser-based live-session platform (webinars, classrooms, org-hosted rooms) built around three user contexts: **marketing/auth**, **host dashboard**, and **the live room** itself. The current UI is functional but visually generic (default Tailwind blue, flat cards, inconsistent elevation, no defined type scale). This brief defines a more professional, cohesive visual system and describes how each core screen should look and behave across **web (desktop/tablet)** and **mobile** breakpoints, so the product reads as a considered product rather than a template.

Scope: visual & interaction design direction only — the existing routes, data model (Session, Organization, Participant, Folder, etc.) and tech stack (Next.js, Tailwind, LiveKit) are unchanged.

---

## 2. Design Principles

1. **Calm authority** — hosts are often mid-presentation or managing a room live; the UI should never compete for attention. Neutral surfaces, restrained color, purposeful accent only on actionable/status elements.
2. **Status at a glance** — Live / Scheduled / Ended, mic/camera/hand-raise state, recording state — all must be readable in a half-second glance, including from a phone screen shared during a call.
3. **One-handed mobile** — mobile is for joining, checking status, and light moderation, not full session authoring. Primary actions sit within thumb reach (bottom third of screen).
4. **Consistent density** — dashboard = information-dense, comfortable spacing; live room = compact, chrome minimized in favor of video/content.

---

## 3. Visual Identity

### 3.1 Color

Refine rather than replace — keep blue as the recognizable primary, but deepen the palette so it feels intentional rather than default-Tailwind.

| Token | Value | Use |
|---|---|---|
| `primary-600` | `#2454E0` | Primary actions, links, active nav |
| `primary-700` | `#1B3FB8` | Hover/pressed state |
| `primary-50` | `#EEF2FF` | Selected row / subtle highlight |
| `ink-900` | `#0B1220` | Headings, hero backgrounds (replaces flat `#0F1729`) |
| `ink-700` | `#33405C` | Secondary text on light surfaces |
| `surface-0` | `#FFFFFF` | Cards, panels |
| `surface-50` | `#F7F8FA` | App/page background |
| `surface-200` | `#E4E7EC` | Borders, dividers |
| `success-600` | `#15803D` | Live indicator, success states |
| `warning-500` | `#D97706` | Scheduled-soon, warnings |
| `danger-600` | `#DC2626` | Recording, destructive actions, errors |
| **Live-room dark set** | `#0B1220` / `#141C2E` / `#1D2740` | Room background / panel / raised surface |

Status colors stay semantic and are never reused for anything else (e.g., green is *only* "live/success", never a generic CTA).

### 3.2 Typography

- Keep **Inter / Geist Sans** as the base — it's a legitimate professional choice — but define an explicit type scale instead of ad-hoc Tailwind sizes:

| Role | Size / Weight | Example use |
|---|---|---|
| Display | 32–40px / 700 | Landing hero |
| H1 | 28px / 600 | Page titles (Dashboard, Session detail) |
| H2 | 20px / 600 | Section headers, card titles |
| Body | 15px / 400 | Default text |
| Small / Meta | 13px / 500 | Timestamps, badges, table meta |
| Mono (Geist Mono) | 13px | Join codes, passcodes |

- Line-height 1.4–1.5 for body; tighter (1.2) for display/headings.
- On mobile, cap display/H1 at ~26px so hero and page-title text doesn't wrap awkwardly.

### 3.3 Elevation, Shape & Spacing

- Replace flat 1px-border cards with a **2-tier elevation system**: `surface` (border only, for dense lists) and `raised` (border + soft shadow `0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1)`, for primary content cards, modals, dropdowns).
- Corner radius: 10px for cards/inputs, 8px for buttons/badges, 16px for modals — currently inconsistent, should be tokenized.
- Spacing scale locked to Tailwind's 4px base (already true) but documented: 4/8/12/16/24/32/48 as the only allowed gaps in new layouts.

### 3.4 Iconography & Motion

- Keep Lucide (consistent stroke icons already in place).
- Motion: 150ms ease-out for hover/press, 200ms for panel/modal enters, spring-out for hand-raise/reaction pop-ups. No motion on data-heavy dashboard tables beyond row hover.

---

## 4. Screen Descriptions — Web (≥1024px)

**Landing Page**
Full-bleed dark `ink-900` hero with a single clear headline + primary CTA (`primary-600` button), product screenshot/mock inset with subtle shadow instead of flat image. Feature grid below on `surface-50` background using 3-column cards with icon, title, one line — not paragraphs. Sticky top nav that goes opaque on scroll.

**Login / Register / Invite Accept**
Centered single-column card (max 400px) on `surface-50`, logo top, form fields with clear label-above-input, primary button full-width. Magic-link and password options visually separated by a labeled divider ("or"), not just spacing.

**Dashboard (`/dashboard`)**
Left-fixed sidebar (org switcher top, nav below, account bottom) on `surface-0`, content area on `surface-50`. Stat row uses 3–4 compact stat cards (Live now / Scheduled / Total this month) with number as the dominant element, label small above it. Recent sessions as a table on desktop, not cards — sortable status column using color-coded `StatusBadge` pill (green/blue/gray dot + label).

**Sessions List / Session Detail / New Session**
List: table with search + status filter chips inline (not a dropdown) above it. Detail: two-column layout — left 65% session info/participants/chat-log tabs, right 35% sticky panel with join code, quick actions (Start, Copy link, Lock room), and recording status. New Session: single-column form in a `raised` card, grouped into "Basics", "Schedule", "Access" sections with subtle dividers rather than one long field list.

**Organization Settings**
Standard settings pattern: left sub-nav (General / Members / Billing if applicable), right content panel. Member list as table with role badge + inline role-change dropdown.

**Live Room (`/room/[joinCode]`)**
Dark theme (`ink-900`/`#141C2E`). Video grid dominant, chrome reduced to a translucent bottom control bar (mic/camera/hand-raise/leave) and a slide-out right panel for chat/participants that doesn't cover video when open on desktop (pushes layout instead of overlapping). "LIVE" badge top-left with `success-600` dot; recording indicator top-right, red dot with soft pulse, label "Recording" not just an icon (accessibility).

---

## 5. Screen Descriptions — Mobile (≤480px)

**Landing** — hero copy shortens, CTA becomes full-width sticky-ish button below fold copy, feature grid collapses to single column with icon+title+text stacked, generous 24px vertical rhythm so it doesn't feel cramped.

**Auth** — full-screen form (no card chrome, background *is* the card) so keyboard doesn't fight for space; primary button pinned above the safe-area/keyboard.

**Dashboard** — sidebar becomes a bottom tab bar (Dashboard / Sessions / Settings) or a slide-in drawer from a top-left hamburger — recommend **bottom tab bar** since dashboard/sessions/settings are the 3 core destinations and thumb reach matters. Stat cards go horizontal-scroll (snap) instead of wrapping awkwardly. Recent sessions render as stacked cards (title, status pill, time, chevron) instead of a table — tables don't work below ~600px.

**Session Detail** — tabs (Info / Participants / Chat) become a horizontally scrollable segmented control at top; the "quick actions" sticky panel from desktop becomes a bottom sheet triggered by a floating action button, so join code / start / lock actions are always one thumb-tap away without permanently consuming vertical space.

**New Session** — same section grouping as desktop but one field per row, sticky "Continue/Create" button pinned to bottom above the keyboard.

**Live Room (mobile)** — this is the highest-stakes mobile screen since guests frequently join from phones. Video/content fills the screen; control bar is a single bottom row of large (44px+) tap targets — mic, camera, hand-raise, more (chat/participants/leave collapse into a "more" sheet to avoid overcrowding). Chat/participants open as a **bottom sheet drawer** (60–90% height, swipe to dismiss) rather than a side panel. Hand-raise and reactions surface as a brief toast/pop near the control bar, not a modal, so they never block the video.

---

## 6. Component System Notes

- `Button`: keep primary/secondary/danger/ghost variants, but standardize height (36/40/44 for sm/md/lg) and add a `loading` state with inline spinner instead of separate `Spinner` swap causing layout shift.
- `StatusBadge`: dot + label pattern everywhere (never color-only, for accessibility/colorblind users).
- `Card`: introduce `surface` vs `raised` variants per §3.3.
- New: `BottomSheet` and `Toast/InlineNotice` components needed for mobile live-room patterns above — currently absent from the component set.

---

## 7. Accessibility

- All status/color communication paired with text or icon (never color alone).
- Minimum tap target 44×44px on mobile controls, especially live-room mic/camera/leave.
- Contrast: body text on `surface-50`/`surface-0` ≥ 4.5:1; verify white-on-`primary-600` and white-on-`ink-900` meet AA (both do at listed hex values).
- Focus rings visible (2px `primary-600` offset) on all interactive elements — currently relies on default browser outline in places.

---

## 8. Suggested Next Steps

1. Turn tokens in §3 into a `theme` config (Tailwind CSS variables) as the single source of truth.
2. Prioritize the Live Room mobile redesign (§5) first — it's the highest-traffic, highest-visibility surface for non-host users.
3. Rebuild `Card`, `Button`, `StatusBadge` per §6 before touching page layouts, since every screen depends on them.
4. Optional: produce high-fidelity mockups (Figma) per screen listed in §4/§5 once tokens are agreed.
