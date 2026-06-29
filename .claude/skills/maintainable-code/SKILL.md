---
name: maintainable-coding
description: Use when writing, editing, refactoring, or reviewing TypeScript code in this React Native app, especially when readability, maintainability, analysability, modifiability, testability, function length, nesting, branching, duplication, or cyclomatic complexity are relevant concerns.
---

# Maintainable Coding

## Overview

Apply a readability-first coding standard inspired by ISO/IEC 25010 maintainability qualities and ISO/IEC 5055 source-code maintainability weaknesses. Treat these as strong defaults, not mechanical laws: prefer the clearest code for the language, framework, and existing codebase.

## Core Standard

- Keep functions small. Target 30 lines or fewer for hand-written functions. If a function grows beyond that, first look for distinct validation, loading, branching, side-effect, mapping, publishing, or success/failure responsibilities to extract.
- Keep the top-level flow readable. Public handlers, controllers, commands, jobs, and other orchestration methods should read like a table of contents for the operation.
- Handle invalid, failure, retry, terminal, or exceptional conditions early and return early. Put the normal successful action at the end when practical.
- Avoid `else` by default. Prefer guard clauses, early returns, extracted functions, pattern matching, or a simple ternary for small expression-level choices.
- Use ternaries only for simple expression-level selection between exactly two values. Avoid nested ternaries, ternaries that perform work, and ternaries combined with extra fallback logic such as null coalescing.
- Never write `else { if (...) { ... } }`. Use `else if` if the branches are truly one decision chain, or better, return early and flatten the flow.
- Avoid deep nesting. Treat nesting beyond two levels as a refactor signal. Extract a named function or invert the condition.
- Keep cyclomatic complexity low. Multiple branches, loops, and boolean combinations should trigger extraction into named decisions or policy functions.
- Separate responsibilities. Do not mix validation, data loading, domain decisions, side effects, event publication, persistence, and response mapping in one long function.
- Avoid duplicated business logic. Prefer one named helper or domain method over repeating the same branching or mapping.
- Avoid over-parameterized helpers. If a helper needs many values, pass a cohesive context/value object or reconsider the boundary.
- Avoid hard-coded repeated literals. Centralize repeated domain messages, codes, policy values, and thresholds when doing so improves consistency.
- Preserve architecture boundaries. Keep low-level infrastructure details out of domain orchestration unless the local architecture already requires that coupling.
- Callers in React components frequently chain side effects (state update + navigation + tracking). Treat each as a responsibility — if the handler grows past 2-3 of those, extract a hook (cross-reference `react-custom-hook` skill).

## Preferred Shapes

Use this shape for orchestration functions. In this codebase a `Result` is usually a tuple/return-status or simply a thrown error caught at the orchestration layer; the example below is illustrative of the shape, not a required library:

```ts
const onSaveDeviceName = async (next: string): Promise<Result> => {
    if (!canSave(next)) {
        return Result.rejected('invalid name');
    }

    const device = useDeviceStore.getState().get(deviceId);
    if (!device) {
        return Result.failure('device missing');
    }

    const outcome = await tryUpdateName(device, next);
    if (!outcome.ok) {
        return handleFailure(outcome);
    }

    return handleSuccess(outcome);
};
```

Prefer flattening this:

```ts
if (condition) {
    doPrimaryWork();
} else {
    if (otherCondition) {
        doOtherWork();
    }
}
```

Into this:

```ts
if (condition) {
    doPrimaryWork();
    return;
}

if (otherCondition) {
    doOtherWork();
    return;
}
```

If both branches are substantial, prefer intent-revealing functions:

```ts
if (requiresAlternativePath) {
    return handleAlternativePath(context);
}

return handleNormalPath(context);
```

Use ternaries only when they read as a direct value choice:

```ts
const status = isEnabled ? Status.Active : Status.Disabled;
```

Avoid ternaries that hide branching complexity:

```ts
const label = isAdmin
    ? (user.displayName ?? 'Admin')
    : isGuest
        ? 'Guest'
        : resolveDisplayName(user);
```

Prefer explicit, named branches instead:

```ts
if (isAdmin) {
    return resolveAdminLabel(user);
}

if (isGuest) {
    return 'Guest';
}

return resolveDisplayName(user);
```

## Review Checklist

Before finalizing code changes, check:

- Does each touched function have one clear job?
- Can a maintainer see the order of operations without reading low-level details?
- Are failure paths handled before the final success path where practical?
- Are there avoidable `else` blocks, nested conditionals, or `else { if (...) }` patterns?
- Are ternaries limited to choosing one of two values, without nesting, side effects, method chains, null coalescing, or hidden work?
- Are long functions split into cohesive helpers with names that reveal intent?
- Did extraction reduce complexity rather than hide it behind vague names?
- Are tests or existing checks sufficient for the refactor risk?

## Pragmatic Exceptions

Do not force a rule when it makes the code less clear or fights the language. Short expression-level conditionals, exhaustive pattern matching, parser/visitor code, generated code, framework-required shapes, and tiny symmetric branches may be clearer with the language's normal construct. When making an exception, keep it local and intentional.

- JSX render bodies are not function bodies — judge them on render purity (see the `frontend-component-creation` skill), not on the 30-line target. A component that's mostly JSX layout with one extracted handler is fine even if the JSX tree itself is long; what matters is whether the logic is single-concern.
