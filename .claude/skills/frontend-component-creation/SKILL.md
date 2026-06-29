---
name: frontend-component-creation
description: "Use when adding, splitting, extracting, refactoring, or fixing React Native component files in this RemoteUnlockApp project, including component shape, props, purity, hooks, prop drilling, and promotion from feature-local to shared components."
---

# Frontend Component Creation

Governs the **shape and content** of a React Native component file in this app. Concerned with how the component is written — single-concern, pure, extracted, reusable — not where the folder sits (see `frontend-folder-creation`).

The reasoning behind each rule is given so judgment calls in unusual cases can be made coherently. Don't treat these as ALWAYS/NEVER mantras — understand why.

## File shape

A canonical component file looks like this:

```tsx
import type { PropsWithChildren } from 'react';
import type { GestureResponderEvent, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Title, Description } from '@/components/text';
import { BorderColor } from '@/theme/Theme';

type StatCardProps = PropsWithChildren<{
    title: string;
    value: number;
    onPress?: (e: GestureResponderEvent) => void;
    disabled?: boolean;
    style?: ViewStyle;
}>;

export const StatCard = ({ children, disabled, onPress, style, title, value }: StatCardProps) => {
    return (
        <View style={[styles.card, disabled && styles.disabled, style]}>
            <Title>{title}</Title>
            <Description>{value}</Description>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: { borderWidth: 1, borderColor: BorderColor, padding: 8 },
    disabled: { opacity: 0.5 },
});
```

Fixed elements:

