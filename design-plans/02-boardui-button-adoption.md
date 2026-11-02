# Implementation Plan: Replace Hand-built Action Buttons with BoardUI Button Primitives

**Status**: Ready for Execution  
**Target Commit**: `ef49da240aa2a50f35b6c38ec161c85efa549f13`  
**Audited Surface**: Dashboard Actions & Trigger Buttons (`DashboardPage.tsx`)  
**Design Sources**: `AGENTS.md`, `.cursor/rules/boardui.mdc`, `src/components/base/buttons/button.tsx`

---

## 1. Problem Statement

Buttons on the Dashboard ([`src/client/pages/DashboardPage.tsx`](file:///Users/hiteshbhai.prajapati/Desktop/code/Github/commitment/src/client/pages/DashboardPage.tsx)) currently use custom stylesheet classes (`mac-btn-primary`, `mac-btn-secondary` from `index.css`) with hardcoded padding, font-size overrides, and inline rendered Lucide SVG icons (`<Plus size={14} />`, `<RefreshCw size={13} />`, `<Check size={13} />`).

This violates:
1. **Component First**: An installed BoardUI component exists at `@/components/base/buttons/button` with established variants (`primary`, `secondary`, `ghost`, `danger`) and sizes (`medium`, `small`, `xs`).
2. **Iconography Standard**: `AGENTS.md` mandates `@remixicon/react` icons passed as component references (`leadingIcon={RiAddLine}`) rather than inline JSX elements.
3. **Accessibility & States**: Hand-rolled classes lack BoardUI's uniform focus ring (`focus-visible:ring-2 focus-visible:ring-border-focus-ring`) and disabled styles.

---

## 2. Design Contract & Governing System

- **Component Path**: `import { Button } from "@/components/base/buttons/button";`
- **Icon Library**: `import { RiAddLine, RiRefreshLine, RiCheckLine, RiCloseLine } from "@remixicon/react";`
- **Variant Mapping**:
  - Main actions ("New contract", "Accept contract", "Log proof"): `variant="primary"`
  - Secondary/utility actions ("Run evaluation", "Decline"): `variant="secondary"`
- **Sizing**: `size="small"` (matches 32px height standard for toolbars and table rows)
- **Navigation Buttons**: When linking across routes (e.g. to `/create`), wrap `Button` in `react-router-dom`'s `<Link to="...">` or use programmatic navigation.

---

## 3. Step-by-Step Implementation in `src/client/pages/DashboardPage.tsx`

### Step 1: Add Imports
At the top of `src/client/pages/DashboardPage.tsx`:
```tsx
import { Button } from '@/components/base/buttons/button';
import {
  RiAddLine,
  RiRefreshLine,
  RiCheckLine,
  RiCloseLine,
  RiCheckboxCircleLine,
} from '@remixicon/react';
```

### Step 2: Replace Top Actions (Lines 232–250)
*Target*:
```tsx
<button
  type="button"
  onClick={handleRunEvaluation}
  disabled={evaluating}
  className="mac-btn-secondary !text-xs !py-1.5 !px-3 font-mono cursor-pointer"
  title="Trigger scheduled evaluation check for closed periods"
>
  <RefreshCw size={13} className={evaluating ? 'animate-spin text-amber-500' : 'text-neutral-400 dark:text-[#626670]'} />
  <span>{evaluating ? 'Evaluating...' : 'Run evaluation'}</span>
</button>

<Link
  to="/create"
  className="mac-btn-primary !text-xs !py-1.5 !px-3.5 font-medium cursor-pointer"
>
  <Plus size={14} />
  <span>New contract</span>
</Link>
```

*Replacement*:
```tsx
<Button
  variant="secondary"
  size="small"
  onClick={handleRunEvaluation}
  disabled={evaluating}
  leadingIcon={RiRefreshLine}
  title="Trigger scheduled evaluation check for closed periods"
>
  {evaluating ? 'Evaluating...' : 'Run evaluation'}
</Button>

<Link to="/create">
  <Button
    variant="primary"
    size="small"
    leadingIcon={RiAddLine}
  >
    New contract
  </Button>
</Link>
```

### Step 3: Replace Invitation Action Triggers (Lines 334–350)
*Target*:
```tsx
<button
  type="button"
  onClick={() => handleAccept(invite.id)}
  className="mac-btn-primary !text-xs !py-1.5 !flex-1 font-medium cursor-pointer"
>
  <Check size={13} />
  <span>Accept contract</span>
</button>
<button
  type="button"
  onClick={() => handleDecline(invite.id)}
  className="mac-btn-secondary !text-xs !py-1.5 !px-3.5 font-medium cursor-pointer"
>
  <span>Decline</span>
</button>
```

*Replacement*:
```tsx
<Button
  variant="primary"
  size="small"
  className="flex-1"
  leadingIcon={RiCheckLine}
  onClick={() => handleAccept(invite.id)}
>
  Accept contract
</Button>
<Button
  variant="secondary"
  size="small"
  onClick={() => handleDecline(invite.id)}
>
  Decline
</Button>
```

### Step 4: Replace Contract Card "Log proof" Trigger (Lines 486–493)
*Target*:
```tsx
<button
  type="button"
  onClick={() => setSelectedProofDay({ day: today, commitment: c })}
  className="mac-btn-primary !text-xs !py-1 !px-2.5 font-medium cursor-pointer"
>
  <CheckCircle2 size={12} />
  <span>Log proof</span>
</button>
```

*Replacement*:
```tsx
<Button
  variant="primary"
  size="xs"
  leadingIcon={RiCheckboxCircleLine}
  onClick={() => setSelectedProofDay({ day: today, commitment: c })}
>
  Log proof
</Button>
```

### Step 5: Replace Empty State Button (Lines 374–380)
*Target*:
```tsx
<Link
  to="/create"
  className="mac-btn-primary !py-2 !px-4 text-xs font-semibold"
>
  <Plus size={14} />
  <span>Forge first covenant</span>
</Link>
```

*Replacement*:
```tsx
<Link to="/create">
  <Button
    variant="primary"
    size="medium"
    leadingIcon={RiAddLine}
  >
    Forge first covenant
  </Button>
</Link>
```

---

## 4. Verification & Acceptance Criteria

1. **Class Purge Check**:
   - Run `grep -n "mac-btn-" src/client/pages/DashboardPage.tsx` -> Must return 0 hits.
2. **Keyboard Navigation & Focus Ring**:
   - Tab through the dashboard action buttons using the keyboard. Ensure the BoardUI focus ring (`ring-border-focus-ring`) renders clearly around each button.
3. **Type and Build Check**:
   - Run `bun run build` to verify type safety and import correctness for `@remixicon/react` and `@/components/base/buttons/button`.
