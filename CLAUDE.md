# sola_mpd

An MPD client for large music libraries, shipped both as a web app (Docker) and as an
Electron desktop app. TypeScript monorepo managed with pnpm workspaces.

| Package | Role |
| --- | --- |
| `packages/frontend` | React + Vite + Socket.IO client |
| `packages/backend` | Express + Socket.IO server, MPD access, MCP server |
| `packages/desktop` | Electron shell; IPC transport adapters replacing Socket.IO (experimental) |
| `packages/shared` | Protobuf-generated domain models plus constants and utilities shared across packages |
| `plugins/subsonic` | Subsonic integration plugin |

The frontend never talks to MPD directly. It reaches the backend through a transport port,
which is Socket.IO on web and Electron IPC on desktop — keep that seam intact when adding
features.

## Verifying a change

Run all four after any code change; they are the definition of done:

```
pnpm fmt && pnpm lint && pnpm test && pnpm build
```

Documentation-only changes do not need them.

## Project-specific rules

- **Architecture.** Hexagonal, package-by-feature, with strict naming and folder contracts —
  see [docs/architecture.md](docs/architecture.md) before adding files. It is not inferable
  from a quick read of the tree.
- **Protobuf.** `.proto` files define persisted data. Changing one can destroy user state, so
  it requires explicit permission from the user.
- **Generated code.** Never hand-edit protobuf output, build artifacts, or vendored code.
- **`undefined`, not `null`** — everywhere. One exception: in MCP tool responses under
  `packages/backend/src/mcp/`, scalar fields the tool description promises but which may have
  no current value (`elapsed_seconds` when stopped, `last_updated` before the first DB update)
  use `null` so the JSON shape stays stable for LLM consumers. Optional nested objects
  (`current_song`, `current`) stay `undefined` to keep payloads compact.
- **Comments.** Only where the *why* is non-obvious — a constraint, hazard, or trap the
  reader cannot see from the code. Keep them short; a comment longer than the code it
  explains is a sign the code needs work instead. Do not write:
  - narration of what the code does, or restatements of a name or signature;
  - justifications of the shape chosen over alternatives considered ("rather than keeping a
    copy each", "kept as pure functions so it is testable", "this hook exists only so…");
  - archaeology — what the code used to do, or which bug a change fixed. That belongs in the
    commit message. In a test, one line naming the regression is fine.
- **English only** in the repository — code, identifiers, comments, docs, test data. Chat with
  the user may be in Japanese; repository content may not.
- **Commit scope.** One purpose per change; split unrelated edits.

## Safety constraints

- Do not touch runtime state under `packages/backend/db`, or anything backed by Docker volumes.
- Do not change `docker-compose.yaml`, `docker/Dockerfile`, exposed ports, or network mode
  without explicit instruction.
- Do not enable or repoint external integrations — including Advanced Search plugin endpoints
  and `LAINBOW_ENDPOINT` / `VITE_LAINBOW_ENDPOINT` — without explicit instruction.
- Never hardcode secrets, API keys, or connection details.
- Dependency additions and upgrades are **proposals only**; state the reason, impact, and
  alternatives, and let the user run the install.
- Do not invent commands, config files, or conventions. Verify they exist first.
