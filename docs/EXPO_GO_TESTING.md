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
- Live icon auto-suggestions and the searchable 110-icon manual picker
- Present/Absent quick actions
- Subject calendar and record editing
- Leave, Holiday, and No class states
- Notes and local persistence
- Bunk Meter and recovery simulator
- Insights, expanded subject colors, attendance bands, and card appearance modes
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

1. Type `DBMS`, `Eco`, `Accounts`, and `Java Programming`; verify each live icon.
2. Open **Change icon**, search by a label/alias, and manually choose another icon.
3. Continue editing the subject name and verify that the manual icon stays fixed.
4. Tap **Use auto** and verify the icon follows the subject name again.
5. Add the subject with opening held/attended totals.
6. Select a previous date, save Present with a note, and verify both persist.
7. Edit the same date to Absent and verify held stays fixed while attended drops.
8. Clear that date and verify the opening totals are restored.
9. Edit the subject spelling, faculty, icon, color, and opening totals.
10. Restart Expo Go and confirm the subject, icon, and records remain.
11. Compare Bunk Meter results against the corrected totals.
12. Edit a subject and verify all 18 subject accent colors are available.
13. Mark a date Holiday and verify the light slate status is visible in the
    editor, legend, and calendar heatmap.
14. Change target and attendance bands and verify every card.
15. Under Card appearance, test white/status-colored percentages and
    white/subject/status-colored names; verify the live preview and Home update.
16. Restart Expo Go and verify the appearance choices persist.
17. Set the reminder 2-3 minutes ahead, background Expo Go, and check delivery.
18. Export one subject to PDF and Excel.
19. Enable airplane mode and repeat local edits.

## Switch back to the launch branch

Because the branches use different Expo SDK dependency versions, always reinstall
after switching:

```powershell
git switch codex/streak75-app
npm install
```

Do not merge this test-only SDK downgrade into the launch branch.
