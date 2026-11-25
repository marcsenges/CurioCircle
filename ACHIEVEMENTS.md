# 0.9.8.1 Beta — local achievements

One optional panel under More options; no extra main-screen navigation or server requests. The 31 milestones cover answer actions (10/25/50/100/250/500), distinct catalogue questions (25/50/100/200/all), local play days (1/5/10/25/50), share actions (1/3/5/10), current favourites (5/10/25/50), explored categories (1/3/5/8, ten distinct catalogue questions answered per category), and languages played (2/3/6, requires an actual answer).

Existing answer counts and current favourites seed progress and unlock earned milestones silently. Days, languages and shares are counted prospectively only. Unlocks are retained as progress changes and the catalogue grows. Current catalogue coverage is always shown separately. A successful native share, successful clipboard copy or explicit WhatsApp initiation can count as a local share action; no proof of delivery, unique recipients, QR scans, cancelled sharing or manual copy fallback. Rapid successive actions are debounced for one second. No achievements for positive votes or mass submissions.

The optional non-blocking achievement notification respects reduced-motion preference and can be switched off. Local achievements are included in the existing game backup, imported and reset with game data. Reset does not alter community feedback or analytics consent. No additional network calls, identifiers or data fields are introduced. Group completion, feedback-specific awards and haptics are intentionally deferred: they should not incentivise spam, alter independent feedback/reset semantics or depend on ambiguous completion signals.

Tests: node scripts/check-achievements.mjs and scripts/ux-review.mjs (Chromium). Real device testing remains part of the release candidate.
