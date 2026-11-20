# Examples

Illustrative ESM TypeScript snippets for `@gonotelm-lab/apis-nodejs-client`. They show the intended import paths and option surfaces; they are not a runnable demo suite (no local server is started).

| File | What it shows |
|---|---|
| `callback.ts` | Default native grpc-js callback client + Metadata / deadline / `cancel` |
| `promise.ts` | `/promise` factory + per-call `metadata` / `deadline` / `signal` |
| `client-options.ts` | Full grpc-js `ClientOptions` (client-level interceptors) |
| `call-options.ts` | Full per-call `CallOptions` (call-level interceptors + metadata/signal) |

Point `GRPC_ADDR` at a real IdentityService if you adapt these into a scratch script.
