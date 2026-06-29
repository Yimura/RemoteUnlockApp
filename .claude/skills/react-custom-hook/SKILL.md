---
name: react-custom-hook
description: "Use when adding, extracting, refactoring, or fixing React custom hooks in this React Native app (cross-cutting `frontend/hooks/` or feature-scoped `frontend/features/<f>/hooks/`), including hook file shape, Rules of React, effect discipline, stable returns, and promotion to cross-cutting hooks."
---

# React Custom Hook

Governs the **shape and content** of a custom React hook file in this React Native app (cross-cutting `frontend/hooks/` and feature-scoped `frontend/features/<f>/hooks/`). Concerned with how the hook is written — single concern, top-level call sites, stable returns, clean effects — not where the folder sits (see `frontend-folder-creation`).

The reasoning behind each rule is given so judgment calls in unusual cases can be made coherently. Don't treat the rules as ALWAYS/NEVER mantras — understand why.

## What this skill covers

This skill governs all custom hooks in the React Native app. There is no separate API-hook skill because there's no HTTP API client — the data source is BLE via `BLEService` and `RemoteUnlockDevice` instances. Hooks that wrap a BLE call live alongside other hooks (either in `frontend/hooks/` if cross-cutting, or in `frontend/features/<f>/hooks/` if feature-scoped). They follow the same shape as any other hook in this skill.

## File shape

A canonical hook file looks like this:

```ts
import { useEffect, useState } from 'react';

type UseAutoSaveOptions = {
    delayMs?: number;
    onSave: (value: string) => Promise<void>;
};

type UseAutoSaveReturn = {
    value: string;
    setValue: (next: string) => void;
    isSaving: boolean;
};

export const useAutoSave = ({ delayMs = 500, onSave }: UseAutoSaveOptions): UseAutoSaveReturn => {
    const [value, setValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!value) return;
        const handle = setTimeout(async () => {
            setIsSaving(true);
            try {
                await onSave(value);
            } finally {
                setIsSaving(false);
            }
        }, delayMs);
        return () => clearTimeout(handle);
    }, [value, delayMs, onSave]);

    return { value, setValue, isSaving };
};
```

Fixed elements:

