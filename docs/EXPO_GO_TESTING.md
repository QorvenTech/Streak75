# Test Streak75 with Expo Go

This branch exists only for lightweight UI and local-feature testing on a
physical phone. The complete SDK 56/native Firebase implementation remains on
`codex/streak75-app`.

## What changed in this branch

- Expo and its native modules are pinned to SDK 54, matching the current Play
  Store Expo Go client.
- React Native Firebase, native Google Sign-In, `expo-dev-client`, and native
  build-property dependencies are removed.
- Cloud methods are safe no-op stubs.
- A visible test-mode banner prevents cloud status from being mistaken for a bug.

## Start the app

In PowerShell:

```powershell
cd "C:\Users\harsh\OneDrive\Documents\Streak75"
git switch codex/expo-go-test
npm install
npm start
```

1. Install or update **Expo Go** from the Google Play Store.
2. Keep the phone and PC on the same Wi-Fi network.
3. Open Expo Go and scan the QR code shown in the terminal/browser.
4. Keep the terminal open while testing because it serves the JavaScript bundle.
5. On the first run, wait until the terminal reports that Android bundling has
   completed. If Expo Go timed out while Metro was compiling, tap its reload
   button; the cached retry should load much faster.

Use `npm run start:clear` only when a normal cached start is behaving incorrectly.
Clearing the cache makes the next bundle substantially slower.

If the LAN QR code cannot connect:

```powershell
npm run start:tunnel
```

Tunnel mode may ask permission to install Expo's tunnel helper the first time.

## Features available in Expo Go

- All five tabs and responsive dark UI
- Add, edit, favorite, and delete subjects with opening attendance totals
- Present/Absent quick actions
- Subject calendar and record editing
- Leave, Holiday, and No class states
- Notes and local persistence
- Bunk Meter and recovery simulator
- Insights and color customization
- Local daily and low-attendance notifications
- PDF and Excel generation/share sheet

## Features intentionally unavailable

- Google Sign-In
- Firestore upload/download
- Firestore native persistent offline queue
- Manual cloud sync
- Final application icon/splash/native configuration verification

Those features require the production branch and a development/EAS build because
Expo Go cannot load native libraries that are not already compiled into it.

## Suggested test checklist

1. Add a subject with opening held/attended totals.
2. Select a previous date, save Present with a note, and verify both persist.
3. Edit the same date to Absent and verify held stays fixed while attended drops.
4. Clear that date and verify the opening totals are restored.
5. Edit the subject spelling, faculty, icon, color, and opening totals.
6. Restart Expo Go and confirm the subject and dated records remain.
7. Compare Bunk Meter results against the corrected totals.
8. Change target and attendance bands and verify every card.
9. Set the reminder 2-3 minutes ahead, background Expo Go, and check delivery.
10. Export one subject to PDF and Excel.
11. Enable airplane mode and repeat local attendance edits.

## Switch back to the launch branch

Because the branches use different Expo SDK dependency versions, always reinstall
after switching:

```powershell
git switch codex/streak75-app
npm install
```

Do not merge this test-only SDK downgrade into the launch branch.
