# RoomsCluster — App Inventory
### Reference doc for AI design tooling (Google Stitch)

This is a factual inventory of every page, component, and design token currently in the codebase — not a design direction. Use it as the "what exists" input; [design-brief.md](./design-brief.md) in this same folder is the "what it should become" direction if you want both.

---

## 1. Product Summary

**RoomsCluster** is a browser-based live-session platform for webinars and virtual classrooms. Hosts create a session, share a join link, and run the room (video, chat, whiteboard, hand-raise, recording, attendance) without attendees needing to install anything or create an account.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 (CSS-first `@theme` tokens, no separate config file) |
| State | Zustand (auth), TanStack React Query (server state) |
| Real-time | LiveKit (video/audio), Socket.io (chat/whiteboard/presence) |
| Auth | NextAuth |
| Icons | lucide-react |
| Fonts | Inter (via `next/font/google`), loaded as `--font-inter` |
| Toasts | Sonner |

Component library: fully custom, no shadcn/MUI/Chakra — all primitives live in `src/components/ui/`.

---

## 3. Page / Screen Inventory

### Public
| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Marketing landing page — nav, hero with animated live-room mock, features grid, how-it-works, final CTA, footer |

### Auth (`(auth)` route group)
| Route | File | Purpose |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Credential or magic-link sign-in, mode toggle |
| `/register` | `(auth)/register/page.tsx` | Name/email/password sign-up |
| `/invite/accept?token=` | `(auth)/invite/accept/page.tsx` | Multi-state invite flow: invalid link, not-found, wrong-account, logged-out (sign in/register CTA), logged-in accept screen |

All three share one visual pattern: centered card, `max-w-md`, on mobile the card becomes borderless/full-bleed (background = card).

### Dashboard (`(dashboard)` route group — behind auth, shares `layout.tsx`)
| Route | File | Purpose |
|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | Home: welcome header, 3 stat cards (Total/Live/Scheduled), recent sessions list |
| `/dashboard/sessions` | `dashboard/sessions/page.tsx` | Full session/folder explorer — grid or list view, drag-and-drop into folders, create/rename/delete folders, workspace indicator |
| `/dashboard/sessions/new` | `dashboard/sessions/new/page.tsx` | Create-session form (title, description, schedule, passcode) |
| `/dashboard/sessions/[id]` | `dashboard/sessions/[id]/page.tsx` | Session detail — stats, join link, recordings list, chat transcript download, attendance table + CSV/TXT export, start/end/delete actions |
| `/dashboard/settings/organization` | `dashboard/settings/organization/page.tsx` | Org rename, invite teammate, pending invitations, member list w/ role + remove |

Shared shell (`(dashboard)/layout.tsx`): fixed left sidebar on desktop (org switcher → nav → user menu), top bar + bottom tab bar on mobile. Nav destinations: Dashboard, Sessions, Settings.

### Session / Room (`(session)` route group — public-ish, guests allowed)
| Route | File | Purpose |
|---|---|---|
| `/room/[joinCode]/join` | `room/[joinCode]/join/page.tsx` | Guest pre-join screen — name/email form, session status badge, blocked until session is LIVE |
| `/room/[joinCode]` | `room/[joinCode]/page.tsx` | The live room itself — video grid or whiteboard, chat/participants side panel (desktop) or bottom sheet (mobile), control bar |

### Error boundaries
`src/app/error.tsx`, `(dashboard)/error.tsx`, `(session)/room/[joinCode]/error.tsx` — per-route-group error fallbacks.

---

## 4. Component Inventory

### UI primitives — `src/components/ui/`
| Component | Notes |
|---|---|
| `Button` | variants: primary / secondary / danger / ghost; sizes: sm / md / lg; built-in `loading` state |
| `Input` | label + error support, focus ring |
| `Card`, `CardHeader`, `CardContent` | variants: `surface` (border only) / `raised` (border + shadow) |
| `StatusBadge` | dot + label pill for SessionStatus (LIVE / SCHEDULED / ENDED) |
| `Spinner` | inline SVG spinner |
| `Skeleton` | generic pulse placeholder block |
| `BottomSheet` | mobile-only (`md:hidden`) modal sheet — backdrop, drag handle, optional title, `auto`/`tall` height. Used for live-room chat/participants and control-bar overflow on mobile |

