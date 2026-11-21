# Architecture

Reference for the layering and folder conventions of `sola_mpd`. Read this before adding a
file to an existing feature or creating a new feature folder. The short version lives in
[CLAUDE.md](../CLAUDE.md); this document is the full contract.

## Layering

Hexagonal architecture with a functional core. Pure functions carry the business logic;
every external dependency is reached through a Port (interface) implemented by an Adapter.
The inbound side and the composition root follow
[ADR 0001](adr/0001-inbound-messaging-and-composition-root.md); code written before it is being
migrated and may not match yet.

- **Ports** use pure business names — `MpdClient`, `NotificationService`. No `Port`/`Adapter`
  suffix, no technology in the name.
- **Adapters** are named `<PortName><Technology>` — `MpdClientMpd3`, `HttpClientFetch`. The
  suffix names what the adapter actually depends on: an adapter built on another port is named
  after that port (`MpdClientMessaging` is built on `MessagingClient`).
- One Port per file, one Adapter per file, co-located in the same folder.
- Every Port must have at least one Adapter. Port-only or Adapter-only is not allowed.
- These rules cover driven (outbound) ports and channel ports. Feature code on the driving
  (inbound) side is written as registration functions instead — see
  [Driving side](#driving-side).

### Driving side

- **Channel ports** describe a kind of inbound channel and have one adapter per technology.
  `MessagingServer` (`packages/backend/src/lib/messaging/`) mirrors the frontend's
  `MessagingClient`; its adapters are `MessagingServerSocketIo` and, in `packages/desktop`,
  `MessagingServerElectronIpc`. A channel port used by one feature lives in that feature's
  `transports` (`McpMessageHandler`).
- **Registration functions**, `register<Feature>Handlers(server, deps)` in the feature's
  `transports`, bind channels to use cases: decode the request, call the use case, encode the
  response, map failures to the feature's error response. MCP tools follow the same shape
  (`register*Tools` in `mcp/transports`).
- Inbound code calls use cases, never ports directly.
- Per-connection state (event subscriptions) lives in `transports`, keyed by peer id.
- **Errors.** A handler that throws or rejects makes the caller's promise reject on every
  channel. Responses that have an error case keep it; nothing is swallowed into an empty or
  default response.

### Composition root

Concrete adapters are constructed only in a composition root, with their configuration passed
in; nothing else imports an adapter instance. The backend builds the dependencies shared by web
and desktop in one place and registers every feature's handlers on a `MessagingServer`. The web
entry point adds Socket.IO, Express and MCP; the desktop main process adds the Electron adapter.
The shared part never imports Express, Socket.IO, SQLite or MCP. On the frontend the root is
`injectDependencies()` in `useJotaiStore.tsx`.

## Package by Feature

Code is grouped by feature (concern), not by technical layer, so everything belonging to one
concern is co-located. Within a feature, the folders below have fixed meanings.

### Common to all packages

| Folder         | Contents                                                                                                                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types`        | Type definitions referenced from other feature packages. Types that stay inside a feature may live next to their usage.                                                                                                                                     |
| `const`        | Constant definitions.                                                                                                                                                                                                                                       |
| `functions`    | Business logic as pure functions. **Unit tests required.**                                                                                                                                                                                                  |
| `services`     | Business-domain Ports and Adapters for external interactions (`MpdClient`, `AdvancedSearchApi`).                                                                                                                                                            |
| `repositories` | Persistence Ports and Adapters (`ConfigRepository`, `BrowserStateRepository`). Use this instead of `services` when the concern is state storage rather than a business operation.                                                                           |
| `transports`   | Backend only. Registration functions that bind incoming messages to use cases (`registerMpdHandlers`), per-connection state (`MpdEventSubscriptions`), and channel ports used by a single feature (`McpMessageHandler`). See [Driving side](#driving-side). |
| `models`       | Domain models. They exist only in `shared` and are defined via protobuf.                                                                                                                                                                                    |
| `utils`        | Helpers with no relation to business logic. Always check whether the code belongs in `functions` instead. Unit tests recommended.                                                                                                                           |

Outside features, `lib` (code that exists solely to wrap an external library, including
channel ports shared by every feature such as `lib/messaging`), `utils`, and `const` folders
may be used at the package level.

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
  orchestrate models and ports to realize a single use case. They take and return domain
  models, never wire bytes, and receive ports as arguments instead of importing adapters.
- Application files must not declare port interfaces. Import port contracts from the feature's
  `services`, `repositories`, or `transports` folder.
- Add colocated `{file_name}.test.ts` for use cases with orchestration branches or side-effect
  coordination. Use ports/adapters as the test boundary and cover the success path plus key
  failure or idempotency paths.

## Testing

Tests live beside the code they cover as `{file_name}.test.ts`.
