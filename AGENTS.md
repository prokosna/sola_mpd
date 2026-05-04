<!-- CLAUDE.md is a symlink to this file (AGENTS.md). They are intentionally identical. -->

# 1. Project Overview

`sola_mpd` is a TypeScript-based monorepo. It is an MPD client available as a web application and a desktop application, using React, Vite, Electron, Protocol Buffers, Jotai, and more.

Current major structure:

- `packages/frontend`: React + Vite + Socket.IO frontend
- `packages/backend`: Express + Socket.IO backend
- `packages/desktop`: Electron desktop application (IPC transport adapters for frontend/backend, experimental)
- `packages/shared`: Shared models, constants, protobuf-generated artifacts defining models between frontend and backend, and utilities
- `plugins/subsonic`: Subsonic integration plugin

# 2. Development Commands

The following commands must be run after code changes to verify the code:
- `pnpm fmt`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

# 3. Architecture and Coding Conventions

- Follow hexagonal architecture with functional programming essences. Use pure functions as the foundation, but define Ports via interfaces for external dependencies and implement them as Adapters.
- Follow SOLID principles; functions should be side-effect-free and idempotent where possible.
- Do not directly edit generated code, build artifacts, or external library code.
- Do not write user-facing code comments. Following human coding best practices, write concise comments only where an explanation of "why this implementation is needed" is necessary. Comments must be written in English.
- Tests are created in the same folder as `{file_name}.test.ts`.

## Folder Structure

The folder structure is centered on a Package by Feature approach, where folders are separated by feature. This ensures that code related to a given feature (concern) is co-located.
Below defines the folder breakdown within each Feature.

### Common
- types: Type definitions referenced from other feature packages. Type definitions that stay within a feature may be written near the code that uses them.
- const: Constant definitions.
- functions: Define business logic consisting of pure functions. Functions written here require unit tests.
- services: Define business-domain Ports and Adapters for external interactions (e.g. `MpdClient`, `AdvancedSearchApi`). One Port interface per file and one Adapter per file, co-located in `services`. Port interfaces must be declared here, not inside `application` files.
  - **Naming**: Ports use pure business names (e.g. `MpdClient`, `NotificationService`) — no `Port`/`Adapter` suffixes or technology names. Adapters use `<PortName><Technology>` (e.g. `MpdClientSocketIo`, `HttpClientFetch`).
  - **Pairing**: Every Port must have at least one Adapter. Port-only or Adapter-only is not allowed.
- repositories: Define data persistence Ports and Adapters (e.g. `ConfigRepository`, `BrowserStateRepository`). Same naming and pairing rules as `services`. Use `repositories` instead of `services` when the concern is state storage rather than business operations.
- transports: Define message-handling Ports and Adapters for incoming requests (e.g. `MpdMessageHandler`, `AdvancedSearchMessageHandler`). Same naming and pairing rules as `services`. Use `transports` instead of `services` when the concern is routing incoming messages to use cases (backend only).
- models: Define domain models. In this project, they exist only in shared and are defined via protobuf.
- utils: Utility functions. Define utility functions that are entirely unrelated to business logic. Always verify whether they should be defined in functions instead. Unit tests are recommended for functions written here.

### Frontend
- components: React components. They hold no logic and are only responsible for rendering based on hooks and props. One component corresponds to one file.
- hooks: React hooks. Similar to utilities that aggregate props for input to React components, preventing component files from becoming too large. They hold no business logic. Names must start with useXXX.
- states: State management using Jotai. Contains the following subfolders and provides state Atoms and update Atoms (Actions) following CQRS.
- states/atoms: Define Jotai Atoms. Async Atoms that return Promises must be named `xxxAsyncAtom` (e.g. `UserAsyncAtom`). Atoms that unwrap Promises to expose synchronous values via `atomWithSync()` etc. are named `xxxAtom` (e.g. `UserAtom`). The `xxxSyncAtom` suffix must not be used for new code. Define derived Atoms that apply functions to generate required data. Export Atoms directly without wrapping in React hooks. They are consumed from components or hooks via useAtomValue(). Services are also atoms, and adapters are injected at Jotai store creation time. These services can be used within derived atoms.
- states/actions: Define Jotai Write-Only Actions. All Actions must have the xxxActionAtom suffix. These Actions are the only way to update atoms. Export ActionAtoms directly without wrapping in React hooks. They are consumed from components or hooks via useSetAtom().

### Backend
- application: Define functions corresponding to use cases. These functions hold no logic themselves; they orchestrate model execution to realize a single use case.
- application testing: Add colocated unit tests (`{file_name}.test.ts`) for application use cases that include orchestration branches or side-effect coordination. Use ports/adapters as the test boundary and verify success paths plus key failure or idempotency paths.
- application boundaries: Application files orchestrate ports but must not declare port interfaces. Import port contracts from the feature `services`, `repositories`, or `transports` folder as appropriate.

### Other Folders Outside Features
As needed, use lib (code solely for external libraries), or utils, const folders at the level outside features.


- Communication with the user may be in Japanese, but all technical output in the repository (code, identifiers, comments, docs, test data, etc.) must be in English. Do not add new Japanese text.

# 4. Rules for Making Changes

- Changes to `.proto` files can lead to destruction of persisted data and require explicit user permission.
- Separate edits by the unit of purpose of the change, and run the commands from section 2 (commands are not required for documentation-only changes).

# 5. Safety Constraints and Prohibited Actions

## Explicit Prohibitions

- Do not modify JSON state files or runtime data under `packages/backend/db`.
- Do not perform direct edits or destructive operations that depend on Docker volume data.
- Do not change `docker-compose.yaml`, `docker/Dockerfile`, public ports, network mode, or other settings with significant operational impact **without explicit instructions**.
- Do not enable or change connection targets for external integrations or plugin endpoints for Advanced Search **without explicit instructions**.
- Do not hardcode secrets, API keys, or external service connection information.
- Do not work based on assumptions about non-existent commands, configuration files, or operational rules.

## Handling Dependencies

- Adding new dependencies or updating existing ones should be **proposed only**.
- Actual dependency additions/updates should be performed by the user.
- When a dependency addition is needed, clearly state the reason, impact, and alternatives.

## Handling External APIs / Production Settings

- External integration settings such as `LAINBOW_ENDPOINT` / `VITE_LAINBOW_ENDPOINT` may be proposed but must not be changed without permission.
