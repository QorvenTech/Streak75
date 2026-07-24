# Product assumptions

The approved prototype is visually detailed but leaves a few behavioral choices
open. Streak75 uses the following explicit assumptions:

1. **Quick actions target the explicitly selected subject.** The dashboard shows
   subject chips, and opening a subject or choosing one in Calendar/Bunk Meter
   also makes it active.
2. **Overall attendance is weighted by classes held.** A subject with 50 classes
   has more effect than a subject with 10 classes.
3. **Leave is not attendance credit.** It counts as a held class but not an
   attended class. Holiday and No class do not affect either total.
4. **Low attendance means crossing below the At Risk minimum.** The alert fires
   on the crossing, not after every subsequent absence.
5. **A note may exist on a No class record.** This allows reminders and syllabus
   notes without changing attendance totals.
6. **Color bands have four stable rows.** Users can rename every row, change its
   color, and move its threshold; adding or deleting band rows is intentionally
   excluded to keep ranges exhaustive and non-overlapping.
7. **Targets are constrained to 50–95%.** A 100% target cannot be recovered after
   any absence in a finite number of future classes, so the UI avoids that
   misleading state. The calculation utility still handles it explicitly.
8. **Development builds show the approved prototype dataset.** Production
   release builds start empty so real students never inherit fake attendance.
9. **Cloud is optional.** Signing out does not delete local records. Local
   tracking continues when Google Sign-In is unavailable or the device is offline.
10. **Google Sign-In uses native Android/iOS SDKs.** It therefore needs an Expo
    development/production build and is not expected to work in Expo Go.
11. **Apple review may require Sign in with Apple.** The brief requests Google
    only. Before App Store submission, review Apple's current login-service rule
    and add Apple Sign-In if required for the chosen distribution.
12. **The attached composition is a style reference, not a literal screen
    dimension.** Layouts preserve its density, navy surfaces, borders, lime/cyan
    accents, gauges, and status hierarchy while remaining responsive on phones.
13. **Starting totals are an opening balance.** They represent classes recorded
    before the student starts adding dated entries. Every dated record is applied
    on top, can be corrected atomically, and can be cleared without changing the
    opening balance.
