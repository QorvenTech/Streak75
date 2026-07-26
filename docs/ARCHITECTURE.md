# Architecture

## State flow

`AppProvider` is the source of truth for profile, settings, subjects, and records.
It hydrates from AsyncStorage before normal use and persists every state change
back to the device.

Attendance mutations follow this order:

1. Save status and note as one atomic dated-record operation.
2. Recalculate denormalized totals from the subject's opening balance plus all
   dated record contributions.
3. Update the in-memory store immediately.
4. Persist the store to AsyncStorage.
5. If native Firebase is configured, await the persisted Firebase user or create
   an anonymous user silently, then submit the subject and record write under
   that UID.
6. Let Firestore's native persistent queue retain the write while offline and
   flush it when connectivity returns.

The UI never waits for authentication or network connectivity before allowing a
class to be marked.

## Anonymous-first authentication

`CloudSyncBridge` never gates rendering. Home remains the first screen while the
native Auth listener restores a persisted Firebase user or calls
`signInAnonymously`. Every write helper also calls the same idempotent bootstrap,
so a user action made before the Auth listener finishes still waits for the UID
instead of being discarded.

The Google action obtains a Google credential and calls `linkWithCredential` on
the current anonymous Firebase user. A successful link retains the UID, so the
Firestore document path never changes.

If Firebase reports `auth/credential-already-in-use`, the app stores a durable
account-switch marker, signs in with that credential, and activates the existing
Google-linked account without merging the current phone's temporary data into
it. Before replacement, a local safety snapshot is stored under the previous
anonymous UID. This marker survives a process restart, preventing an interrupted
account switch from accidentally merging the two accounts.

## Cloud merge

On normal anonymous restoration or same-UID Google linking, `CloudSyncBridge`
reads the user's profile, subjects, and record subcollections. Subjects are
merged by ID. When the same dated record exists locally and in Firestore, the
record with the newest ISO `updatedAt` value wins. The merged result is stored
locally and then submitted to Firestore.

The automatic Google recovery modal is device-local. It becomes eligible after
three subject creations or three distinct local usage dates, marks itself shown
before opening, and never opens automatically a second time.

The manual Sync action waits for native Firestore pending writes, with a timeout
that returns the UI to an offline state instead of blocking indefinitely.

## Subject icon selection

The icon catalog contains 125 approved subjects in five categories. Every icon
has an optimized 112px light-background and dark-background WebP variant, plus
a paired generic book fallback. `subjectIconMap.ts` normalizes case and
punctuation and scores exact
aliases, contained phrases, and in-progress prefixes. Add/Edit Subject debounces
this matcher by 180ms while showing a live preview.

Selecting an icon from the searchable grid stores both `iconId` and
`iconSelectionSource: "manual"`. Manual choices are never changed when the
subject name is edited unless the user explicitly taps **Use auto**. Legacy
subjects without `iconId` are migrated from their name while preserving the old
vector `icon` field as a rendering fallback. The complete subject object,
including the final icon choice, follows the same AsyncStorage/Firestore write
path as every other subject edit.

## Theme system

`ThemeProvider` resolves the persisted `light`, `dark`, or `system` preference
to semantic color tokens. Screens and reusable components create their styles
from those tokens at render time, so switching theme does not require a reload.
React Navigation, the status bar, modals, cards, charts, and the subject icon
renderer all consume the same resolved theme.

The preference lives at `@streak75/theme-preference/v1` and is intentionally
separate from `PersistedAppState` and Firestore. This keeps the restyle visual
only and preserves the existing cloud data model.

## Card appearance

`settings.cardAppearance` stores two global display preferences. Attendance
percentages can use default theme text or follow their calculated attendance
band. Subject names can use default theme text, follow the subject accent, or
follow the attendance
band. The Home dashboard passes these settings into every reusable
`SubjectCard`, and the overall progress value follows the percentage preference.
The existing serialized `"white"` option remains the migration-safe internal
value and now means default theme text in the UI.

## Attendance semantics

- `present`: held +1, attended +1
- `absent`: held +1
- `leave`: held +1
- `holiday`: no change to held or attended
- `no-class`: no change to held or attended

Editing an existing date removes the prior status contribution before applying
the new contribution. Notes are attached to the dated record and do not affect
totals. Clearing a date removes its entire contribution. Legacy local subjects
are migrated by inferring an opening balance that preserves their current totals.

Overall attendance is weighted:

```text
sum(classesAttended) / sum(classesHeld) × 100
```

It is not the arithmetic mean of subject percentages.

## Bunk Meter

The implementation in `src/utils/attendance.ts` uses the requested formulas.

Safe misses:

```text
attended / (held + x) >= target
x = floor(attended / targetDecimal - held)
```

Recovery:

```text
(attended + n) / (held + n) >= target
n = ceil((targetDecimal × held - attended) / (1 - targetDecimal))
```

Floating-point epsilon handling keeps exact boundaries such as 75% stable.

## Notifications

`scheduleDailyReminder` cancels the previously scheduled request and creates one
OS-level daily trigger with the selected hour and minute. Android uses the
high-importance `attendance-reminders` channel. Because this is scheduled by the
operating system, the reminder does not depend on the app process remaining open.

Low-attendance alerts are emitted only when a record change crosses from at or
above the editable At Risk minimum to below it.

## Exports

PDF reports are generated locally with `expo-print`. Excel workbooks are generated
in memory with SheetJS and written to the Expo cache using the `File` API. Both
formats open the native share sheet; no attendance data is uploaded to an export
server.
