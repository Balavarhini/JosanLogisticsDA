# Josan Logistics Driver App

A production-ready React Native (Expo) driver app for Josan Logistics — trip
management, live GPS tracking, and proof-of-delivery capture — built with
TypeScript, Expo Router, and a clean service/hook/component architecture.

This app is a from-scratch native rebuild of the JOSAN Logistics design
reference. It does not wrap any HTML/web view, and it does not reuse the
design reference's own code as its architecture — every screen, component,
and data flow here is native React Native.

---

## 1. Install dependencies

From the project root:

```bash
npm install
```

This installs Expo SDK 52, Expo Router, React Native, and all the native
modules the app uses (location, image picker, secure storage, maps,
signature capture, etc.).

If you use `yarn` or `pnpm` instead, delete `package-lock.json` first and use
your tool's install command — Expo doesn't require npm specifically.

---

## 2. Start the app

```bash
npm start
```

This runs `expo start` and opens the Metro bundler / Expo Dev Tools in your
terminal and browser. From there you can:

- Press `a` to open in a connected Android emulator/device
- Press `i` to open in the iOS simulator (Mac only)
- Press `w` to open in a web browser
- Scan the QR code with the **Expo Go** app on your phone for the fastest way
  to try it on a physical device

## 3. Run on Android specifically

You have two options:

**Option A — Expo Go (fastest, no native build needed):**

```bash
npm run android
```

This starts Metro and launches the app in a connected Android emulator or a
physical device with the Expo Go app installed. This works for everything
except native code that Expo Go doesn't ship with — this app only uses
Expo-compatible modules, so Expo Go is sufficient for development.

**Option B — a real native build (dev client):**

If you need to test against real native modules exactly as they'll ship
(e.g. final Google Maps behavior), build a development client once:

```bash
npx expo run:android
```

This requires Android Studio and the Android SDK to be installed locally.
It compiles a native Android project (into `android/`, which isn't checked
in — see `npx expo prebuild`) and installs it on your emulator/device.

---

## 4. Which files control each screen

The app uses **Expo Router** — every file under `app/` is a route, and the
folder structure *is* the navigation structure.

| Screen | File |
|---|---|
| Splash | `app/index.tsx` |
| Driver Login | `app/(auth)/login.tsx` |
| OTP / Authentication | `app/(auth)/otp.tsx` |
| Dashboard | `app/(tabs)/dashboard.tsx` |
| My Trips | `app/(tabs)/trips.tsx` |
| Notifications | `app/(tabs)/notifications.tsx` |
| Driver Profile | `app/(tabs)/profile.tsx` |
| Trip Details | `app/trip/[id].tsx` |
| Active Shipment | `app/shipment/[id].tsx` |
| Pickup Details | `app/pickup/[id].tsx` |
| Delivery Details | `app/delivery/[id].tsx` |
| Live Tracking | `app/tracking/[id].tsx` |
| Proof of Delivery | `app/pod/[id].tsx` |
| Delivery Confirmation | `app/delivery-confirmation/[id].tsx` |
| Documents | `app/documents.tsx` |
| Settings | `app/settings.tsx` |
| Help & Support | `app/help.tsx` |

A few structural files worth knowing:

- **`app/_layout.tsx`** — the root layout. Loads fonts, wraps the whole app
  in `AuthProvider`, and contains the "route guard" that redirects between
  the `(auth)` screens and the `(tabs)` screens based on whether the driver
  is signed in. This is where protected routes are enforced — no individual
  screen needs to check auth itself.
- **`app/(auth)/_layout.tsx`** and **`app/(tabs)/_layout.tsx`** — the two
  navigators nested inside the root: the auth stack, and the bottom tab bar
  (which uses the custom `components/BottomNavigation.tsx` tab bar).

Beyond `app/`, the rest of the codebase is organized like this:

- **`components/`** — reusable UI: `Header`, `BottomNavigation`,
  `ShipmentCard`, `TripCard`, `StatusBadge`, `LocationCard`, `PrimaryButton`,
  `SecondaryButton`, `DriverStatus`, `LoadingState`, `EmptyState`,
  `ErrorState`, `ConfirmationModal`, plus supporting components
  (`SignaturePad`, `OtpInput`, `TextField`, `Card`, `TripProgressTracker`).
