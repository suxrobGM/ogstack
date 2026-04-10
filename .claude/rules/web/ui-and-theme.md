---
description: Frontend UI structure, theme system, and reusable components
paths: [apps/web/src/**]
---

# UI Structure & Theme

## Theme Architecture

Theme files live in `src/theme/`:

- `palette.ts` — color tokens: `aubergine` (surface hierarchy), `accent` (brand colors), `textColors`, `feedback`, `line` (borders)
- `typography.ts` — font families (`fontFamilies.display`, `.body`, `.mono`) and variant definitions
- `tokens.ts` — `gradients`, `motion` (animation curves), `noise` (grain/dots SVG patterns), `radii`
- `augment.d.ts` — MUI module augmentation for custom palette/theme keys
- `overrides/` — per-component MUI style overrides (button, card, table, etc.)
- `theme.ts` — `createTheme()` assembly
- `index.ts` — barrel export

### Color Palette (Emerald direction)

- **Base**: `aubergine.base` (#0a0a10) — page background, true dark with slight indigo tint
- **Surface**: `aubergine.surface` (#14141e) — cards, sidebar, panels — violet-tinted dark
- **Elevated**: `aubergine.elevated` (#1e1e2a) — menus, dialogs, table headers
- **Hi**: `aubergine.hi` (#282836) — active/hover states
- **Primary accent**: `accent.sunset` (#10b981) — emerald green, buttons, links, active indicators
- **Secondary accent**: `accent.amber` (#22d3ee) — cyan, secondary highlights
- **Highlight**: `accent.violet` (#34d399) — lighter emerald for gradients, avatars

### Fonts

- **Display**: Bricolage Grotesque (`--font-bricolage`) — headings h1-h6
- **Body**: DM Sans (`--font-dm-sans`) — body text, buttons
- **Mono**: JetBrains Mono (`--font-jetbrains-mono`) — code, IDs, captions, overlines

## Component Hierarchy

### Layout Components (`src/components/layout/`)

- `app-shell.tsx` — flex container: sidebar + main. Manages collapsed/mobile state. Shows AppBar with hamburger on mobile (`< md`)
- `sidebar.tsx` — collapsible desktop sidebar (260px expanded, 68px collapsed). Hidden on mobile. Contains nav items, feedback menu, notification bell, user menu
- `mobile-nav.tsx` — full-width nav inside a temporary Drawer for mobile
- `nav-item.tsx` — sidebar link with icon, label, collapsed tooltip, active state
- `user-menu.tsx` — avatar trigger + dropdown with profile, settings, sign out
- `feedback-menu.tsx` — feedback icon + dropdown with "Report a bug" / "Feature request" (GitHub links)
- `notification-bell.tsx` — bell icon with badge, expanded/collapsed modes

### UI Primitives (`src/components/ui/`)

#### Layout

- `Surface` (`ui/layout/surface.tsx`) — primary card/panel. Two variants:
  - **quiet**: flat, border, used for data tables and content cards
  - **expressive**: grain overlay + gradient top edge, used for landing/hero/empty states
- `PageHeader` (`ui/layout/page-header.tsx`) — page-level title + description + actions row with bottom divider
- `SectionHeader` (`ui/layout/section-header.tsx`) — section title with optional overline, description, actions

#### Data Display

- `StatCard` (`ui/data/stat-card.tsx`) — metric tile with label, large mono value, optional trend
- `DataTable` (`ui/data/data-table.tsx`) — generic typed table inside Surface with skeleton loading and empty state
- `EmptyState` (`ui/data/empty-state.tsx`) — centered placeholder with icon, title, description, action

#### Display

- `UserAvatar` (`ui/display/user-avatar.tsx`) — reusable avatar with initials fallback. Props: `name`, `email`, `avatarUrl`, `size`, `sx`
- `MonoId` (`ui/display/mono-id.tsx`) — inline monospace identifier with optional copy button
- `StatusChip` (`ui/display/status-chip.tsx`) — colored chip for image/job states
- `CodeBlock` (`ui/display/code-block.tsx`) — monospace code display with copy button

## Usage Patterns

### Surface for wrapping tables

Always wrap `<Table>` in `<Surface padding={0}>` so tables get the card border and horizontal scroll:

```tsx
<Surface padding={0}>
  <Table>...</Table>
</Surface>
```

### DataTable for typed tables

Prefer `DataTable` over raw `<Table>` when the data is a typed array:

```tsx
<DataTable
  columns={[{ key: "name", header: "Name", render: (row) => <Typography>{row.name}</Typography> }]}
  rows={items}
  rowKey={(row) => row.id}
/>
```

### UserAvatar

Use `UserAvatar` instead of raw MUI `Avatar` for user representations:

```tsx
<UserAvatar name={user?.name} email={user?.email} size={34} />
```

### Grid for responsive layouts

Use MUI `Grid` with `size` prop for responsive grids, not raw CSS grid:

```tsx
<Grid container spacing={3}>
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>...</Grid>
</Grid>
```

### Responsive typography

Headings h1-h4 use `clamp()` for responsive sizing. Don't add manual font-size overrides for mobile — it's handled by the theme.

### Button text color

Contained buttons use dark text (#052e16) on emerald background, not white.
