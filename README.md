# Streak75

**Hit 75. Stay Ahead.**  
Track. Analyze. Achieve.

Streak75 is a dark-only, offline-first attendance tracker built for Indian college
students. It tracks attendance subject by subject, calculates a safe bunk
allowance, forecasts recovery, schedules device-local reminders, backs records
up to Firestore, and exports print-ready PDF and Excel reports.

## What is included

- Prototype-matched navy UI with the lime/cyan Streak75 shield brand
- Home dashboard with weighted overall attendance, subject cards, cloud state,
  and one-tap Present/Absent/Note actions
- Subject detail with edit/delete controls, favorite state, calendar heatmap,
  five attendance states, notes, PDF report, and Excel report
- 110 optimized illustrated subject icons with debounced name-based suggestions,
  Indian abbreviations, and a searchable manual picker
- Opening attendance balances plus atomic dated records, including back-date
  corrections and clear-record support
- Exact Bunk Meter inequalities for safe misses and recovery attendance
- Combined Calendar and Smart Insights tabs
- Editable attendance labels, thresholds, colors, global target, card text color
  modes, and live preview
- Daily OS-scheduled local reminders and low-attendance notifications
- Silent anonymous Firebase Authentication on first launch, so Firestore backup
  starts before the user connects Google
- Native Firestore offline persistence plus AsyncStorage device persistence
- In-place Google account linking that preserves the anonymous UID and data,
  with an explicit existing-account conflict recovery path
- One-time Google recovery prompt after three added subjects or three usage days
- Firestore rules that restrict every user document and subcollection to its owner
- EAS development, preview, and production build profiles
- Unit tests for attendance math, subject icon matching, asset integrity, and
  cloud/local record merging

## Tech

- Expo SDK 56 / React Native 0.85 / TypeScript
- React Navigation 7
- React Native Firebase Auth + Firestore
- `expo-notifications`, `expo-print`, `expo-sharing`, `expo-file-system`
- `react-native-svg` for circular progress and the Bunk Meter
- SheetJS 0.20.3 from its official CDN for `.xlsx` workbooks

## Quick start

Requirements: Node.js 20.19 or newer and npm.

```bash
npm install
npm start
```

Without a Firebase service file for the current platform, the app intentionally
starts in local fallback mode.
The development build uses prototype sample data so the approved design is
immediately reviewable; release builds start with an empty subject list.

The configured native app silently creates an anonymous Firebase account while
opening directly to Home. Google linking and native Firestore require a
development build:

```bash
npx expo prebuild
npx expo run:android
# npx expo run:ios  # macOS required
```

See [Firebase setup](docs/FIREBASE_SETUP.md) before creating that build.

## Commands

```bash
npm run typecheck
npm run lint
npm test
npm run validate
npm run generate:assets
npx expo export --platform android
```

## Project layout

```text
Streak75/
├── App.tsx
├── app.config.ts
├── eas.json
├── firebase/
│   ├── android/                 # gitignored google-services.json
│   ├── ios/                     # gitignored GoogleService-Info.plist
│   ├── firestore.rules
│   └── firestore.indexes.json
├── scripts/
│   └── generate-brand-assets.mjs
├── src/
│   ├── components/              # gauges, cards, calendars, modals, settings rows
│   ├── constants/               # dark theme and attendance status metadata
│   ├── data/                    # defaults and development prototype data
│   ├── navigation/              # bottom tabs and root detail stack
│   ├── screens/                 # all product screens
│   ├── services/                # Firebase, sync bridge, notifications, exports
│   ├── store/                   # offline-first application provider
│   ├── types/                   # Firestore-aligned domain model
│   └── utils/                   # calculations, dates, unit tests
└── docs/
    ├── ARCHITECTURE.md
    ├── ASSUMPTIONS.md
    └── FIREBASE_SETUP.md
```

## Firestore model

```text
users/{uid}
  profile, targetAttendance, colorBands, notificationPreferences,
  cardAppearance, applyBandsGlobally, updatedAt

users/{uid}/subjects/{subjectId}
  name, professor, iconId, iconSelectionSource, icon, color, favorite,
  openingClassesHeld,
  openingClassesAttended, classesHeld, classesAttended, createdAt, updatedAt

users/{uid}/subjects/{subjectId}/records/{YYYY-MM-DD}
  date, status, note, updatedAt
```

Every mutation is persisted to AsyncStorage first. Write methods await the
silently initialized anonymous Firebase user, then immediately submit the same
mutation under `users/{anonymousUid}`. The native SDK accepts offline writes into
its persistent local queue and sends them when connectivity returns. Google
linking normally preserves that UID.

## Environment and secrets

Copy `.env.example` to `.env`. Firebase mobile service files and every `.env`
variant are ignored by Git. The repository contains only fake configuration
templates; never commit service-account keys.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Firebase and Google Sign-In setup](docs/FIREBASE_SETUP.md)
- [Product assumptions](docs/ASSUMPTIONS.md)

## License

See [LICENSE](LICENSE).