1. **File name** is kebab-case and starts with `use-`: `use-auto-save.ts`. Reason: makes greppability uniform. Note: existing files like `frontend/hooks/Navigation.ts` and `frontend/hooks/OnFocus.ts` predate this rule; new and renamed files follow it.
2. **Export name** is camelCase and matches the file: `useAutoSave`. The `use` prefix is what tells React (and the linter) this is a hook — without it, the Rules-of-Hooks check is silently disabled.
3. **`export const useName = (...) => {...}`** arrow form. Same form as components — keeps the codebase grep uniform. Never use a function declaration (`function useName()`).
4. **One hook per file.** A file may contain *internal* helper functions (pure utilities, type guards) but **must not** export a second hook. Reason: a hook is a reuse and test boundary. The moment a second consumer appears, it's already entangled with the first hook's imports and dependencies. Counter-example in the current code: `frontend/hooks/Navigation.ts` packs two hooks (`useBottomNavigation`, `useRootNavigation`) into one file — when these are touched next, split them into `use-bottom-navigation.ts` and `use-root-navigation.ts`.
5. **Types named `Use<Name>Options` and `Use<Name>Return`, non-exported, at the top.** Use `Options` even when there's a single positional argument that isn't an options bag (then the type is the argument's type, named per its meaning — see below). Reason: the option / return shapes are implementation details of the hook. Consumers that need them should derive: `Parameters<typeof useAutoSave>[0]`, `ReturnType<typeof useAutoSave>`.
6. **Default export is forbidden.** Named exports only — barrel re-exports stay honest and grep-able.
7. **Use `.ts`, never `.tsx`**, unless the hook genuinely returns JSX (rare; usually means the abstraction should be a component instead).

### Single-argument hooks

When the hook takes a single non-options scalar, type it by its meaning, not as an options bag:

```ts
export const useElementOnScreen = (ref: RefObject<HTMLElement | null>): boolean => {
    // ...
};
```

When the hook takes 2+ inputs, wrap them in an options object — positional arguments past one quickly become a memorization tax at call sites.

## Return-shape conventions

The return shape is part of the hook's API; small inconsistencies here cause large pain at call sites.

| Hook returns | Use this shape | Why |
|---|---|---|
| Nothing (effect-only) | `void` | No state to expose. |
| Single value | Bare value | `const isOnScreen = useElementOnScreen(ref)` reads clearly. |
| State + setter pair (mirrors `useState`) | Tuple `[value, setValue]` | Lets callers rename freely; matches React's own convention. |
| Anything else (≥2 values, or a value plus actions) | Object | Names are stable, callers don't memorize positions, additions don't reorder existing call sites. |

Always type the return explicitly (`: UseFooReturn` or `: boolean`). Reason: a hook's return is its public contract. Inferred returns let an internal change silently widen the type and break call sites at distance.

## Stable identity in returns

Anything in the returned object that callers will put in a dependency array (an effect dep, another `useMemo` dep, a closure inside `useEffect` that re-runs whenever the returned callback's identity changes) needs stable identity unless the underlying value actually changed. Otherwise a downstream effect re-runs every render and the bug is invisible until performance degrades.

- **Returned callbacks**: wrap in `useCallback` with correct deps.
- **Returned objects/arrays built inline**: wrap in `useMemo` *if* the consumer is likely to use them as a dep; otherwise leave alone — premature `useMemo` adds noise.
- **The return object itself**: needs `useMemo` only when consumers spread it into something dep-tracked.

```ts
return useMemo<UseFooReturn>(
    () => ({
        value,
        update: (next: number) => setValue(next),
        reset: () => setValue(0),
    }),
    [value],
);
```

Don't reflexively `useMemo` everything. The test is: would a caller put this in a dep array? If not, skip it.

## Rules of React (mandatory for hooks)

These aren't style preferences — breaking them produces bugs that lint catches some but not all of.

### Hooks at the top level only

No hooks inside `if`, `for`, `&&`, `switch`, callbacks, early-return branches, or nested functions. The hook count and order must be identical on every render.

```ts
// 🔴 conditional call
export const useThing = (enabled: boolean) => {
    if (enabled) {
        const [x, setX] = useState(0);  // breaks
        return x;
    }
    return null;
};

// 🟢 conditionalize the argument, not the call
export const useThing = (enabled: boolean) => {
    const [x, setX] = useState(0);
    return enabled ? x : null;
};

// 🟢 or conditionalize *inside* an effect, leaving the useEffect call at top level
export const useSubscribe = (channel: string | null) => {
    useEffect(() => {
        if (!channel) return;
        const sub = subscribe(channel);
        return () => sub.unsubscribe();
    }, [channel]);
};
```

### Only inside React functions

Custom hooks may only be called from components or from other custom hooks. **Never from plain utility functions.** If a plain function needs to call a hook, restructure: the function becomes a hook (rename to `useFoo`) or its callers do the hook call and pass the result in.

### Never call a component as a function

`<Foo />`, not `Foo()`. Calling as a function breaks identity, state ownership, and concurrent rendering — even when the component "looks pure". This applies inside hooks too.

### Never pass a hook around as a value

A hook must be called textually in a component or another hook — not stored in a variable, not passed to another function, not stuffed in an object. The Rules-of-Hooks lint relies on this textual presence.

### Pure / idempotent

The hook body must be pure: same inputs (props + state + context) → same outputs. No side effects during render. The familiar non-idempotent traps apply just as they do in components:

```ts
// 🔴 new value every render
const id = crypto.randomUUID();
// 🔴 reads moving target
const now = new Date();
// 🔴 module-scope mutation
items.push(...);
```

If the value is time-dependent or random, initialize it once in state:

```ts
const [id] = useState(() => crypto.randomUUID());
```

If you need to sync to something external (subscription, interval, BLE listener, `AppState`), put it in `useEffect`.

### Never mutate

- **Arguments**: treat as immutable. Mutating an argument breaks memoization in the caller — the caller assumes the value it passed is unchanged. If you need a derived shape, copy it (`const next = { ...input }`).
- **Returned values**: same logic in reverse — consumers may put returns into deps; mutating them after the fact invalidates that.
- **State**: only via the setter; `state.x = y` is forbidden.
- **JSX-passed values** (rare in hooks, but applies if your hook renders): React may have eagerly read it; re-derive instead of mutating.

## Effect discipline

`useEffect` is where most hook bugs live. The patterns that keep effects honest:

### Co-locate setup and cleanup

Whatever the effect creates (subscription, timer, listener, BLE notification), the cleanup returned from the effect tears down. If the effect can't tear something down, you're using the wrong primitive — likely the work belongs outside React.

```ts
useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
        // ...
    });
    return () => sub.remove();
}, []);
```

`frontend/hooks/OnFocus.ts` (`useOnForegroundFocus`) is the in-repo reference for this pattern — subscribe in the effect, remove in cleanup.

### Conditional inside, not outside

Don't wrap `useEffect` in `if`. Put the condition inside the effect body and return early. This keeps the hook count constant across renders.

```ts
// 🟢
useEffect(() => {
    if (!enabled) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
}, [enabled]);
```

### Dependency arrays are complete

Every value from the component scope (props, state, derived values, functions defined in the body) that the effect reads goes in the deps array. The `react-hooks/exhaustive-deps` ESLint rule (currently set to `warn`) flags missing ones. Because it's `warn`, it's possible to silence with `// eslint-disable-next-line react-hooks/exhaustive-deps` — and `useOnForegroundFocus` does exactly that — but reaching for the disable is the smell, not the silencing tool. Fix the deps, or move the value out (into `useRef` if it must not retrigger the effect, into a `useCallback` if it's a callback you receive).

### Don't fight the dep array with refs

The pattern of "stuff this in a `useRef` so it isn't a dep" is occasionally correct (latest-callback ref for an interval) but more often hides a real dep. Apply only when the value being mutable is the actual semantics — e.g., you genuinely want the latest callback, not the one captured when the effect ran.

### One effect, one concern

An effect that does two unrelated things on the same deps is two effects sharing infrastructure. Split them. Reason: independent setup/cleanup logic is easier to read and easier to delete when one half goes away.

## Composition: never read globals; consume context hooks

A hook that needs app-wide state or services consumes the existing hook — not a global import — wherever one exists.

```ts
// 🟢
const { devices, refresh } = useDeviceStore();
const navigation = useRootNavigation();
```

Zustand stores (`useDeviceStore` in `frontend/stores/deviceStore.ts`, per-feature stores under `frontend/features/<f>/stores/`) are the composition pattern in this project — they're consumed directly like context hooks. Treat them as such for the purpose of "never read globals."

Reason: globals tie the hook to a singleton that tests can't swap. Hook-shaped access (Zustand selectors, navigation hooks) keeps the hook usable wherever its consumer is.

If a hook needs feature-scoped state, it consumes the feature's store from `frontend/features/<f>/stores/`. Don't reach across feature boundaries.

The exception worth flagging: `BLEService` (`frontend/services/BLEService.ts`) is an imported singleton, not a hook. It's the unavoidable global in this project — the BLE manager has process-wide state and there is no React-shaped wrapper for it. Calling `BLEService` from a hook is fine. But the hook should accept the device id / scan parameters / device instance it cares about as **arguments**, not read them off a module-scope mutable. Pushing the variability into arguments keeps the hook testable and the "global" concession scoped to the BLE manager itself.

## Reuse before write

Before writing a hook, check if it already exists:

1. **`frontend/hooks/`** — cross-cutting hooks live here (`useOnForegroundFocus`, `useRootNavigation`, `useBottomNavigation`).
2. **The current feature's `hooks/` folder** (`frontend/features/<f>/hooks/`) — sometimes a near-fit already exists and the extension is a parameter.
3. **Built-ins.** Before writing a window-size hook, check React Native's `useWindowDimensions`. Before writing a theme hook, check `useColorScheme`. Before writing a debounce hook, check React's `useDeferredValue` / `useTransition`. Before writing an id hook, check `useId`. The lightest tool that solves the problem wins.

If you don't find one and the hook is generic (no feature-specific types or imports), prefer adding it to `frontend/hooks/` rather than burying it in a feature folder. See "Promotion".

## Promotion to `frontend/hooks/`

A feature-local hook graduates to `frontend/hooks/` when **either**:

- A second feature wants to use it, **or**
- It's clearly generic (no domain types from `@/ble/...`, no `@/stores/...` imports) — `useDebounce`, `useClickOutside`, `useInterval`, an `AppState`-driven helper.

When promoting:

1. Move to `frontend/hooks/<kebab-name>.ts`.
2. If `frontend/hooks/index.ts` exists, update it (named re-export, alphabetic); if not, create it with a named re-export.
3. Replace the feature-local import with `import { useFoo } from '@/hooks/use-foo'` (or `@/hooks` if a barrel exists).
4. Remove the export from the feature's `hooks/index.ts` barrel. If that barrel ends up empty, delete the `hooks/` folder (per `frontend-folder-creation` — empty sub-folders don't exist).

Before promoting, **ask the user**: promotions are a coupling decision and reviewers expect a clear "second consumer exists or this is plainly generic" justification. Confirm before moving.

## When to extract a hook (from a component)

This is the common call site — "extract this from the component, it's doing too much". The trigger is *identity*: if the logic has a name in your head, it's a hook.

| Component-body smell | Becomes a hook called |
|---|---|
| Multi-step event handler (more than a single setState / callback) | `use<Action>` — `useSelectDevice`, `useCopyToClipboard` |
| `useEffect` body longer than a handful of lines | `use<Thing>Subscription`, `use<Thing>Sync`, `use<Thing>Listener` |
| Cluster of related `useState` + a few derived values | `use<Domain>State` — encapsulates the cluster as one unit |
| Same `useState`/`useEffect` pattern repeated across components | Single hook in `hooks/` (cross-cutting in `frontend/hooks/` if generic) |

Two extractions that are tempting but usually wrong:

- **Pulling a single inline handler into a hook** just because the file feels busy. If the handler is `() => setOpen(false)`, leave it inline; a hook adds a file and zero clarity.
- **Wrapping a single `useState` in a hook** with no extra logic. It's a rename, not an abstraction.

## Step-by-step: writing a new hook

1. **Confirm location.** Feature-local under `frontend/features/<f>/hooks/`, or cross-cutting under `frontend/hooks/`? Apply the promotion rule. If unsure → ask.
2. **Check reuse.** Grep `frontend/hooks/` and the current feature's `hooks/` for near-fits. If one exists, prefer extending parameters over a new hook.
3. **Decide the surface.** Inputs (one scalar vs options bag), return shape (void / value / tuple / object). Single concern means the surface is small.
4. **Write the file.** Apply the canonical shape (`use-<name>.ts` kebab, arrow `export const`, `Use<Name>Options` / `Use<Name>Return` types at the top non-exported, explicit return type annotation).
5. **Check purity.** No `new Date()` / `Math.random()` / `crypto.randomUUID()` at top level of the body, no mutations of arguments or returns, no hook calls inside `if`/loops/callbacks.
6. **Check effect deps.** Run `npm run lint` locally — `react-hooks/exhaustive-deps` will warn on a missing dep. Fix by adding to the array, not by silencing.
7. **Update barrels.** Apply `frontend-folder-creation` rules — named re-export, alphabetic. If the `hooks/` sub-folder didn't exist, create it with an `index.ts`.
8. **Verify.** `npx tsc --noEmit` then `npm run lint`. If `react-hooks/exhaustive-deps` flags something, fix the deps array — the rule is the warning system; silencing it is a code smell.

## Step-by-step: extracting a hook from a component

1. **Name the concern.** The name *is* the hook (`useSelectDevice`, `useAutoSave`). If you can't name it concisely, the extraction is premature — the logic isn't one concern yet.
2. **List the inputs.** Anything from the component scope the logic reads (props, state, store selectors) becomes a parameter or a store/hook call inside the new hook.
3. **List the outputs.** What does the component still need (the handler, the state, the flag)? That's the return shape.
4. **Move the logic.** Cut from the component, paste into the hook body, fix imports.
5. **Re-check purity and effect deps** as in step 5-6 above. Effects often pick up new deps when their dependencies become parameters — the ESLint rule will tell you.
6. **Update barrels** and **verify** (`npx tsc --noEmit` then `npm run lint`) as above.

## Out of scope

- Folder layout, sub-folder choices, barrel mechanics → `frontend-folder-creation` skill.
- Component file shape, context patterns, prop drilling → `frontend-component-creation` skill.
- React Native–specific platform hooks (`useColorScheme`, `useWindowDimensions`) — these are consumed, not authored; the shape rules in this skill don't apply to them.
- Native module wrapping (writing a TurboModule, wrapping `NativeModules.X`) — separate concern, not a custom-hook problem.
- Test files. Hooks are usually exercised through their consumer components; unit tests for hooks are uncommon in this repo. Ask before writing one.