1. **Props type** is named `<ComponentName>Props`, declared at the top of the file, **not exported**. Reason: the props type is an implementation detail. Exporting it invites external coupling that is hard to unwind. Consumers that need the shape should derive it (`ComponentProps<typeof StatCard>`) or extract a domain type to a shared `types/` location.
2. **One component per file.** Even small in-file helpers (an internal `Row`, `EmptyState`, `NavLink`) live in their own file. Reason: every component is a reuse and test boundary. In-file helpers grow legs; the moment a second consumer appears they're already entangled with the parent's imports and types.
3. **`export const Name = () => {}`** arrow form. Generic components use **`export const Name = <T,>() => {}`** (note the trailing comma in `<T,>` — required so TSX doesn't parse it as a JSX tag).
4. **Default export is forbidden.** Named exports only — it keeps barrel re-exports honest and grep-able.
5. **Styles at the bottom.** `const styles = StyleSheet.create({...})` lives at the bottom of the file. Reason: the JSX up top should read as layout; the style values are an implementation detail you scroll to.

### File naming

New and renamed component files use kebab-case (`stat-card.tsx`, not `StatCard.tsx`). The component name inside the file stays PascalCase (`export const StatCard = ...`). The existing project predates this convention and contains PascalCase files; do not mass-rename, but apply kebab-case to every file you create or rename.

## Logic extraction

A component file should read as **layout + composition**. Behaviour and computation belong in hooks/utils. The following MUST live outside the component body:

| Concern | Destination |
|---|---|
| Multi-step event handler (anything beyond a single setState / callback invocation) | Custom hook in `frontend/hooks/` or util in `frontend/util/` |
| Data fetching, BLE calls, anything touching `RemoteUnlockDevice` or the device store directly with multi-step logic | Custom hook (e.g. `hooks/<name>.ts`) that wraps the store/service call |
| `useEffect` body longer than a few lines | Custom hook in `frontend/hooks/` — encapsulate setup, cleanup, and deps together |

The pattern: if the handler/effect/computation has a name in your head ("the row-select logic", "the unlock-and-navigate effect"), give it a hook with that name. Reason: a hook makes the dependency surface explicit, isolates the concern for testing, and shrinks the component to its rendering job.

```tsx
// Bad: handler logic inline
export const DeviceRow = ({ device }: DeviceRowProps) => {
    const navigation = useRootNavigation();
    const refresh = useDeviceStore((s) => s.refresh);
    const onSelect = () => {
        refresh(device.id);
        navigation.navigate('DeviceDetails', { id: device.id });
    };
    return <Pressable onPress={onSelect}><Title>{device.name}</Title></Pressable>;
};

// Good: behaviour lives in a hook
export const DeviceRow = ({ device }: DeviceRowProps) => {
    const onSelect = useSelectDevice(device.id);
    return <Pressable onPress={onSelect}><Title>{device.name}</Title></Pressable>;
};
```

What is **fine inline**: trivial handlers (`onPress={() => setOpen(true)}`), trivial derived values (`const fullName = `${first} ${last}``), guard returns, JSX-local arrays built with `.map`.

## Reuse before write

Before writing a component or util, check if it already exists:

1. **`frontend/components/core/`** — generic primitives. Currently: `Button`, `Card`, `Dropdown`, `IconButton`, `List`, `LoadingButton`, `LoadingView`, `OrderedList`, `ProgressBar`, `Slider`, `Switch`.
2. **`frontend/components/text/`** — typography primitives: `Title`, `Description`.
3. **`frontend/components/device/`** — device-specific composites: `DeviceConnectionToggle`, `DeviceLockButton`, `DeviceUnlockButton`.
4. **`frontend/components/settings/`** — `SettingItem`.
5. **Icons** — `lucide-react-native`. Use these instead of inlining SVGs.
6. **Theme** — colours come from `@/theme/Theme` semantic aliases (`BgColor`, `TextColor`, `BorderColor`, `CardBgColor`, `MainBgColor`, `SmallTextColor`). Don't import raw hex values and don't reach into `@/theme/Color` from a component — `Theme.ts` is the API.

If a primitive looks generic but is missing, the right move is usually to add it under `frontend/components/<category>/` rather than re-implementing inside a feature. See "Promotion".

## Context instead of prop drilling

If a prop has to pass through **more than one intermediate component** that doesn't itself read it, switch to context. Reason: relay-only props pollute the type signatures of components that don't care about that data, and every refactor of the inner consumer ripples outward through every relay.

Feature-scoped contexts live at:

```
features/<feature>/context/<name>-context.tsx
```

The file owns the `createContext` call, the Provider component, and the consumer hook. This project uses React 18.3.1, so context uses `useContext` and an explicit `<Context.Provider>`:

```tsx
import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

type SelectedDeviceContextValue = {
    deviceId: string;
    refresh: () => void;
};

const SelectedDeviceContext = createContext<SelectedDeviceContextValue | null>(null);

type SelectedDeviceProviderProps = PropsWithChildren<{ value: SelectedDeviceContextValue }>;

export const SelectedDeviceProvider = ({ children, value }: SelectedDeviceProviderProps) => {
    return <SelectedDeviceContext.Provider value={value}>{children}</SelectedDeviceContext.Provider>;
};

export const useSelectedDevice = () => {
    const ctx = useContext(SelectedDeviceContext);
    if (!ctx) {
        throw new Error('useSelectedDevice must be used inside SelectedDeviceProvider');
    }
    return ctx;
};
```

Notes:
- The consumer hook throws when the provider is missing. Reason: a silent `null` propagates type-narrowing problems and breaks far away from the bug.
- `createContext`, the Provider component, and the consumer hook live in the same file by exception to "one component per file" — a context, its provider, and its consumer are a single inseparable unit.

Add a `context/` sub-folder to the feature when this case arises, with a barrel.

> When this project upgrades to React 19, revisit this section: `useContext` becomes `use(Context)` and `<Context.Provider value={...}>` can be written as `<Context value={...}>`.

## Promotion to shared components

There is no separate package in this project — "promotion" means moving a file from `frontend/features/<feature>/components/` to `frontend/components/<category>/`. Promote when **either**:

- A second feature wants to use it, **or**
- It's clearly a generic primitive (Button, Modal, EmptyState, etc.) that any feature could want.

Steps:

1. **Choose the category folder.** `core/` for primitives, `text/` for typography, `device/` for device composites, `settings/` for settings rows. If no existing category fits, **ask the user** before creating a new one.
2. **Move the file** into `frontend/components/<category>/`. Rename to kebab-case if it isn't already.
3. **Update the category barrel** (`frontend/components/<category>/index.ts` or `index.tsx` — match the neighbours).
4. **Replace usage** in the feature with `import { ... } from '@/components/<category>'`.
5. **Remove the export** from the feature's `components/index.ts` barrel.

## Rules of React (mandatory)

These aren't style preferences — breaking them produces bugs. The component lints catch some, not all.

### Components are pure / idempotent

A component must return the same JSX for the same props + state + context. **No side effects in render.** Bad patterns to never write in the component body or any code path that runs during render:

```tsx
// 🔴 non-idempotent — new value every render
const id = crypto.randomUUID();

// 🔴 reads moving target
const now = new Date();

// 🔴 mutates module-scope state
items.push(...);

// 🔴 writes to a native module from render
NativeModules.MyModule.setSomething(value);

// 🔴 mutates an Animated.Value outside its setter
animatedX._value = 100;
```

If the value is time-dependent or random, initialize it once in state:

```tsx
const [id] = useState(() => crypto.randomUUID());
```

If you need to sync external state (titles, subscriptions, intervals, native module calls), wrap in `useEffect`.

### Never mutate

- **Props**: copy before modify.
- **State**: only via the setter; `state.x = y` is forbidden.
- **Hook arguments and return values**: treat as immutable. Mutating an argument breaks memoization in the called hook; mutating a return breaks memoization in the caller.
- **JSX-passed values**: once a value has been used inside JSX, don't mutate it — React may have eagerly read it. Re-derive a new value for the next use.

### Hooks rules

- **Top level only.** No hooks inside `if`, `for`, `&&`, callbacks, early-return branches, or nested functions. If a hook *must* be conditional, conditionalize the argument, not the call.
- **Only inside React functions.** Components and other custom hooks. Never plain utilities.
- **Never call a component as a function.** `<Foo />`, not `Foo()`. Calling as a function breaks identity, state ownership, and concurrent rendering.
- **Never pass a hook around as a value.** A hook must be called textually in a component or another hook.

## Typing conventions

| Concern | Convention |
|---|---|
| Props type name | `<ComponentName>Props`, non-exported, top of file |
| Children | Wrap props in `PropsWithChildren<{...}>` |
| Booleans | Bare adjective: `disabled`, `loading`, `active`, `compact`. Reason: reads naturally inline (`<Button disabled />` not `<Button isDisabled />`). The `is`/`has` prefix is reserved for variables inside the body (`const isActive = ...`) — that's a readability convention, not an API one. |
| Press handlers | `onPress?: (e: GestureResponderEvent) => void` from `react-native`. Use for `Pressable`, `TouchableOpacity`, and friends. |
| Text input | Prefer `onChangeText?: (text: string) => void`. Only use `onChange?: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void` when the raw event is needed. |
| Layout | `onLayout?: (e: LayoutChangeEvent) => void`. |
| Style props | `style?: ViewStyle | TextStyle | ImageStyle` — pick the one that matches the inner element the style is forwarded to. For composed components that take multiple styles, use named props (`containerStyle`, `labelStyle`). |
| Plain callbacks | `() => void` (or with domain args, `(id: string) => void`) when the prop doesn't represent a native event. |

Use React Native types, not DOM types. **Never import from `react-dom`** and never type a prop with `MouseEventHandler`, `ChangeEventHandler`, `FormEventHandler`, or `HTMLElement` — those don't exist on this platform.

### Refs (React 18.3.1)

This project is on React 18, **not** React 19, so the React 19 ref-as-prop pattern does not compile. Use `forwardRef` when a ref must be exposed, and set `displayName` for devtools/lint clarity:

```tsx
import { forwardRef } from 'react';
import type { PropsWithChildren } from 'react';
import type { View } from 'react-native';

type PanelProps = PropsWithChildren<{ label: string }>;

export const Panel = forwardRef<View, PanelProps>(({ children, label }, ref) => {
    return (
        <View ref={ref} accessibilityLabel={label}>
            {children}
        </View>
    );
});
Panel.displayName = 'Panel';
```

> When this project upgrades to React 19, revisit this section: refs become a regular prop (`ref?: Ref<View>`) and `forwardRef` is no longer needed.

## Memoization

There is no React Compiler in this project, so manual `useMemo`/`useCallback` is the only safety net for the cases below. That said, don't sprinkle them defensively — if the child isn't `memo`-wrapped and the prop isn't in a dependency array, the memoization is doing nothing.

Memoization is warranted when:

- **Lists**: a memoized child renders for every row and a callback or derived prop changes identity on every parent render. Wrap the callback in `useCallback` / the value in `useMemo`.
- **Heavy renders**: expensive derived data (parsed structures, large maps/sorts) — `useMemo` it.

## Sub-component split (no in-file helpers)

If you find yourself defining a small component inside another file, extract it. The split test isn't size — it's **identity**. If the inner block has a name (`NavLink`, `Row`, `EmptyState`, `Toolbar`), it's a component and gets its own file.

A common shape after extraction:

```
features/my-vehicles/components/
├── device-card.tsx        ← uses <DeviceCardRow />
├── device-card-row.tsx    ← exports DeviceCardRow
└── index.ts
```

The barrel re-exports both. `device-card.tsx` imports `DeviceCardRow` from `./device-card-row` directly, not via the barrel (see `frontend-folder-creation` — siblings import direct).

## Step-by-step: writing a new component

1. **Confirm location.** Feature-local under `frontend/features/<f>/components/`, or shared under `frontend/components/<category>/`? Apply the promotion rule. If unsure → ask.
2. **Check reuse.** Grep `@/components/core`, `@/components/text`, `@/components/device`, `@/components/settings` first. If a near-fit exists, prefer composition over a new component.
3. **Sketch the props.** Single concern means the prop list is short (typically ≤6). If you're up to 10 props, the component is doing too much — split before writing.
4. **Identify the extractions.** Before writing the body, list what will go to a hook / util / store call. If the list is empty and the body is non-trivial, look again — most non-trivial components have one extraction.
5. **Write the file.** Apply the canonical shape (Props type at top, arrow `export const`, no default export, RN event handler types, `PropsWithChildren` if children, `StyleSheet.create` at the bottom).
6. **Update barrels.** Apply `frontend-folder-creation` rules — named re-export, alphabetic.
7. **Verify.** Run `npx tsc --noEmit`, then `npm run lint`.

## Step-by-step: refactoring an existing component

The common call sites are "this component is doing too much", "split this", "extract X", "this is drilling props through 3 layers".

1. **List the responsibilities.** Each one is a candidate hook/sub-component/context. The smallest unit that has a name is the unit to extract.
2. **Apply the extraction rules in order:**
   - Inline sub-component with a name → its own file.
   - Multi-step handler → hook.
   - Long effect → hook.
   - Prop drilling >1 layer → context.
   - Direct multi-step `RemoteUnlockDevice` / store call → hook.
3. **Re-check purity.** Anything created with `new Date()`, `Math.random()`, `crypto.randomUUID()`, or native module reads at the top level of the component body is broken — move to `useState` initializer or an effect.
4. **Re-check immutability.** Search for `.push`, `=`-assignments on props/state, mutations after JSX usage.
5. **Update barrels.** Extracted sub-components need adding.
6. **Verify** with `npx tsc --noEmit` then `npm run lint`.

## Out of scope

- Folder layout, sub-folder choices, barrel mechanics → `frontend-folder-creation` skill.
- Styling specifics beyond reusing `@/theme/Theme` aliases and existing primitives.
- React Native–specific platform concerns: `useNativeDriver`, `InteractionManager`, native module wrapping, and platform splits (`.ios.tsx` / `.android.tsx`) are out of scope here.
- Test files. If a test is needed, ask the user first — unit tests are uncommon in this repo.
