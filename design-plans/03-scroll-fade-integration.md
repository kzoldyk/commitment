# Implementation Plan: Add ScrollFade Progressive Top Blur to MacOSWindowFrame Workspace

**Status**: Ready for Execution  
**Target Commit**: `ef49da240aa2a50f35b6c38ec161c85efa549f13`  
**Audited Surface**: Workspace Scroll Container (`MacOSWindowFrame.tsx`)  
**Design Sources**: `AGENTS.md`, `.cursor/rules/boardui.mdc`, `src/components/foundations/scroll-fade/scroll-fade.tsx`

---

## 1. Problem Statement

In [`src/client/components/MacOSWindowFrame.tsx`](file:///Users/hiteshbhai.prajapati/Desktop/code/Github/commitment/src/client/components/MacOSWindowFrame.tsx), the main scrollable body (`<main className="flex-1 w-full overflow-y-auto ...">`) meets the fixed top header (`<header className="h-11 border-b ...">`) with an unsoftened hard clip. When the user scrolls cards and dashboard sections upward, text and elements cut off sharply against the border.

This violates the mechanics rule in `AGENTS.md`:
> *"Internal vertical scroll regions must soften the top edge with a progressive blur and surface fade once scrolled, rather than sharply clipping content. Keep headers outside the scroll region. ... The scroll-fade registry item ships this recipe as ScrollFade + useScrollFade (@/components/foundations/scroll-fade/scroll-fade); reuse it rather than rebuilding the layers."*

---

## 2. Design Contract & Governing System

- **Component & Hook**:
  ```tsx
  import { ScrollFade, useScrollFade } from '@/components/foundations/scroll-fade/scroll-fade';
  ```
- **Structure**:
  - The scroller needs a `relative min-h-0 flex-1` outer wrapper.
  - The stationary `<ScrollFade>` overlay sits inside the relative wrapper, outside the scrolling element itself (so it does not scroll with content).
  - The scroll progress hook `useScrollFade()` binds to `onScroll={fade.onScroll}` on `<main>`.
  - The surface wash gradient matches the enclosing background token: `surfaceClassName="from-background-full"`.

---

## 3. Step-by-Step Implementation in `src/client/components/MacOSWindowFrame.tsx`

### Step 1: Add Import
At top of `src/client/components/MacOSWindowFrame.tsx`:
```tsx
import { ScrollFade, useScrollFade } from '@/components/foundations/scroll-fade/scroll-fade';
```

### Step 2: Initialize Hook
Inside the `MacOSWindowFrame` component definition (near other hooks, e.g. around line 45):
```tsx
const fade = useScrollFade();
```

### Step 3: Wrap `<main>` and Attach Fade Overlay (Lines 378–381)
*Target*:
```tsx
{/* Main Scrollable Workspace Body */}
<main className="flex-1 w-full overflow-y-auto bg-[#f7f8f9] dark:bg-[#0d0e12] text-[#111827] dark:text-[#f2f3f5]">
  {children}
</main>
```

*Replacement*:
```tsx
{/* Main Scrollable Workspace Body */}
<div className="relative min-h-0 flex-1">
  <main
    onScroll={fade.onScroll}
    className="h-full w-full overflow-y-auto bg-background-full text-text-primary"
  >
    {children}
  </main>
  <ScrollFade
    progress={fade.progress}
    surfaceClassName="from-background-full"
  />
</div>
```

---

## 4. Verification & Acceptance Criteria

1. **Resting State (ScrollTop = 0)**:
   - On initial page load or when scrolled to the top, the overlay opacity must be 0 (no visible blur or wash).
2. **Scrolled State**:
   - Scroll the dashboard content down. Over the first 24px of scroll, the top edge must progressively fade in a 1px masked blur, a 4px blur, and the `from-background-full` gradient, smoothly obscuring content as it slips under the header.
3. **Pointer Events & Accessibility**:
   - The overlay must remain `pointer-events-none` so clicking or selecting text directly under the top 24px is unhindered.
4. **Build Check**:
   - Run `bun run build` to confirm zero TypeScript compilation errors.
