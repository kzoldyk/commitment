# Implementation Plan: Migrate Shell and Dashboard to BoardUI Semantic Color Tokens

**Status**: Ready for Execution  
**Target Commit**: `ef49da240aa2a50f35b6c38ec161c85efa549f13`  
**Audited Surface**: Authenticated Dashboard Surface (`/dashboard` route via `MacOSWindowFrame` and `DashboardPage`)  
**Design Sources**: `AGENTS.md`, `.cursor/rules/boardui.mdc`, `src/styles/theme.css`

---

## 1. Problem Statement

The application shell ([`src/client/components/MacOSWindowFrame.tsx`](file:///Users/hiteshbhai.prajapati/Desktop/code/Github/commitment/src/client/components/MacOSWindowFrame.tsx)) and dashboard view ([`src/client/pages/DashboardPage.tsx`](file:///Users/hiteshbhai.prajapati/Desktop/code/Github/commitment/src/client/pages/DashboardPage.tsx)) bypass BoardUI's semantic token system. They hardcode hex color literals (`#f7f8f9`, `#0d0e12`, `#111827`, `#f2f3f5`, `#f4f5f6`, `#090a0d`, `#8a8f98`, `#626670`) and raw Tailwind palette utilities (`border-neutral-200`, `dark:border-white/[0.06]`, `bg-white`, `dark:bg-white/[0.02]`).

As a result:
- Dark mode overrides are hardcoded manually rather than flipping automatically via BoardUI semantic tokens.
- Surface and border colors do not adapt if brand accent or theme tokens change in `styles/theme.css`.
- The interface violates the documented contract in `AGENTS.md` ("Color: semantic tokens only").

---

## 2. Design Contract & Governing System

According to [`AGENTS.md`](file:///Users/hiteshbhai.prajapati/Desktop/code/Github/commitment/AGENTS.md) and [`.cursor/rules/boardui.mdc`](file:///Users/hiteshbhai.prajapati/Desktop/code/Github/commitment/.cursor/rules/boardui.mdc):
- **Surfaces**:
  - Page Ground: `bg-background-full` (replaces `bg-[#f7f8f9] dark:bg-[#0d0e12]`)
  - Primary Surface: `bg-background-primary-default`
  - Secondary Surface: `bg-background-secondary-default` (replaces `bg-[#f4f5f6] dark:bg-[#090a0d]` and `bg-white dark:bg-white/[0.02]`)
  - Hover Surface: `bg-background-secondary-hover` (replaces `hover:bg-neutral-200/50 dark:hover:bg-white/[0.06]`)
- **Borders & Dividers**:
  - Hairlines & separators: `border-separator-border` (replaces `border-neutral-200 dark:border-white/[0.06]` and `border-neutral-200 dark:border-white/[0.04]`)
  - Card/Panel borders: `border-border-button-default`
- **Text & Foreground**:
  - Primary: `text-text-primary` (replaces `text-[#111827] dark:text-[#f2f3f5]`)
  - Secondary: `text-text-secondary` (replaces `text-neutral-500 dark:text-[#8a8f98]`)
  - Tertiary / Muted: `text-text-tertiary` (replaces `text-neutral-400 dark:text-[#626670]`)

---

## 3. Step-by-Step Implementation

### Step 1: Update `src/client/components/MacOSWindowFrame.tsx`
1. **Outer Shell Container (Line 128)**:
   - *Target*: `className="w-full h-screen min-h-screen flex bg-[#f7f8f9] dark:bg-[#0d0e12] text-[#111827] dark:text-[#f2f3f5] overflow-hidden font-sans select-none antialiased"`
   - *Replacement*: `className="w-full h-screen min-h-screen flex bg-background-full text-text-primary overflow-hidden font-sans select-none antialiased"`
2. **Sidebar Aside (Line 131)**:
   - *Target*: `bg-[#f4f5f6] dark:bg-[#090a0d] border-r border-neutral-200 dark:border-white/[0.06]`
   - *Replacement*: `bg-background-secondary-default border-r border-separator-border`
3. **Sidebar Header & Dividers (Lines 137, 272)**:
   - *Target*: `border-b border-neutral-200 dark:border-white/[0.04]`, `border-t border-neutral-200 dark:border-white/[0.06]`
   - *Replacement*: `border-b border-separator-border`, `border-t border-separator-border`
4. **Sidebar Labels & Text (Lines 143, 177, 224, 277)**:
   - *Target*: `text-[#111827] dark:text-[#f2f3f5]`, `text-neutral-600 dark:text-[#8a8f98]`, `text-neutral-500 dark:text-[#626670]`
   - *Replacement*: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
5. **Main Canvas & Header (Lines 309, 311, 379)**:
   - *Target (Line 309)*: `className="flex-1 h-screen flex flex-col bg-[#f7f8f9] dark:bg-[#0d0e12] overflow-hidden"`
   - *Replacement*: `className="flex-1 h-screen flex flex-col bg-background-full overflow-hidden"`
   - *Target (Line 311)*: `className="h-11 border-b border-neutral-200 dark:border-white/[0.06] flex items-center justify-between px-4 sm:px-5 bg-[#f7f8f9] dark:bg-[#0d0e12] select-none shrink-0 z-20"`
   - *Replacement*: `className="h-11 border-b border-separator-border flex items-center justify-between px-4 sm:px-5 bg-background-full select-none shrink-0 z-20"`
   - *Target (Line 379)*: `className="flex-1 w-full overflow-y-auto bg-[#f7f8f9] dark:bg-[#0d0e12] text-[#111827] dark:text-[#f2f3f5]"`
   - *Replacement*: `className="flex-1 w-full overflow-y-auto bg-background-full text-text-primary"`

### Step 2: Update `src/client/pages/DashboardPage.tsx`
1. **Header Border & Headings (Lines 217, 219, 222)**:
   - *Target (Line 217)*: `border-b border-neutral-200 dark:border-white/[0.06]`
   - *Replacement*: `border-b border-separator-border`
   - *Target (Line 219)*: `text-[#111827] dark:text-[#f2f3f5]`
   - *Replacement*: `text-text-primary`
   - *Target (Line 222)*: `text-neutral-500 dark:text-[#8a8f98]` and `text-[#111827] dark:text-[#f2f3f5]`
   - *Replacement*: `text-text-secondary` and `text-text-primary`
2. **KPI Stats Cards (Lines 262, 271, 283, 295)**:
   - *Target*: `rounded-lg border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]`
   - *Replacement*: `rounded-2xl border border-border-button-default bg-background-secondary-default`
   - *Target labels*: `text-neutral-400 dark:text-[#626670]` -> `text-text-tertiary`
   - *Target values*: `text-[#111827] dark:text-[#f2f3f5]` -> `text-text-primary`
3. **Active Contracts List Cards (Line 398)**:
   - *Target*: `rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-neutral-300 dark:hover:border-white/[0.14]`
   - *Replacement*: `rounded-3xl border border-border-button-default bg-background-primary-default hover:border-border-button-hover hover:bg-background-primary-hover`
4. **Empty State Box (Line 368)**:
   - *Target*: `rounded-xl border border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]`
   - *Replacement*: `rounded-3xl border border-border-button-default bg-background-secondary-default`

---

## 4. Verification & Acceptance Criteria

1. **Token Grep Check**:
   - Run `grep -n "bg-\[#" src/client/components/MacOSWindowFrame.tsx src/client/pages/DashboardPage.tsx` -> Must return 0 hits.
   - Run `grep -n "border-neutral-200" src/client/components/MacOSWindowFrame.tsx src/client/pages/DashboardPage.tsx` -> Must return 0 hits.
2. **Build Verification**:
   - Run `bun run build` to ensure all Tailwind utilities resolve without compilation error.
3. **Visual Theme Toggle**:
   - Switch between light and dark themes using the theme toggle. Verify that surface grounds, sidebar, borders, and text colors automatically flip cleanly without unstyled white or black flashes.
