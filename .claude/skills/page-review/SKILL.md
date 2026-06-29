---
name: page-review
description: "Use when reviewing, auditing, checking, verifying, or sanity checking a page, feature folder, or PR area in the RemoteUnlockApp React Native app for folder, hook, component, and architecture conventions."
---

# Page / Feature Review

Audits a page or feature in this React Native app against the architectural conventions encoded in the project's frontend sub-skills. Produces a punch list — the user (or another agent) fixes the items afterward. Reviewing and editing in the same pass tangles the deltas, so this skill does **not** auto-fix.

The review is structured by dimension (folder, hooks, components, cross-cutting). Each dimension delegates to a sub-skill that already owns the rules. Read the sub-skill when a check is ambiguous; do not re-derive rules from memory — they evolve.

## Sub-skills consulted

| Dimension | Skill |
|---|---|
| Folder layout, sub-folders, barrels | `frontend-folder-creation` |
| React components | `frontend-component-creation` |
| Custom hooks (all kinds — there's no separate API-hook skill in this project) | `react-custom-hook` |
| Function-shape, nesting, branching, complexity | `maintainable-code` |

This project doesn't use TanStack Query/Form/Router. Data access is BLE-only; forms are bare TextInput + useState; wizards are custom-context (see the pairing feature's `Paginator`). When reviewing such code, judge against the component and hook skills rather than skipping the review.

## When this skill triggers

Two paths:

1. **Explicit ask** — user says review / audit / check / verify / "is this right".
2. **Implicit, after page work** — user has just finished editing a page or feature (new feature, new component, new hook, PR-ready). Run the review proactively and surface the punch list; the user can ignore it or act on it.

The skill is cheap: it's read-only. Running it after every page edit catches drift early.

## Scope

A single page or feature. A "feature" is one folder under `frontend/features/<name>/`. A feature also has one or more screens registered in `frontend/Navigator.tsx` / `frontend/Routes.ts`. Glance at those registrations to confirm the screen is wired correctly, but the review's main subject is the feature folder itself. If asked to review "the whole app" or multiple unrelated features, decompose into per-feature reviews and ask which to prioritize.

## Workflow

### 1. Map the scope

Identify the target. Common inputs and how to resolve them:

- Feature name (`"my-vehicles"`) → `frontend/features/my-vehicles/` plus its registration in `frontend/Navigator.tsx` / `frontend/Routes.ts`.
- Screen name → matching feature folder it pulls from.
- Recent edits → look at `git status` / `git diff` and review the touched feature(s).

Read all files in the feature folder and skim the matching navigation registrations. The review is structural, not behavioural — line counts and import shapes matter as much as the logic.

### 2. Folder structure

Invoke `frontend-folder-creation` rules. Check:

- Feature lives under `frontend/features/<feature>/`. No stray files at `frontend/features/` root.
- Sub-folders only when populated. No empty `hooks/` / `stores/` / `pages/` / `components/`.
- File names kebab-case (`use-ble-device-scan.ts`, `device-card.tsx`).
- Every populated sub-folder has an `index.ts` (or `index.tsx`) barrel where the project convention calls for one.
- Barrels use **named** re-exports only — never `export *`.
- Sibling files inside the feature import each other directly (`./device-card`), not through the barrel.
- Consumers outside the feature import from the barrel, not deep paths.
- `use-*` files live under the feature's `hooks/` (or a shared `frontend/hooks/`). A feature's `hooks/` is the right home for thin wrappers over BLE calls — there is no `api/` sub-folder; BLE I/O lives at the root in `frontend/ble/`.

Flag: `export *` barrels, missing barrels, empty sub-folders, deep imports of sibling-feature internals, mis-classified `use-*` files, casing drift.

### 3. Components (`components/` folder)

Invoke `frontend-component-creation` rules. Per file:

- One component per file. No in-file helper components — extract even small ones.
- `<Name>Props` type at top, non-exported.
- `export const Name = (props: Props) => { ... }` arrow form. Generics: `export const Name = <T,>() => {}`.
- Bare-adjective boolean props (`disabled`, not `isDisabled`).
- Native event handler types where applicable (e.g. `(event: GestureResponderEvent) => void` for `onPress`), not `(e: any) => void`.
- `PropsWithChildren` for children.
- No data fetching / BLE I/O in render — must go through a hook in `hooks/` or an event handler.
- No long inline effects — extract via `react-custom-hook` into `hooks/`.
- No mutation of props / state / hook returns / values passed via JSX.
- Hooks called only at top level (not inside `if`/`map`/`&&`/callbacks/early-return branches).
- Prop drilling through >1 intermediate layer → context or a Zustand store, not more drilling.

Reuse-and-split review:

- Anything reimplementing a pattern that exists in another feature (cards, list rows, headers, paginators)? → copy the structure, or promote to a shared `frontend/components/` location if 2+ consumers.
- Big components doing several jobs (header + list + filters + modal in one file)? → split. Common smell: a file >200 lines.
- BLE write/read logic inlined in `onPress` instead of going through a hook in `hooks/`.

