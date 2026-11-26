# CurioCircle

A little curiosity. A lot of laughter. Every question has a story.

Free, ad-free conversation game for friends and partners. Play without registration, save favourites, keep local achievements and discover questions. Offline play after initial online setup; optional community ratings and suggestions.

Six languages: German, British English, Spanish (Spain), French, Brazilian Portuguese and Italian. Live version: https://marcsenges.github.io/CurioCircle/

## Development
Read [SPECIFICATION.md](SPECIFICATION.md) before changing this project. It records the approved scope, roadmap, release gates and permanent requirements. [Backend notes](backend/README.md) document deployment and privacy safeguards. [Catalogue review](CATALOGUE-REVIEW.md) describes editorial checks.

Core validation: node scripts/check-catalogue.mjs, node scripts/check-mix.mjs, node scripts/check-achievements.mjs, node scripts/check-storage.mjs. Backend integration tests require Node 22 with --experimental-sqlite. The GitHub Actions browser suite uses Chromium. Physical Android/iOS and independent live verification remain separate release gates.

This draft is not a production release; do not claim store approval or legal compliance.
