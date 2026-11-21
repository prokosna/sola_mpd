# 0001. Inbound messaging and the backend composition root

- Status: Accepted
- Date: 2026-11-21

## Context

The frontend already reaches the backend through one channel port, `MessagingClient`
(`packages/frontend/src/lib/messaging/`), with a Socket.IO and an Electron IPC adapter chosen in
one composition root (`useJotaiStore.tsx`). The backend has no counterpart:

- `SocketIoManager.ts` and `packages/desktop/src/ipc/index.ts` each hold, side by side, the
  channel binding, the routing of every channel to a use case, error encoding and per-connection
  MPD subscription state. The two copies have drifted: a subscription race fixed in #425 was
  fixed on the web side only; config and view-state-blob failures are swallowed on Socket.IO but
  rethrown over IPC; MPD unsubscribe errors on Socket.IO go to a channel nobody listens to;
  plugin-execute failures are reported differently.
- The five `*MessageHandlerSocketIo` classes import no Socket.IO. Four only forward to use cases;
  they exist because the driven-side naming rule (`<Port><Technology>`) was applied to the
  driving side, which forced a technology suffix onto code that has none.
- Use cases take and return wire bytes (`fromBinary` / `toBinary` in `application/`) so that
  three inbound channels could share them.
- Concrete driven adapters are module-level singletons imported directly by use cases and
  handlers. There is no backend composition root; the desktop shell has to change directory
  before a dynamic import so the singletons pick up the right database path.
- Socket.IO acknowledgements have no error path (the client sees an error only on timeout),
  while `ipcRenderer.invoke` rejects when the handler throws. Any channel abstraction must pick
  one semantics.
- The Express routers for `/api/mpd`, `/api/configs` and `/api/view-state-blobs`, and the
  frontend `*RepositoryHttp` adapters, are not used anywhere in the repository.
- MCP tool registration (`mcp/application/register*Tools.ts`) mixes protocol concerns (tool
  schemas, `zod`, result formatting) with orchestration, and reaches some dependencies through
  module imports instead of its `deps`.

## Decision

### Two kinds of code on the driving (inbound) side

1. **Channel ports** describe a kind of inbound channel and have one adapter per technology.
   - `MessagingServer` in `packages/backend/src/lib/messaging/`, the mirror of
     `MessagingClient`: `handle(channel, (payload, peer) => Promise<Uint8Array | void>)`,
     `onDisconnect(peer => …)`, `peer.id`, `peer.send(channel, payload)`,
     `broadcast(channel, payload, { except })`. `peer.send` is a no-op once the peer is gone.
   - Adapters: `MessagingServerSocketIo` (backend) and `MessagingServerElectronIpc`
     (`packages/desktop`, so Electron stays named in the desktop package only). The Electron
     adapter registers channels once. A peer is one renderer document, not one `webContents`:
     a reload keeps the same `webContents` and its id and emits no `destroyed`, so the adapter
     ends the peer (fires `onDisconnect`, then issues a new peer id) on a main-frame
     cross-document navigation (`did-start-navigation` with `isMainFrame && !isSameDocument`),
     on `render-process-gone` and on `destroyed`. A second window is a separate peer.
   - A channel port used by one feature only lives in that feature's `transports/`
     (`McpMessageHandler` and `McpMessageHandlerStreamableHttp` stay where they are).
2. **Registration functions** bind a feature to a channel: `register<Feature>Handlers(server,
   deps)` in `<feature>/transports/`. They decode requests, call use cases, encode responses and
   map failures to the feature's error response. They are functions, not port/adapter pairs, and
   carry no technology suffix. MCP follows the same rule: `register*Tools` move to
   `mcp/transports/`, keep only tool schemas and result formatting, and call use cases in
   `mcp/application/`.

Inbound code calls use cases, never ports directly. Per-connection state belongs to the inbound
side and is keyed by peer id: MPD event subscriptions become `MpdEventSubscriptions` in
`mpd/transports/`.

The `<Port><Technology>` rule stays for driven (outbound) ports. The suffix names what the
adapter actually depends on, so frontend feature adapters built on `MessagingClient` are named
`…Messaging` (`MpdClientMessaging`), not `…SocketIo`. Wire channel names (`SOCKETIO_*`) are part
of the protocol and are not renamed.

### Error contract

A handler that throws or rejects makes the caller's promise reject, on every channel. Socket.IO
adapters carry this in the acknowledgement; Electron IPC already behaves this way. Nothing is
swallowed into an empty or default response.

- Channels whose success response carries a message with an error case keep that case, and the
  registration function maps failures into it: MPD commands (`MpdResponse`), advanced search
  (`AdvancedSearchResponse`) and plugin registration.
- Channels that succeed with an empty response reject on failure instead of returning another
  channel's error message: MPD bulk commands, MPD subscribe and unsubscribe, config save. The
  frontend stops decoding `MpdResponse` errors from these acknowledgements and handles the
  rejection (bulk-command errors are no longer ignored).
- Plugin execution acknowledges on receipt and streams results over its callback channel.
  Failures before the acknowledgement (an undecodable request) reject; failures after it are
  sent as the `error` case of `PluginExecuteResponseWrapper` on the callback channel, on every
  transport.

### Use cases and codecs

Use cases take and return domain models and receive ports as arguments. Wire decoding and
encoding happen in registration functions. A use case may be a single port call; it is still
the core's entry point.

### Composition root

Driven adapters export their classes and are constructed only in a composition root, with
configuration such as the database directory passed in. The backend exposes one function that
builds the dependencies shared by web and desktop and one that registers every feature's
handlers on a `MessagingServer`. The web entry point (`packages/backend/src/index.ts`) adds
Socket.IO, Express and MCP; the desktop main process adds the Electron adapter. The shared part
never imports Express, Socket.IO, SQLite or MCP, so desktop does not bundle them.

### Removed

The unused Express routers for `/api/mpd`, `/api/configs` and `/api/view-state-blobs`, their
`API_*` constants, the frontend `*RepositoryHttp` adapters and `packages/frontend/src/lib/http/`
(used only by those adapters) are deleted.

## Consequences

- Web and desktop share every inbound handler; a channel added once works on both, and the
  drift listed above disappears when desktop switches over.
- Failures that are silently swallowed today on the web reach the caller, which changes
  user-visible behaviour on disk or network errors and must be handled in the frontend.
- `docs/architecture.md` describes the target contract; code reaches it through a sequence of
  pull requests (remove unused HTTP routes, composition root, MCP split, `MessagingServer` with
  Socket.IO, error contract, Electron adapter, codecs out of use cases, frontend renames). Until
  the last one lands, code that predates it may not match.
- Import rules are enforced by lint once the code complies: transport libraries and Electron
  imported only by their adapters, `fromBinary` / `toBinary` not imported in `application/`, and
  `application/` and `transports/` importing `services/` and `repositories/` as types only.
- `McpMessageHandler` keeps `node:http` request and response types in its port, because MCP is
  served only over HTTP; revisit if another MCP transport is added.
