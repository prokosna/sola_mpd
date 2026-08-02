# Architecture

Reference for the layering and folder conventions of `sola_mpd`. Read this before adding a
file to an existing feature or creating a new feature folder. The short version lives in
[CLAUDE.md](../CLAUDE.md); this document is the full contract.

## Layering

Hexagonal architecture with a functional core. Pure functions carry the business logic;
every external dependency is reached through a Port (interface) implemented by an Adapter.

- **Ports** use pure business names — `MpdClient`, `NotificationService`. No `Port`/`Adapter`
  suffix, no technology in the name.
- **Adapters** are named `<PortName><Technology>` — `MpdClientSocketIo`, `HttpClientFetch`.
- One Port per file, one Adapter per file, co-located in the same folder.
- Every Port must have at least one Adapter. Port-only or Adapter-only is not allowed.

## Package by Feature

Code is grouped by feature (concern), not by technical layer, so everything belonging to one
concern is co-located. Within a feature, the folders below have fixed meanings.

### Common to all packages

| Folder | Contents |
| --- | --- |
| `types` | Type definitions referenced from other feature packages. Types that stay inside a feature may live next to their usage. |
| `const` | Constant definitions. |
| `functions` | Business logic as pure functions. **Unit tests required.** |
| `services` | Business-domain Ports and Adapters for external interactions (`MpdClient`, `AdvancedSearchApi`). |
| `repositories` | Persistence Ports and Adapters (`ConfigRepository`, `BrowserStateRepository`). Use this instead of `services` when the concern is state storage rather than a business operation. |
| `transports` | Message-handling Ports and Adapters for incoming requests (`MpdMessageHandler`, `AdvancedSearchMessageHandler`). Backend only; use this instead of `services` when the concern is routing incoming messages to use cases. |
| `models` | Domain models. They exist only in `shared` and are defined via protobuf. |
| `utils` | Helpers with no relation to business logic. Always check whether the code belongs in `functions` instead. Unit tests recommended. |

Outside features, `lib` (code that exists solely to wrap an external library), `utils`, and
`const` folders may be used at the package level.

### Frontend

- `components`: React components. No logic — they render from hooks and props. One component
  per file.
- `hooks`: Aggregate props for components so component files stay small. No business logic.
  Names start with `useXxx`.
- `states`: Jotai state, split into `atoms` and `actions` following CQRS.
  - `states/atoms`: Async atoms returning Promises are named `xxxAsyncAtom`. Atoms that unwrap
    a Promise into a synchronous value (via `atomWithSync()` etc.) are named `xxxAtom`. The
    `xxxSyncAtom` suffix must not be used in new code. Derived atoms apply functions from
    `functions` to produce the data a view needs. Export atoms directly — do not wrap them in
    React hooks; consumers use `useAtomValue()`. Services are atoms too: adapters are injected
    when the Jotai store is created, which is what lets derived atoms use them.
  - `states/actions`: Write-only Jotai actions, suffixed `xxxActionAtom`. **Actions are the
    only way to update atoms.** Export them directly; consumers use `useSetAtom()`.

### Backend

- `application`: One function per use case. These functions hold no logic themselves — they
  orchestrate models and ports to realize a single use case.
- Application files must not declare port interfaces. Import port contracts from the feature's
  `services`, `repositories`, or `transports` folder.
- Add colocated `{file_name}.test.ts` for use cases with orchestration branches or side-effect
  coordination. Use ports/adapters as the test boundary and cover the success path plus key
  failure or idempotency paths.

## Testing

Tests live beside the code they cover as `{file_name}.test.ts`.