Flag: in-file helper components, `(e: any) =>`, `isDisabled`/`isOpen` prop names, BLE/data access inside the component body, hooks behind conditionals, long monolithic component files.

### 4. Custom hooks (`hooks/` folder)

If present, invoke `react-custom-hook`:

- Kebab-case file, camelCase `use<Name>` export, arrow form, one hook per file.
- `Use<Name>Options` / `Use<Name>Return` types non-exported at top.
- Rules of React: top-level only, never inside `if`/`for`/`&&`/callbacks/early-return branches. Inside React functions or other custom hooks only.
- Effects: cleanup paired with subscription, deps complete, conditional logic *inside* the effect (not around the `useEffect` call).
- Return shape: object with stable identity when >1 value; tuple only for `useState`-shaped pairs.
- Memoization on returned callbacks/objects when consumers depend on identity.
- Composes via the singleton `BLEService` / Zustand store hooks / context hooks. Does not read module globals directly.
- Never mutates arguments or returned values.
- Used by ≥2 features → flag for promotion to a shared `frontend/hooks/` location.

Flag: hooks behind conditionals, missing cleanup, incomplete deps, conditional `useEffect` calls, identity-unstable returns where stability matters, hook duplicated across features that should live in `frontend/hooks/`.

### 5. Function-shape / complexity

Invoke `maintainable-code` over the feature's files:

- Nesting depth, branching, and function length — flag the worst offenders with file:line.
- Early returns favored over deep `else` chains.
- Functions that do several jobs broken into smaller named helpers.

### 6. RN-specific checks (cross-cutting)

- `eslint-disable-next-line react-hooks/exhaustive-deps` — every occurrence is a smell. The review should call them out individually with the file:line.
- Effects that `await` async work without a cleanup that handles the in-flight result (race conditions across screen focus/blur).
- `useEffect(() => { something(); }, [])` mount effects that should use `useOnForegroundFocus` (from `frontend/hooks/OnFocus.ts`) for screen-resume correctness.
- `console.error` in catch blocks that swallow errors — call out if there's no user-visible feedback path.
- Direct `BLEService` calls inside component bodies — these should be in hooks (so deps and cleanup are explicit) or in event handlers (one-shot fire is fine), not at the top of a render.

### 7. Verify and report

Page-review is read-only and does not auto-fix; it produces a punch list. Optionally run the type check and lint before producing it, so any structural issue that breaks typing or linting surfaces too:

```bash
npx tsc --noEmit
npm run lint
```

Any type or lint error is itself a review item.

## Output format

Group strictly by dimension. Each entry: file path + concrete fix. No essays, no general advice.

```
# <feature> review

## Folder structure
- `features/<feature>/components/index.ts` uses `export *` — switch to named re-exports.
- `features/<feature>/hooks/` is empty — delete the folder.

## Components
- `features/<feature>/components/<feature>-page.tsx` (320 lines) bundles header, filters, list, dialog — split into `<feature>-header.tsx`, `<feature>-filters.tsx`, `<feature>-list.tsx`, plus modal in its own file.
- `features/<feature>/components/device-card.tsx` defines a `Row` component inside the same file — extract to `device-card-row.tsx`.

## Custom hooks
- `features/<feature>/hooks/use-ble-device-scan.ts` returns a fresh object each render — wrap return in `useMemo` so consumers don't re-render unnecessarily.

## Function-shape / complexity
- `features/<feature>/components/<feature>-page.tsx:120` nests four levels deep inside an effect — extract the inner work into a named helper.

## RN-specific
- `features/<feature>/components/device-card.tsx:42` uses `eslint-disable-next-line react-hooks/exhaustive-deps` — capture the value via a ref or include the dep.
- `features/<feature>/<feature>-page.tsx:18` runs `useEffect(() => { scan(); }, [])` — use `useOnForegroundFocus` so a re-focus re-scans.
- `features/<feature>/components/<feature>-page.tsx:88` calls `BLEService.write(...)` directly in the render body — move into a hook or an event handler.

## Cross-cutting
- `npx tsc --noEmit` fails in `use-ble-device-scan.ts` — return type widens to `unknown` because the generic isn't constrained.
```

Keep each entry small enough that the user (or follow-up agent) can fix it in one edit. Reorder fixes within a section by blast radius: structural moves (extract / split / rename) first, then content fixes (types, naming), then cosmetic (formatting, casing).

## After the review

If the user asks "now fix these", do not bundle review + fix in one pass. Either:

- Invoke the relevant sub-skill per item and apply fixes, or
- Hand the punch list back as a plan and execute it as a separate task.

This keeps the diff per-fix tractable and the review trail clean.

## Out of scope

- Functional correctness / business-logic bugs. The review is structural — broken logic isn't this skill's concern.
- Test coverage. No test infra is enforced via the sub-skills; flag missing tests only if the user asked for them.
- Performance tuning beyond memoization issues that affect React identity.
- Visual / UX parity with another app.
