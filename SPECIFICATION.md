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

## Consolidated release plan and simplicity review (after 0.9.3 Beta)
This section supersedes the earlier tentative release sequence, without removing approved requirements. Bundle related work rather than one version per feature. No feature is deemed released merely because it appears in this plan.

### Release packages
- 0.9.4 — Design and maintainable foundations (must-have): original approved logo and appropriate PNG install icons, favicon, splash/launch presentation where supported, correct locally generated and decoded QR, mobile spacing/contrast/accessibility, permanent compact benefits (free/no account/no ads/offline after initial online setup), transparent privacy notice. Simplify source organisation and update process as below; retain existing game controls and behaviour.
- 0.9.5 — Local statistics and achievements (should-have): one compact optional "My achievements" area, shared milestone engine and reusable celebration animation; implement core local achievements first and conditional community-related milestones only once their prerequisites exist. Optional haptics, honour reduced motion and allow celebration effects to be disabled. No server dependency.
- 0.9.6 — Community and feedback (should-have; deferred until owner configures/connects backend and approves privacy review): one Cloudflare Worker API, one D1 database, one protected administration interface for rating analytics and moderation queue/CSV export; optional per-question thumbs up/down, change/retract, offline feedback queue with idempotent retry, optional explicit question submission, clear success/failure states, rate limits and validation, no public user accounts. Admin access only, no embedded credentials. Activate only after end-to-end tests and privacy review; keep local game available if backend unavailable. If backend remains blocked, continue independent work without claiming these functions are complete.
- 0.9.7 — Catalogue and quality (should-have, with must-have six-language correctness): target 250–300 well-reviewed questions rather than arbitrary volume; keep existing 227 IDs and meanings, minimise changes, review duplicates and suitability, test category balance and prioritisation of less-answered questions. Review proposed questions together periodically after backend is available; publish approved, translated additions only. Native-speaker feedback where available, no claim of independent review without actual review.
- 0.9.8 — Release candidate QA (must-have): actual Android Chrome and iPhone Safari tests, narrow screens and landscape, installation, offline start, update migration, QR, WhatsApp, native share and clipboard fallback, accessibility, all languages, game modes/turns, categories, counts, favourites, backup/import/reset and achievements, optional backend failure recovery; maintainer instructions and rollback procedure. Distinguish actual device tests from simulated tests.
- 0.9.9 — Reserved for residual fixes only; not a mandatory extra release. Patch betas allowed. 1.0 requires the owner's explicit approval after testing; any deferred functionality must be explicitly agreed before release.

### One optional local achievements and statistics area
Keep the primary game card, favourite heart, answer and skip unchanged; feedback adds only two small accessible optional controls when backend is ready. Group all personal progress under a single "My achievements" entry in settings or sharing area, not a new main navigation system. Show a few headline counts, progress toward next milestones and compact locked/unlocked trophies, expandable by type. A reusable declarative achievement registry defines metric, thresholds, icon and six-language labels; one local event/milestone handler and a shared short non-blocking celebration. No point economy, streak loss, timers, rankings, gated content, push prompts, referral tracking or social pressure.
- Core local metrics: share actions 1/3/5/10; completed answer actions 10/25/50/100/250/500 (repeated questions may count, but skip/back navigation alone never count); distinct answered catalogue questions 25/50/100/200/all (not merely displayed; dynamically calculate coverage against current catalogue); active play dates 1/5/10/25/50 (count once on local calendar day with at least one answer, not app opens); favourites 5/10/25/50 (distinct current favourites, preserve unlocked trophies); categories explored (10 distinct answered questions in each of six categories).
- Additional low-complexity metrics: languages used for at least one actual answer, 2/3/6; completed group-mode rounds 1/5/10, with explicit meaningful completion and no reward for merely switching modes. If meaningful round completion cannot be measured reliably, defer rather than manufacture events. Existing counters can seed answer/favourite/coverage/category achievements; do not invent historical play days, shares, languages or group sessions. No mass celebrations on migration. Keep achieved awards unlocked as catalogue grows and show current coverage separately.
- Feedback achievements after backend integration: count distinct catalogue IDs with a current submitted or pending vote (show pending status separately; only count confirmed votes for submitted-statistics), 1/10/25/50/100/250 when enough questions exist. Thumbs up and down are equal, changing a vote never counts twice, withdrawal does not artificially increase progress; show current total, positive and negative counts locally. Do not reward positive sentiment or repeated voting. 
- Community suggestions: optionally count successful distinct submissions 1/3/5; avoid incentivising spam, duplicates or low-quality submissions; no reward for failed/repeated submissions. Prefer quality over quantity. An accepted-question achievement requires a privacy-preserving reliable way of matching acceptance to the submitter (e.g. optional locally stored submission receipt); defer that specific achievement if it would require user accounts, persistent tracking or disproportionate infrastructure.
- All personal statistics and achievements stay local, versioned and backup-compatible, reset only with explicit confirmation. Include reduced-motion support, localised labels, consistent storage and regression tests. For share actions distinguish copying/initiating sharing from verified recipients, never claim actual referrals or installs.

