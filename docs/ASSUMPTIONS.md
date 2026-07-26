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
9. **Google is optional; anonymous cloud backup is the default.** A configured
   native build silently creates an anonymous Firebase UID. AsyncStorage keeps
   tracking usable if Firebase is unavailable or the device is offline.
10. **Google Sign-In uses native Android/iOS SDKs.** It therefore needs an Expo
    development/production build and is not expected to work in Expo Go.
11. **Apple review may require Sign in with Apple.** The brief requests Google
    only. Before App Store submission, review Apple's current login-service rule
    and add Apple Sign-In if required for the chosen distribution.
12. **The attached composition is a style reference, not a literal screen
    dimension.** Layouts preserve its white-card/light treatment and its
    navy-card dark treatment, blue/teal/purple accents, gauges, and hierarchy
    while remaining responsive across supported phone widths.
13. **Starting totals are an opening balance.** They represent classes recorded
    before the student starts adding dated entries. Every dated record is applied
    on top, can be corrected atomically, and can be cleared without changing the
    opening balance.
14. **A manual icon choice always wins.** Name changes only refresh an
    auto-suggested icon. The user must tap **Use auto** before matching can replace
    a manually selected icon.
15. **Card text colors are optional and global.** Attendance percentages and
    subject names use the active theme's default high-contrast text color.
    Users can opt
    into attendance-band or subject-accent colors, and the preference applies to
    all Home subject cards.
16. **The numbered one-time-modal rule takes precedence over the earlier banner
    wording.** No permanent Home sign-in banner is shown. The recovery modal
    appears once after three subject creations or three distinct usage days, and
    Google linking remains available in Profile afterward.
17. **Existing Google-account conflicts do not silently merge accounts.** The
    older Google-linked account becomes active, while this device's temporary
    anonymous session is retained as a local safety snapshot and in its original
    anonymous Firestore path.
18. **Theme preference is device-local UI state.** Light, Dark, or System is
    stored in a separate AsyncStorage key rather than the Firestore user model,
    so this visual restyle does not alter attendance data or cloud schema.
19. **Legacy icon IDs are presentation aliases.** Existing saved subjects keep
    their stored `iconId`; rendering resolves unavailable old IDs to the closest
    approved categorized line icon without rewriting attendance documents.
