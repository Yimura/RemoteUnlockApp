# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start            # Metro bundler
npm run android      # build + deploy to adb-connected device (appId sh.damon.remoteunlock.debug)
npm run ios          # iOS run (Android is the primary target)
npm run lint         # eslint .
npm test             # jest (preset: react-native)
npm test -- <pattern>   # run single test by path/name pattern
```

Dev assumes the `.devcontainer` is used and `adb` is on PATH. Start Metro in one shell, `run android` in another.

## Architecture

React Native 0.77 companion app that talks to a custom BLE peripheral ("RemoteUnlock") to lock/unlock a vehicle.

### Entry & layout
- `index.js` polyfills `global.Buffer` (needed for base64 BLE payloads) then registers `frontend/App.tsx`.
- All source lives under `frontend/`. Path alias `@/*` → `./frontend/*` is wired in both `tsconfig.json` (type-resolution) **and** `babel.config.js` via `babel-plugin-module-resolver` (runtime). Changes to one must mirror the other.

### Navigation (`frontend/Routes.ts`, `Navigator.tsx`, `App.tsx`)
Two-level navigator:
- Root native-stack: `MainNavigator` (tabs) + modal-ish screens `Device Settings`, `Bluetooth Device Pairing`.
- Inside `MainNavigator`: bottom tabs `My Vehicles`, `Settings`.

`RootStackParamList` / `BottomTabParamList` are the source of truth for typed navigation; use the typed hooks in `frontend/hooks/Navigation.ts` (`useRootNavigation`, `useBottomNavigation`) rather than untyped `useNavigation()`.

### BLE layer (`frontend/services/`, `frontend/ble/`)
- `services/BLEService.ts` exports a **singleton** `BLEService` that `extends BleManager` from `react-native-ble-plx`. Always import this — do not construct `new BleManager()` elsewhere. It also owns `enableBluetoothForUser()` (Android intent).
- `ble/RemoteUnlockDevice.ts` is the domain wrapper around a `Device`. It composes three GATT service classes — `DoorService`, `StatusService`, `SettingService` — each living in its own folder under `frontend/ble/` and owning one BLE service UUID + characteristic UUIDs.
- BLE payloads are base64-encoded strings; conversion goes through `Buffer.from(value, 'base64')`. `DoorService` and `StatusService` validate `buff.length` strictly and return `undefined` / `LockState.Unknown` on mismatch. Mirror this when adding characteristics.
- `DoorServiceUUID` (`7ccf30e3-…`) doubles as the scan/connected-devices filter in `stores/deviceStore.ts:refresh`. If you change it, update both call sites.

### State (Zustand)
- `frontend/stores/deviceStore.ts` — global list of paired `RemoteUnlockDevice` instances and `refresh()` which re-reads state from each device and picks up newly OS-connected ones via `BLEService.connectedDevices([DoorServiceUUID])`.
- Per-feature stores live next to the feature (e.g. `features/pairing/stores/pairDeviceStore.tsx`) and should stay scoped — don't promote a one-feature store into `frontend/stores/`.

### Feature folders (`frontend/features/<name>/`)
Each feature owns its page component, an `index.tsx` barrel re-export, and a `components/` (and optionally `pages/`, `stores/`) subdir. The pairing flow is the canonical multi-step example: `PairDevicePage` drives child pages through a `Paginator` component. Shared/cross-feature UI primitives go in `frontend/components/` (`core/`, `text/`, `device/`, `settings/`).

### Theming
No styled-components. Colors are an enum in `frontend/theme/Color.ts`; semantic aliases (`BgColor`, `TextColor`, …) live in `Theme.ts`. Reference `Theme.ts` from components, not raw hex/`Color.*`, so a future dark mode flip happens in one place.

### Platform notes
- Android-first. BLE permission handling in `frontend/util/Bluetooth.ts` branches on `Platform.Version` (API < 31 vs ≥ 31). iOS path is mostly a no-op and untested for new BLE features.