### Dashboard components — `src/components/dashboard/`
| Component | Notes |
|---|---|
| `OrgSwitcher` | workspace dropdown; supports `compact` prop for mobile top bar (icon-only) |
| `UserMenu` | account dropdown (org settings link, sign out); supports `compact` prop; opens upward in the sidebar, downward in the mobile top bar |
| `SessionsListSkeleton`, `SessionDetailSkeleton` | loading placeholders matching their respective page layouts |

### Session/Room components — `src/components/session/`
| Component | Notes |
|---|---|
| `VideoGrid` | responsive tile grid (1/2/3 cols by participant count), hand-raise + mic-muted overlays, avatar fallback when camera off |
| `ChatPanel` | message list + composer, own-message bubbles right-aligned in primary color |
| `ParticipantsPanel` | role-sorted list (Host/Co-host/Speaker/Guest), raised-hands section, host-only per-participant menu (promote/demote/lower hand) |
| `ControlBar` | mic/camera/screen-share/record-or-raise-hand/leave/end-session. **Desktop**: full labeled row. **Mobile**: condensed icon-only row (mic/camera/role-action/leave/more) with a `BottomSheet` for overflow actions |
| `Whiteboard` | canvas drawing surface — pen/eraser/line/rectangle/circle tools, 8-color swatch palette, socket-synced |

---

## 5. Design Tokens

Defined in `src/app/globals.css` under `@theme inline` (Tailwind v4 CSS-first tokens — no `tailwind.config.js`). Usable directly as Tailwind classes, e.g. `bg-primary-600`, `text-ink-700`, `rounded-card`.

### Color
| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#eef2ff` | selected/highlight backgrounds |
| `primary-100` | `#e0e7ff` | badges, banners |
| `primary-500` | `#3b63e8` | landing-page accent text |
| `primary-600` | `#2454e0` | primary actions, links, active states |
| `primary-700` | `#1b3fb8` | hover/pressed |
| `ink-900` | `#0b1220` | headings, dark surfaces (room/hero background) |
| `ink-800` | `#141c2e` | dark chrome (room top/control bars) |
| `ink-700` | `#33405c` | secondary text on light surfaces, dark-theme inactive buttons |
| `surface-0` | `#ffffff` | cards, panels |
| `surface-50` | `#f7f8fa` | page background |
| `surface-200` | `#e4e7ec` | borders, dividers |
| `success-50/100/600` | `#f0fdf4` / `#dcfce7` / `#15803d` | live status, success states |
| `warning-50/100/500` | `#fffbeb` / `#fef3c7` / `#d97706` | connecting/pending states |
| `danger-50/100/600/700` | `#fef2f2` / `#fee2e2` / `#dc2626` / `#b91c1c` | destructive actions, recording indicator, errors |

Note: text/border opacity variants are used extensively instead of new tokens, e.g. `text-ink-700/60`, `border-white/10` — treat these as valid intermediate tones, not gaps in the palette.

### Typography
- Font family: Inter (`--font-inter`), sans-serif fallback stack.
- No separate display font — headings use the same family at larger sizes/weights (`text-xl`/`text-2xl` + `font-bold`).

### Shape & Elevation
| Token | Value |
|---|---|
| `radius-card` | 10px (`rounded-card`) |
| `radius-modal` | 16px (`rounded-modal`) |
| `shadow-raised` | `0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1)` |

### Responsive pattern
- Breakpoint of consequence throughout: Tailwind `md` (768px). Mobile = below `md`; desktop/tablet = `md` and above.
- Recurring mobile substitutions already implemented: sidebar → bottom tab bar (dashboard), side panel → bottom sheet (live room chat/participants, control-bar overflow), full labeled controls → icon-only compact controls (live room), boxed card → full-bleed borderless form (auth).

---

## 6. Known Gaps / Inconsistencies

- **`/room/[joinCode]/join` (Guest Join page)** was *not* included in the live-room redesign pass — it still uses the pre-redesign raw Tailwind classes (`bg-gray-900`, `bg-blue-600`, `text-red-400`, etc.) instead of the tokens above. Treat it as "old" styling, not representative of current direction.
- **`copy-join-link.tsx`** (`dashboard/sessions/[id]/copy-join-link.tsx`) is dead code — not imported anywhere; the session detail page has its own inline equivalent. Also still on old raw Tailwind classes.
- **Whiteboard** tool/color-swatch UI uses fixed hex values (`#ffffff`, `#ef4444`, ...) for the drawing palette by design — these are user-facing ink colors, not theme tokens, and should stay hardcoded.