- **`services/`** — all backend/device I/O lives here. Screens never call
  `fetch`/`axios` or `expo-location` directly.
  - `api.ts` — the shared axios client (auth header, error shape, timeouts)
  - `auth.ts` — login/OTP/logout/session persistence
  - `trips.ts` — dashboard, trip list/detail, status updates, proof of
    delivery submission
  - `location.ts` — GPS permission, current location, live tracking,
    route/ETA estimation
  - `notifications.ts`, `driver.ts` — notifications and driver
    profile/performance/documents
- **`hooks/`** — React hooks that wrap the services above for screens
  (`useAuth`, `useTrips`, `useLocation`, `useNotifications`,
  `useDriverProfile`).
- **`types/`** — shared TypeScript types (`Trip`, `TripStatus`, `Driver`,
  location, notification, API request/response shapes).
- **`constants/theme.ts`** — the single source of truth for colors,
  typography, spacing, radii, and shadows, extracted from the JOSAN design
  reference. Change a value here to re-theme the whole app.
- **`constants/config.ts`** — reads environment variables into one typed
  config object (see next section).
- **`utils/`** — pure helper functions (date/distance formatting, trip
  status → color/label mapping, Haversine distance).

---

## 5. Where to add your backend API URL

The app never hardcodes a backend URL or any credentials. Everything goes
through an environment variable:

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set:
   ```
   EXPO_PUBLIC_API_BASE_URL=https://your-real-api.example.com/v1
   ```
3. Restart `npm start` (environment variables are read at bundle time).

That's the only place you need to touch — `services/api.ts` reads
`EXPO_PUBLIC_API_BASE_URL` via `constants/config.ts` and every service file
builds its requests relative to it. No screen or component ever references
the URL directly.

**Note on Expo's env variable rules:** only variables prefixed with
`EXPO_PUBLIC_` are inlined into the JS bundle — this is intentional, so it's
impossible to accidentally ship a secret key in the app. Auth tokens
themselves are never stored in `.env` or in code; they're written to the
device's secure storage (`expo-secure-store`) only after a real login, via
`services/auth.ts` → `hooks/useAuth.tsx`.

**Until you have a backend:** every read-only screen (dashboard, trip list,
notifications, documents, performance) falls back to local sample data in
`services/mockData.ts` when the API call fails, but **only when running in
development** (`__DEV__`). This means the app is fully browsable out of the
box for design/QA review, and the fallback silently stops being used the
moment a real `EXPO_PUBLIC_API_BASE_URL` starts responding. Login and OTP
verification never use mock data — there's no fallback path that lets you
"log in" without a real backend, by design.

**Google Maps (Android, for Live Tracking):** `app.json` has a placeholder
at `expo.android.config.googleMaps.apiKey`. Replace
`YOUR_ANDROID_GOOGLE_MAPS_API_KEY` with a real Maps SDK for Android key
before building for Android, or the map on the Live Tracking screen won't
render tiles.

---

## 6. How to build an Android APK

Native builds are done with **EAS Build** (Expo's cloud build service),
which is already configured in `eas.json` with a `preview` profile that
produces an installable `.apk` (rather than the Play Store's `.aab` format).

1. Install the EAS CLI and log in (one-time):
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Make sure `app.json`'s `android.package` (`com.josanlogistics.driver`) is
   the identifier you want to ship, and that your real Google Maps API key
   is in place (see above).
3. Build:
   ```bash
   npm run build:android
   ```
   (this runs `eas build --platform android --profile preview`)
4. EAS builds in the cloud — when it finishes, the terminal prints a URL
   where you can download the `.apk` directly to install on a device.

For a Play Store submission instead of a sideloadable APK, use the
`production` profile (which builds an `.aab`):
```bash
eas build --platform android --profile production
```

**Building locally instead of in the cloud:** if you'd rather not use EAS's
cloud build, you can build on your own machine with Android Studio/Gradle
installed:
```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```
The resulting APK will be at
`android/app/build/outputs/apk/release/app-release.apk`.

---

## Project status / what's stubbed for now

- **Backend:** no backend is included. Every `services/*.ts` file is
  written against a REST API contract (see the JSDoc comments in each file
  for the expected endpoints) — point `EXPO_PUBLIC_API_BASE_URL` at a real
  implementation of that contract and the app works end to end.
- **Push notifications:** the Notifications screen reads from
  `services/notifications.ts` (a polling/fetch model). Wiring up real push
  delivery (Expo Notifications) is a follow-up, not included here.
- **Signature capture** (`components/SignaturePad.tsx`) is a from-scratch
  canvas (no extra native signature dependency) that rasterizes to a PNG on
  submit via `react-native-view-shot`.
