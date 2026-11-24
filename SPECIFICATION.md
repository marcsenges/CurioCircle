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

## Version 0.3: Share with friends
- Dedicated, easily accessible sharing screen; opening and closing preserves the current game and language.
- Share the canonical public app URL via WhatsApp with a short localized invitation, copy link with feedback, and native Web Share API when supported (copy fallback).
- Locally generated scannable QR code for the canonical URL, with image save/share option; no external QR service or tracking. Test actual scanning on another phone.
- Localized Android/iOS home-screen installation guidance and offline availability after successful initial caching; no registration or mandatory installation.
- German, British English and Spain Spanish throughout; accessible controls and large touch targets. Never include local favourites, counts, names or session data in shared URLs.
- Test clipboard fallback, WhatsApp link encoding, native share availability, QR decoding and return to the unchanged game.

### Localised installation and sharing promises (v0.3)
- Keep CurioCircle free, ad-free and usable without registration. All sharing controls, invitations, installation instructions and feedback must be localised in de-DE, en-GB and es-ES.
- en-GB: Install CurioCircle. Free. No account needed. No ads. Play offline. Share with friends.
- de-DE: CurioCircle installieren. Kostenlos. Ohne Anmeldung. Keine Werbung. Offline spielen. Mit Freunden teilen.
- es-ES: Instala CurioCircle. Gratis. Sin registro. Sin publicidad. Juega sin conexión. Comparte con tus amigos.
- Show offline promise with initial online setup guidance; retain brand name in all languages.

## Six-language localisation (0.9 Beta)
- Add fr-FR, pt-BR and it-IT to existing en-GB, de-DE and es-ES. Localise all 200 questions and every UI string idiomatically, with informal natural address and culturally appropriate humour. Preserve stable IDs and existing translations.
- Compact globe language selector, accessible at any time; detect device language on first launch, preserve question and session on switching.
- Validate all six translations per question, all interface labels, offline availability, custom questions, sharing and backup compatibility before enabling the new languages. Native-speaker review recommended. Do not label 1.0 without explicit owner approval.
