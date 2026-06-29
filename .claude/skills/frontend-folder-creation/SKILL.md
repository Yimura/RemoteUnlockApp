---
name: frontend-folder-creation
description: "Use when creating, organizing, renaming, or fixing feature folders, subfolders, kebab case files, or barrel exports in the React Native RemoteUnlock app's frontend feature directories."
---

# Feature Folder Structure (React Native RemoteUnlock)

Governs the feature-sliced folder layout used inside `frontend/features/` in this React Native app. Concerned with **where files go** and **how barrels are written** — not with business logic, navigation registration, or cross-feature code.

## Target feature layout

```
frontend/features/<feature>/
├── components/
│   ├── <kebab-case>.tsx
│   ├── ...
│   └── index.ts          ← barrel
├── hooks/                ← only if feature has hooks
│   ├── use-<name>.ts
│   └── index.ts          ← barrel
├── types/                ← only if needed
│   ├── <name>.ts
│   └── index.ts          ← barrel
└── utils/                ← only if needed
    ├── <name>.ts
    └── index.ts          ← barrel
```

Sub-folders exist **only when they have content**. An empty `hooks/` directory should not exist.

## Sub-folder semantics

| Sub-folder | Contents |
|---|---|
| `components/` | React components (`.tsx`). PascalCase exports, kebab-case file names. |
| `hooks/` | Feature-local hooks (local state, derived values, side effects, thin wrappers over BLE I/O). Only when the feature has any. |
| `types/` | Types shared across more than one file in the feature. Types used by a single component stay in that component. |
| `utils/` | Pure helper functions. |

Anything genuinely cross-feature (used by multiple features) does **not** belong in a feature folder — cross-feature primitives live in `frontend/components/` (organized by category: `core/`, `text/`, `device/`, `settings/`). Ask before placing such code.

## Reference layout

The `pairing` feature shows a realistic layout with components, feature-local sub-screens, and stores:

```
frontend/features/pairing/
├── components/
│   ├── pair-container.tsx
│   ├── scanned-device.tsx
│   ├── forced-loader.tsx
│   └── index.ts
├── pages/             ← feature-local sub-screen components used by the wizard
│   ├── welcome.tsx
│   ├── ...
│   └── index.ts
├── stores/
│   ├── pair-device-store.ts
│   └── index.ts
└── pair-device-page.tsx
```

Note: the project predates this skill; current PascalCase filenames are NOT yet conforming — new and renamed files follow kebab-case.

Each barrel uses **named** re-exports — never `export *`:

```ts
// components/index.ts
export { ForcedLoader } from './forced-loader';
export { PairContainer } from './pair-container';
export { ScannedDevice } from './scanned-device';
```

```ts
// stores/index.ts
export { usePairDeviceStore } from './pair-device-store';
```

If a file exports both a value and a type, list both in a single re-export line:

```ts
export { type PairDeviceState, usePairDeviceStore } from './pair-device-store';
```

## Rules

Non-negotiable rules; the rest is judgment.

1. **Barrels use named re-exports only.** Never `export *`. Reason: explicit re-exports make the public surface of a feature reviewable at a glance, prevent accidental leakage of helpers, and keep tree-shaking honest. If a file has multiple exports, list each one by name.
2. **Kebab-case file names** (`pair-container.tsx`, `use-paired-device.ts`). Component / hook names inside the file stay PascalCase / camelCase.
3. **Co-located sub-folders only when populated.** Don't scaffold empty `hooks/`, `types/`, or `utils/` folders "just in case".
4. **Imports inside the feature** reference sibling files directly (`./pair-container`), not through the barrel — barrels are for consumers outside the feature.
5. **Consumers outside the feature import from the barrel**, not from deep paths: `import { PairContainer } from '@/features/pairing/components'`, not `from '@/features/pairing/components/pair-container'`.
6. **One feature per task.** When scaffolding or restructuring, work on a single feature unless explicitly asked otherwise. Cross-feature edits entangle imports and balloon the diff.
7. **Don't place navigator/screen-registration code in a feature folder.** Screens are exported from the feature's barrel and registered in `frontend/Navigator.tsx` / `frontend/Routes.ts`.
8. **Don't place cross-feature code in a feature folder.** If something is used by multiple features, it belongs in `frontend/components/` under the appropriate category.

## Step-by-step: creating or extending a feature folder

When asked to scaffold a new feature or add/move files within an existing one, follow this sequence. The reasoning behind each step is given so judgment calls in unusual cases can be made coherently.

### 1. Classify each file

For every file involved, decide its destination sub-folder using the semantics table. The common ambiguity:

- **`use-*` files**: any feature-local hook (local state, derived values, side effects, thin BLE wrappers) goes to `hooks/`.

### 2. Plan, then write

Before creating files, list the planned target layout (file → destination) back to the user. Wait for confirmation on anything non-obvious. Avoids re-doing the layout.

### 3. Write or update barrels

For every sub-folder that ends up with files, write an `index.ts` that re-exports every public symbol by name. Sort entries alphabetically by export name for diffability.

For files that export both values and types, use a single `export { type Foo, useFoo } from './use-foo'` line. Don't split into two re-export statements.

### 4. Verify

Run `npx tsc --noEmit` from the project root, then `npm run lint`. Fix any broken imports before reporting done.

A barrel re-exporting a name that doesn't exist (typo, renamed export) is caught by the type check. Always run it.

## Barrel template

```ts
// components/index.ts
export { ComponentA } from './component-a';
export { ComponentB } from './component-b';
export { type SomePropsType } from './component-c';
export { ComponentC } from './component-c';
```

Combined when same source file:

```ts
export { type FooState, useFooStore } from './foo-store';
```

## When in doubt

- **Nested sub-folders inside `components/`**: flatten by default. Only keep a sub-grouping if the feature is large enough that flattening produces 20+ files in one directory, and confirm with the user first.
- **Component used by this feature and one other:** leave it in `frontend/components/` (under the appropriate category sub-folder); do not re-export through either feature's barrel. If unsure, ask.
- **Types used only inside one component:** keep them in that component file; no need to extract to `types/`.
- **Data access (BLE I/O):** BLE GATT services and the `RemoteUnlockDevice` wrapper live under `frontend/ble/` at the project root, not per-feature. Feature folders should NOT contain an `api/` sub-folder. If a feature needs a thin wrapper over a BLE call, place it in `hooks/` — the wrapper IS the hook.
- **Feature-local `pages/` sub-folder:** allowed when a feature owns multiple sub-screen components that aren't reusable UI primitives (e.g., wizard steps, as in `pairing`). Not for top-level navigable screens registered in `Navigator.tsx` — those stay at the feature root.

## Out of scope

Navigator/route registration (`frontend/Navigator.tsx`, `frontend/Routes.ts`), runtime auth, middleware, styling decisions, and business-logic rewrites. Folder structure and barrels only.
