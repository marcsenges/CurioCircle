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

## Deferred idea: voluntary question quality feedback (post-0.9.1 Beta)
- Pending owner setup and connection of a backend (suggested Cloudflare Workers + D1); do not activate data collection before approval and privacy review.
- Separate thumbs up/down from private local favourites; optional per-question vote, changeable, with offline queue and duplicate protection.
- Collect only question ID, vote, language and app version as necessary; no names, answers, favourites, location, advertising tracking or user profiles. Assess technical identifiers, logs, retention and privacy notice in all six languages.
- Protected aggregate dashboard and CSV export by question, language and category. Consider revisions rather than deletion; use at least 30 ratings as an initial review threshold, not an automatic decision rule.
- Restore visible app benefits: free, no account, no ads, offline play; six languages. Keep UI compact.

## Owner-approved roadmap after 0.9.3 Beta (2026-11-24)
- Must-have before 1.0: final responsive functional design, original approved branding and install icons, visible free/no account/no ads/offline benefits, privacy notice, actual Android and iPhone installation/offline/update/sharing tests, QR decoding, accessibility baseline, six-language quality assurance, full regression test and explicit owner approval.
- Should-have: voluntary question quality feedback and Cloudflare Workers + D1 after owner setup and approval; protected dashboard and CSV export; 250–300 quality questions, preserve existing IDs, review feedback before revising/removing questions; verify category-balanced shuffle and prioritisation of less-answered questions; maintainer documentation.
- Could-have: optional swipe gestures, subtle reduced-motion-aware animations and optional haptics, thematic packs, further languages, own domain and app stores.
- Tentative releases: 0.9.4 design/branding/benefits; 0.9.5 technical fixes; 0.9.6 feedback/backend; 0.9.7 dashboard; 0.9.8 question/language quality; 0.9.9 regression and device QA; 1.0 only after explicit owner approval. Additional beta patch versions allowed. Current catalogue: 227 questions in six languages (catalogue v5).

### Approved enhancement: sharing achievements (Should-have; lightweight and local)
- Add optional "Your achievements" area in settings or via a compact trophy icon. Four milestones for 1, 3, 5 and 10 share actions, with locked/unlocked trophies and progress. Suggested names: First spark / Conversation starter / People connector / CurioCircle ambassador.
- Brief celebratory gold confetti or trophy animation on first unlock; honour prefers-reduced-motion, no interrupting the game, optional haptic feedback, no repeated celebration on reload. Local-only progress, included in backup/import with backwards compatibility.
- Count explicit sharing actions: successful native sharing (not cancelled), confirmed link copy, and explicit outbound WhatsApp share initiation only with honest wording about the action. Do not claim confirmed delivery, distinct friends, installs or referrals. QR display/download alone is not a confirmed share. Avoid double-counting a single interaction and accidental repeated taps. No tracking identifiers, referral URLs, forced prompts, spam incentives, leaderboards, competition or accounts.
- Localise all labels, achievement titles and messages naturally in all six languages; keep primary question screen uncluttered.

### Approved enhancement: voluntary question suggestions (Should-have, backend-dependent)
- Optional "Suggest a question" form separate from private custom questions; submit only explicitly supplied question text and its language, with a clear notice to omit personal data. No automatic upload of private questions, answers, favourites or personal identifiers.
- Store in protected database moderation queue, pending review by default; no automatic publication. Validate length, rate-limit abuse, reject unsuitable content and duplicates. Provide localised submission feedback and clear offline behaviour; explain transmission before submission.
- Dashboard: pending/approved/rejected status, duplicate checks against catalogue, edit/category/translation review, CSV export. Owner and assistant review proposals together periodically (suggest monthly once backend is available); only approved questions become part of the catalogue after editorial and six-language QA. Assign new stable IDs, publish versioned updates, keep rejected data only as long as necessary.
- Backend features remain deferred until owner sets up/connects Cloudflare Workers and D1 and approves privacy safeguards. Existing app remains local-only and no data collection is activated by this roadmap change.
