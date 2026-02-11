# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.3.0](https://github.com/prokosna/sola_mpd/compare/sola_mpd-v4.2.10...sola_mpd-v4.3.0) (2026-02-11)


### Features

* able to switch profile even if error occurrs ([#298](https://github.com/prokosna/sola_mpd/issues/298)) ([8121fe1](https://github.com/prokosna/sola_mpd/commit/8121fe12a95aec628c4f65ccc28216c7c370728a))
* add full-text search page ([#95](https://github.com/prokosna/sola_mpd/issues/95)) ([dfcb745](https://github.com/prokosna/sola_mpd/commit/dfcb745556683dccd9ef2d00758b97a360c77dfc))
* add Metrics ([#90](https://github.com/prokosna/sola_mpd/issues/90)) ([5c46ae1](https://github.com/prokosna/sola_mpd/commit/5c46ae16c56683be300a5b39bc28979e3cdef42e))
* enable always multi sort for touch devices ([#171](https://github.com/prokosna/sola_mpd/issues/171)) ([84ed59c](https://github.com/prokosna/sola_mpd/commit/84ed59c0d9129b119d0da01aa8d6a8cfcd451b06))
* enable checkbox for multi selection when touch is detected ([#103](https://github.com/prokosna/sola_mpd/issues/103)) ([3e1aa5d](https://github.com/prokosna/sola_mpd/commit/3e1aa5d9d90f0bf775880b8b8aeefe82a763a136))
* expand dragging area on touch device ([#115](https://github.com/prokosna/sola_mpd/issues/115)) ([da429ba](https://github.com/prokosna/sola_mpd/commit/da429ba0b78af1450ae10950870161f92bb4c980))
* integration with lainbow to support similarity search and text-to-music search ([#284](https://github.com/prokosna/sola_mpd/issues/284)) ([b96fcc6](https://github.com/prokosna/sola_mpd/commit/b96fcc647f843fff38a34b0aa9d0bcf515863ce1))
* language-aware sorting ([#213](https://github.com/prokosna/sola_mpd/issues/213)) ([17c9e87](https://github.com/prokosna/sola_mpd/commit/17c9e87a80d5a7cee8de7e73ee5cd12dee4ad201))
* non-blocking backend with mpd3; cache all songs on a server ([#235](https://github.com/prokosna/sola_mpd/issues/235)) ([4433936](https://github.com/prokosna/sola_mpd/commit/4433936737f5dc1450f5372d3ea70adce86dd532))
* remove unnecessary suspense ([#162](https://github.com/prokosna/sola_mpd/issues/162)) ([610d129](https://github.com/prokosna/sola_mpd/commit/610d12984ac6e01501fd40793b9203ae84bb73e8))
* replace special characters in query for astiga plugin ([#119](https://github.com/prokosna/sola_mpd/issues/119)) ([068ff4d](https://github.com/prokosna/sola_mpd/commit/068ff4d4b8f046bac7f75e4def9376453ac11a47))
* responsive layout for small screen ([#106](https://github.com/prokosna/sola_mpd/issues/106)) ([59e012e](https://github.com/prokosna/sola_mpd/commit/59e012ec96dd9c9f828d9bef479c05baf532271c))
* show artist and composer in compact mode ([#150](https://github.com/prokosna/sola_mpd/issues/150)) ([3affcde](https://github.com/prokosna/sola_mpd/commit/3affcde5717701f4ac5f8450d90683cca04b655d))
* show elapsed time on player ([#152](https://github.com/prokosna/sola_mpd/issues/152)) ([de8c8c3](https://github.com/prokosna/sola_mpd/commit/de8c8c3fbff07ac0058992ea4b4b6159850f22b1))
* **side nav:** add compact side navigation ([#102](https://github.com/prokosna/sola_mpd/issues/102)) ([7453ac8](https://github.com/prokosna/sola_mpd/commit/7453ac8f5d8251519f9e9d20c2d457a0f6e2fb3a))
* support host network mode ([#148](https://github.com/prokosna/sola_mpd/issues/148)) ([e32e137](https://github.com/prokosna/sola_mpd/commit/e32e137b1f592285ce2b9815cec2abd569de67c4))
* support track and disc for search query ([#141](https://github.com/prokosna/sola_mpd/issues/141)) ([bea8ca2](https://github.com/prokosna/sola_mpd/commit/bea8ca2b3b7ed86fb23bf82dc7efa182297ae14b))
* update minor behaviors for play queue ([#220](https://github.com/prokosna/sola_mpd/issues/220)) ([321926c](https://github.com/prokosna/sola_mpd/commit/321926cc664bc1c596e3326e0cfa278d591c6a50))
* use date type input for updated_at tag query ([#143](https://github.com/prokosna/sola_mpd/issues/143)) ([00412a2](https://github.com/prokosna/sola_mpd/commit/00412a21482d8fcdd91b2831ae342e15397bb238))


### Bug Fixes

* add padding to PlayerCompact ([#111](https://github.com/prokosna/sola_mpd/issues/111)) ([5385be5](https://github.com/prokosna/sola_mpd/commit/5385be57dc6d05591c18e5f5125b6e5146d1d507))
* add suspense to RootLayout ([#168](https://github.com/prokosna/sola_mpd/issues/168)) ([3f37b91](https://github.com/prokosna/sola_mpd/commit/3f37b913f00f6db212aef374922c5e6a2f25d085))
* allow large data for Socket.io connection ([#94](https://github.com/prokosna/sola_mpd/issues/94)) ([2e06124](https://github.com/prokosna/sola_mpd/commit/2e06124b63c57d7d4e3caef21d3c847de00c478b))
* astiga plugin npm package ([#83](https://github.com/prokosna/sola_mpd/issues/83)) ([12a76eb](https://github.com/prokosna/sola_mpd/commit/12a76eb804378e8924e271fb882c279920de7d5a))
* clear filter box on Browser ([#91](https://github.com/prokosna/sola_mpd/issues/91)) ([0ef483b](https://github.com/prokosna/sola_mpd/commit/0ef483bc98e69439326ca907fc728fa4022bbfe1))
* context menu position on Similarity Search modal ([#300](https://github.com/prokosna/sola_mpd/issues/300)) ([63fafe4](https://github.com/prokosna/sola_mpd/commit/63fafe495352743683dd0cbf986c18ebc5f8766e))
* correct browser filtering where selected values &gt; 1 ([#198](https://github.com/prokosna/sola_mpd/issues/198)) ([5d189d9](https://github.com/prokosna/sola_mpd/commit/5d189d999e5e92e0ebd7dadb53f27f9591d145f6))
* disconnect mpd session ([#158](https://github.com/prokosna/sola_mpd/issues/158)) ([28cd678](https://github.com/prokosna/sola_mpd/commit/28cd6784d6f1b964b3ca8f63ff2f432448164ea5))
* ensure integer flex num of columns ([#110](https://github.com/prokosna/sola_mpd/issues/110)) ([a837b4c](https://github.com/prokosna/sola_mpd/commit/a837b4c0a99960c3c3f551a767a48fd806dc1cf3))
* file explore scroll; improve: use virtuoso to improve scroll performance ([#268](https://github.com/prokosna/sola_mpd/issues/268)) ([591bb47](https://github.com/prokosna/sola_mpd/commit/591bb47443c0d2e16410ccdd3fe0fa5f1ef9ad8d))
* fix bugs found in 2.0.0 ([#85](https://github.com/prokosna/sola_mpd/issues/85)) ([c39155f](https://github.com/prokosna/sola_mpd/commit/c39155f495f900d31dcfb2fdc45596174c0333d6))
* fix unexpected sorting in compact mode ([#121](https://github.com/prokosna/sola_mpd/issues/121)) ([9aa66b2](https://github.com/prokosna/sola_mpd/commit/9aa66b2d86d8844f98d3ad886a83e55caaab4350))
* github actions workflow ([#253](https://github.com/prokosna/sola_mpd/issues/253)) ([9e95874](https://github.com/prokosna/sola_mpd/commit/9e958743acddddaa944148158f2051498c9af7f9))
* handle reconnection when MPD server is dead ([#293](https://github.com/prokosna/sola_mpd/issues/293)) ([af68a35](https://github.com/prokosna/sola_mpd/commit/af68a35e26b18e13dfc21427917c0d0c32f120c6))
* keep sorting on compact mode ([#114](https://github.com/prokosna/sola_mpd/issues/114)) ([0b48a9a](https://github.com/prokosna/sola_mpd/commit/0b48a9aee751cefe19ed6102331589bb2100ff1c))
* limit player text width in compact mode ([#194](https://github.com/prokosna/sola_mpd/issues/194)) ([835a04f](https://github.com/prokosna/sola_mpd/commit/835a04f11e88c26ef34088c38f41366d5c666f5e))
* logo overlapping issue ([#278](https://github.com/prokosna/sola_mpd/issues/278)) ([8142994](https://github.com/prokosna/sola_mpd/commit/8142994d7a612e22ff4866b3ea214509fe66bf91))
* misc ([#96](https://github.com/prokosna/sola_mpd/issues/96)) ([03be29c](https://github.com/prokosna/sola_mpd/commit/03be29ce71a6afe75860bc663c8c5a1a87e99327))
* node version discrepancy between docker and pnpm ([#307](https://github.com/prokosna/sola_mpd/issues/307)) ([3fffbf4](https://github.com/prokosna/sola_mpd/commit/3fffbf41d5ebd3caf0f105eedb0d8aaaa8380f84))
* normalize global filter query ([#276](https://github.com/prokosna/sola_mpd/issues/276)) ([bd2f1f3](https://github.com/prokosna/sola_mpd/commit/bd2f1f3a8c72c94b0ddca36965f939967acc02db))
* player song tag ([#105](https://github.com/prokosna/sola_mpd/issues/105)) ([b5030dc](https://github.com/prokosna/sola_mpd/commit/b5030dc98a0835e0b41c47301d4e619f19b876c3))
* refresh play queue and playlists at page transition ([#99](https://github.com/prokosna/sola_mpd/issues/99)) ([1f469c4](https://github.com/prokosna/sola_mpd/commit/1f469c4b1da5858e87631d5070483f04e802a7d8))
* show borders during loading ([#97](https://github.com/prokosna/sola_mpd/issues/97)) ([4b73938](https://github.com/prokosna/sola_mpd/commit/4b73938d848cdb5b9a10c5c37e00ce6a25eb1bfe))
* **style:** support tablet device ([#101](https://github.com/prokosna/sola_mpd/issues/101)) ([dd0cba3](https://github.com/prokosna/sola_mpd/commit/dd0cba3ba186e46a70db682bc74ae36c60c8f649))
* subsonic plugin to handle empty query properly ([#286](https://github.com/prokosna/sola_mpd/issues/286)) ([44222a8](https://github.com/prokosna/sola_mpd/commit/44222a8ce3e99685437abc173a9f8651a8894092))
* support space key to pause/resume ([#104](https://github.com/prokosna/sola_mpd/issues/104)) ([af8f14f](https://github.com/prokosna/sola_mpd/commit/af8f14f66d68433a43257d127153ba8b6cf3ea3f))
* supress multiple clients creation ([#231](https://github.com/prokosna/sola_mpd/issues/231)) ([6397add](https://github.com/prokosna/sola_mpd/commit/6397add3bdaee6fb53902c75569533a285884acf))
* supress multiple MPD event registrations ([#233](https://github.com/prokosna/sola_mpd/issues/233)) ([b0a9b1c](https://github.com/prokosna/sola_mpd/commit/b0a9b1c754c526fbf7e4376369708ee2d7593cf5))
* tsconfig and swc config ([#87](https://github.com/prokosna/sola_mpd/issues/87)) ([57e7268](https://github.com/prokosna/sola_mpd/commit/57e726852cc6c9b802aa57b6ae8e897c366f1cc9))
* use 100dvh ([#107](https://github.com/prokosna/sola_mpd/issues/107)) ([9d44ea4](https://github.com/prokosna/sola_mpd/commit/9d44ea4699e4b013110df3685010f69c300d5008))
* use localhost for placeholder and use mpd3 0.1.2 ([#243](https://github.com/prokosna/sola_mpd/issues/243)) ([0c42cdf](https://github.com/prokosna/sola_mpd/commit/0c42cdf6bf64a95b5391e58d98278c3aa6bc08e1))
* version bump action ([#127](https://github.com/prokosna/sola_mpd/issues/127)) ([bbb8ce0](https://github.com/prokosna/sola_mpd/commit/bbb8ce0a96c9a4546dd7c8e408332699a4582b3a))
* version bump actions ([#132](https://github.com/prokosna/sola_mpd/issues/132)) ([7bf8535](https://github.com/prokosna/sola_mpd/commit/7bf8535d2ca6a6310a443751524cc9ae89aba780))
* version bump actions ([#135](https://github.com/prokosna/sola_mpd/issues/135)) ([94a01eb](https://github.com/prokosna/sola_mpd/commit/94a01eb3b1ea1bccbf9490557b229011f675113e))
* version bump new version ([#129](https://github.com/prokosna/sola_mpd/issues/129)) ([e47862a](https://github.com/prokosna/sola_mpd/commit/e47862a1ffc826ca86e7ba72779e629e8f9bafe9))
* version GitHub Action ([#126](https://github.com/prokosna/sola_mpd/issues/126)) ([599d27f](https://github.com/prokosna/sola_mpd/commit/599d27fa989077e9a5d999069222d0ed1e8df33a))
* z-index of handle ([#265](https://github.com/prokosna/sola_mpd/issues/265)) ([ce55a3b](https://github.com/prokosna/sola_mpd/commit/ce55a3bb956e934b5fb78d538c338e4d4b4e390d))

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
