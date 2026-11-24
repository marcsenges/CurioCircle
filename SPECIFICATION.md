# CurioCircle 1.0

A little curiosity. A lot of laughter.
Every question has a story.

## Product
Free mobile-first conversation game for close friends and partners. Original questions between small talk and deep talk: quick, surprising, funny, never coercive or excessively intimate. No copied commercial decks.

## Requirements
- 100 original questions at launch, individually reviewed in German, British English and Spanish from Spain. Stable IDs shared across translations. Expandable to 300+.
- Quick play without setup; optional named players with rotating turns.
- Shuffle without repeats within a round; skip without increasing answer count; answered and next increases count once. Previously answered questions remain eligible in subsequent rounds.
- Filter by category, all, unanswered, favourites; clear empty states and restart rounds.
- Heart toggle, favourites list, local answer counts, custom questions, persistent session and language. No accounts or tracking.
- Versioned central JSON catalogue with last publication date, manual update and optional online check. Validate before replacing last good catalogue. Preserve local data across updates and languages.
- Installable PWA with manifest, icons, service worker, HTTPS, offline app shell and catalogue after first successful load. Relative paths for /CurioCircle/ on GitHub Pages. Share link, QR code and installation instructions for Android and iOS.
- Mobile-first premium forest green, cream and warm gold, large cards, accessible contrast, large touch targets, reduced motion, keyboard and screen reader support.
- Local-only personal data; optional export/import backup and confirmed reset. No third-party runtime dependencies or paid backend.
- Maintainer instructions for adding questions, translations and publishing updates.

## Acceptance tests
Validate unique IDs, complete translations and catalogue schema; test shuffle, filters, skip, count, favourites, persistence, language switching, custom questions and update failure recovery. Test offline reload after initial cache and installation on Android Chrome and iOS Safari; distinguish automated browser tests from actual device tests. Do not claim device tests without running them.

## Repository scope
Only marcsenges/CurioCircle using the marcsenges personal GitHub account. Never access or modify office@pryme.eu or other repositories for this project.