### Maintainability rules (must-have)
- Keep GitHub Pages and the existing lightweight vanilla web/PWA architecture. No frontend framework, mandatory login, additional runtime services or unnecessary dependencies. Cloudflare is optional for voluntary community features only; core gameplay must work offline after initial setup.
- questions.json is the only manually maintained authoritative catalogue: stable shared IDs, category on every record (migrate existing legacy category mapping without changing meanings), six locale fields, catalogue version/date. Keep UI strings and game logic separate from question data. Generate the offline catalogue snapshot automatically from questions.json, if needed, rather than editing the current duplicate in localisation.js by hand. Separate CSS, UI translation data and modular JS by concern only where useful; avoid big rewrite or excessive files.
- Provide one documented release/check script or lightweight CI workflow to validate schema, unique IDs, six non-empty translations, valid categories, duplicates, backwards compatibility; generate any derived offline assets, bump cache/app version only for code releases, and run automated smoke/regression tests. Publish coherent files together as one release where possible, verify GitHub Pages deployment; retain rollback ability. Catalogue-only updates should not require new app code/version or reinstall. Cache last valid catalogue and app assets, handle inconsistent/stale versions and recover safely. No deletion or loss of existing local data on update; versioned storage migrations, backwards-compatible backups and clear update status.
- Keep UI architecture simple: compact top language/share/settings controls; question screen as today; settings groups for play, favourites/custom questions, achievements and data/privacy; sharing benefits and optional community forms readily discoverable without crowding. No new mandatory steps. Use shared UI components/strings and reusable validation.
- Could-have / later: swipe gestures only if they do not trigger accidental skips, optional haptics, thematic packs via existing category/catalogue mechanism (not separate engines), extra languages, own domain and app stores. Avoid building these before core QA unless clearly beneficial. No separate dashboard per metric, separate backends or elaborate animations.

## Long-term idea collection — after Classic 1.0 (uncommitted concepts only)
These ideas are explicitly outside the current 0.9.x/1.0 roadmap. Do not schedule, implement or add dependencies for them now. Revisit only after the original CurioCircle game is released, stable, tested and its planned voluntary feedback/community backend is connected.
- Potential future collection of social games under CurioCircle, with original game named CurioCircle Classic. Preserve instant access to Classic and simple offline play.
- Potential game modes: Never Have I Ever, Would You Rather, Most Likely To, This or That, Two Truths and a Lie, Guess My Answer, Truth or Dare, What Would You Do?
- Optional conversation-style preferences: depth, humour, fantasy, flirt/intimacy. Keep safe, non-intimate default; intimate content only in explicitly opted-in adult groups, with easy skip and reset, no pressure. Consider simple presets (friends, family, party, adults-only couples, deep talk) before complex sliders.
- Reuse existing card engine, translations, catalogue versioning, categories, feedback, favourites and achievements where sensible; no unnecessary separate engines or mandatory setup.
- All concepts remain exploratory, with no commitment to version numbers, dates or scope. Reassess simplicity, safety, multilingual content quality and maintainability after Classic 1.0.

### Future concept: audience × conversation style × game mechanics (owner endorsed, 2026-11-24)
- Revisit after Classic 1.0 is released and stable, and the voluntary feedback/community backend is connected; not part of current release scope.
- Distinguish three independent dimensions: audience (new acquaintances, close friends, family, couples), conversation style (safe icebreakers, humorous/curious Classic, personal but not emotionally demanding, deep talk, cheeky/party, adult intimacy), and game mechanics (Classic and the previously listed future games).
- Classic's core is close friends, humour, curiosity and interesting personal conversation without excessive emotional depth. New acquaintances favour accessible icebreakers; families favour inclusive intergenerational content; couples may prefer emotional connection; adult party groups may choose cheekier content independently of couple profiles.
- Treat emotional depth and sexual/intimate content as separate dimensions. Adult intimate content strictly opt-in for consenting adults; default off, easy skip, no pressure. Avoid treating couple status or intoxication as consent.
- Use audience/style metadata and a suitability matrix internally, with a handful of intuitive presets externally. Preserve instant Classic play; no mandatory multi-step configuration. Reuse shared catalogue and card engine where useful; assess content quality and maintenance burden.
- Bring this concept back for discussion at the appropriate post-1.0 milestone; no dates or implementation commitments now.
