# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.2.14](https://github.com/prokosna/sola_mpd/compare/v4.2.13...v4.2.14) (2026-02-11)


### Bug Fixes

* remove deprecated ag-grid properties ([#323](https://github.com/prokosna/sola_mpd/issues/323)) ([e1d38a4](https://github.com/prokosna/sola_mpd/commit/e1d38a48307de819dfe6aba35c20767d13398bf9))

## [4.2.13](https://github.com/prokosna/sola_mpd/compare/v4.2.12...v4.2.13) (2026-02-11)


### Bug Fixes

* pnpm fmt command ([#321](https://github.com/prokosna/sola_mpd/issues/321)) ([5cfe8f3](https://github.com/prokosna/sola_mpd/commit/5cfe8f35da987bc1e7773760f530092d065bdf8e))
* Revert "chore: upgrade react-resizable-panels to v4 ([#318](https://github.com/prokosna/sola_mpd/issues/318))" ([#319](https://github.com/prokosna/sola_mpd/issues/319)) ([d90520f](https://github.com/prokosna/sola_mpd/commit/d90520f6142ef5bdc9233bf923b21e5b0f0dbfbe))

## [4.2.12](https://github.com/prokosna/sola_mpd/compare/v4.2.11...v4.2.12) (2026-02-11)


### Bug Fixes

* handle undefined track and disc ([#314](https://github.com/prokosna/sola_mpd/issues/314)) ([794955b](https://github.com/prokosna/sola_mpd/commit/794955bfc0aeb408bd95c313786c7d55f5271603))

## [4.2.11](https://github.com/prokosna/sola_mpd/compare/v4.2.10...v4.2.11) (2026-02-11)


### Bug Fixes

* release-please-config ([#311](https://github.com/prokosna/sola_mpd/issues/311)) ([47c3656](https://github.com/prokosna/sola_mpd/commit/47c36564f16de8b341fec31f5895daedc44695fa))

## [4.2.10] - 2026-02-10

### Fixed
- Fixed node version discrepancy between docker and pnpm

## [4.2.9] - 2025-12-17

### Changed
- Updated npm packages

## [4.2.8] - 2025-12-17

### Changed
- Use pnpm instead of npm

## [4.2.7] - 2025-12-15

### Fixed
- Context menu is not positioned correctly on Similarity Search Modal

## [4.2.6] - 2025-12-15

### Added
- Ability to switch profile even if error occurs

## [4.2.5] - 2025-12-15

### Changed
- Containers are set to unless-stopped

## [4.2.4] - 2025-11-04

### Fixed
- Fixed MPD client to handle reconnection

## [4.2.3] - 2025-09-13

### Changed
- Updated npm packages

## [4.2.2] - 2025-09-13

### Changed
- Clear all songs cache when update is executed

## [4.2.1] - 2025-09-13

### Fixed
- Fixed Subsonic plugin to handle empty search query

## [4.2.0] - 2025-09-13

### Added
- Integration with lainbow to unlock similarity search and text-to-music search

## [4.1.10] - 2025-08-18

### Added
- Added release.yml

## [4.1.9] - 2025-08-17

### Fixed
- Fixed logo overlapping issue

## [4.1.8] - 2025-08-17

### Fixed
- Fixed global filter issue on normalization

## [4.1.7] - 2025-08-17

### Changed
- Upgraded connect/buf to v2

## [4.1.6] - 2025-08-17

### Fixed
- Wrong scroll area in FileExplore

### Changed
- Improved FileExplore performance by virtuoso

## [4.1.5] - 2025-08-17

### Fixed
- Fixed wrong z-index of panel handles

## [4.1.4] - 2025-08-17

### Changed
- Upgraded React to 19

## [4.1.3] - 2025-08-16

### Changed
- Upgrade express, ag-grid, vite, jotai-effect, etc to latest versions

## [4.1.2] - 2025-08-16

### Changed
- Upgrade biome to v2

## [4.1.1] - 2025-08-16

### Changed
- Updated npm packages (minor versions)

## [4.1.0] - 2025-08-16

### Changed
- Replaced allotment with react-resizable-panels

### Added
- Added feature to persist layout states in browser storage

### Removed
- Removed feature to persist layout states on the server

## [4.0.1] - 2025-08-16

### Fixed
- Fixed GitHub Actions workflow

## [4.0.0] - 2025-08-16

### Changed
- Replace Chakra UI v2 with Mantine
- Design update according to Mantine

## [3.2.5] - 2025-08-07

### Changed
- Rename Astiga plugin to Subsonic with token authentication

## [3.2.4] - 2025-05-15

### Changed
- Updated mpd3 to 0.1.3

## [3.2.3] - 2025-05-04

### Changed
- Updated mpd3 to 0.1.2
- Changed placeholder of host to localhost

## [3.2.2] - 2025-05-04

### Changed
- Updated mpd3 to 0.1.0

## [3.2.1] - 2025-05-03

### Fixed
- npm audit fix

## [3.2.0] - 2025-05-03

### Changed
- Replaced mpd2 with https://github.com/prokosna/mpd.js for Web Streams API and multi connections

### Added
- Cache for all songs on a server

## [3.1.5] - 2025-05-03

### Fixed
- Better MPD event listener singleton handling

## [3.1.4] - 2025-05-02

### Fixed
- Better MPD client singleton handling

## [3.1.3] - 2025-03-30

### Fixed
- Explicitly added build-base and python3 for node-gyp to fix https://github.com/prokosna/sola_mpd/issues/228

## [3.1.2] - 2025-01-19

### Changed
- Changed auto scroll position from middle to top

## [3.1.1] - 2025-01-18

### Added
- Implemented auto scroll to the current playing song in PlayQueue

### Changed
- Refresh PlayQueue when clicking on the link even without a page transition

## [3.1.0] - 2025-01-18

### Changed
- Recently Added page now has the same functionality as Browser page

## [3.0.9] - 2025-01-13

### Added
- Supported language-aware sorting. The setting is available in Locale tab in the Settings. The locale is stored in a browser storage.

## [3.0.8] - 2025-01-13

### Changed
- Upgraded react-router to v7 

## [3.0.7] - 2025-01-12

### Changed
- Migrated deployment process to Docker Compose
- Updated README.md with Docker Compose deployment instructions
- Added migration script (migrate_db.sh) for users upgrading from previous versions

## [3.0.6] - 2025-01-12

### Changed
- Upgraded Ag-Grid to v33

## [3.0.5] - 2024-12

### Fixed
- Fixed browser filtering when multiple values are selected

## [3.0.4] - 2024-12

### Changed
- Changed default navigation visibility in compact mode

## [3.0.3] - 2024-12

### Fixed
- Limited player text width in compact mode

## [3.0.0] - 2024-12

### Changed
- Major refactoring of the codebase
- Optimized React rendering
- Improved TypeScript types and interfaces
- Enhanced component organization and structure

## [2.3.x] - 2024

### Added
- Support for track and disc in search queries
- Elapsed time display on player
- Artist and composer display in compact mode
- Support for host network mode
- Date type input for updated_at tag query
- Full-text search functionality
- Metrics functionality

### Changed
- Improved MPD session handling
- Enhanced UI for touch devices
- Optimized responsive layout for small screens
- Implemented compact side navigation

### Fixed
- Various UI and performance improvements
- Multiple bug fixes for sorting and filtering
- Socket.io connection handling for large data

## [2.0.0] - 2024-03

### Changed
- Refactored of the application by migrating from Next.js to Vite + Pure SPA
- Major performance improvements
- Enhanced plugin system with Astiga support

## [1.5.3] - 2024-03

### Added
- Initial stable release with core MPD functionality
