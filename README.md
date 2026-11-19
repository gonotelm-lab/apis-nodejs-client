# @gonotelm-lab/apis-nodejs-client

Generated Node.js gRPC client for [gonotelm-lab/apis](https://github.com/gonotelm-lab/apis).

Do not edit the generated files (`src/apps/`, `src/google/`, `src/buf/`, `src/index.ts`, `dist/`) by hand — CI replaces them. `src/promise.ts`, `src/callback.ts`, `scripts/`, `test/`, and the configs are hand-written scaffold and are preserved by the sync job.

## Install

From GitHub:

```bash
npm install github:gonotelm-lab/apis-nodejs-client#<branch>
```

From npm (when published):

```bash
npm install @gonotelm-lab/apis-nodejs-client
```

`dist/` is committed, so installing from GitHub does not require a build step.

## Usage

The package exposes the same generated services through two entries, similar to `node:fs` and `node:fs/promises`.

### Promise (default entry)

Built on [`nice-grpc`](https://github.com/deeplay-io/nice-grpc). Unary calls return `Promise`; streaming calls return `AsyncIterable`.

```ts
import {
  IdentityServiceDefinition,
  createChannel,
  createClient,
} from "@gonotelm-lab/apis-nodejs-client"

const channel = createChannel("http://127.0.0.1:7100")
const client = createClient(IdentityServiceDefinition, channel)

const { user } = await client.getUser({ id: "42" })
```

The client is typed from the generated `*ServiceDefinition`. Generated `*ServiceClient` interfaces are also exported if you prefer to name the type.

### Callback (native `@grpc/grpc-js`)

```ts
import { createCallbackClient } from "@gonotelm-lab/apis-nodejs-client/callback"

const client = createCallbackClient(
  IdentityServiceDefinition,
  "127.0.0.1:7100",
  ChannelCredentials.createInsecure(),
)

const call = client.getUser({ id: "42" }, (error, response) => {
  if (error) throw error
  console.log(response.user?.id)
})

// Native grpc-js semantics: ClientUnaryCall, cancel(), Metadata, deadlines,
// and event-based ClientReadableStream / ClientDuplexStream for streaming RPCs.
call.cancel()
```

### Deep imports

Deep imports map one-to-one with proto files:

```ts
import type { User } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/user"
```

## Layout

- `src/apps/**` — generated protobuf messages and service definitions.
- `src/google/**`, `src/buf/**` — generated well-known types and validation code.
- `src/index.ts` — generated flat re-exports of `src/apps/**`, plus `src/promise.ts`.
- `src/promise.ts` — hand-written re-exports of the `nice-grpc` client helpers.
- `src/callback.ts` — hand-written adapter that derives a native `@grpc/grpc-js` client from a generated service definition.
- `dist/cjs`, `dist/esm` — built JavaScript and type declarations.

## Tests

```bash
npm run build
npm test
```

The test suite starts a real gRPC server and exercises the promise entry, the callback entry, metadata, deadlines, status propagation, and `cancel()`.

## Publishing

The package is npm-ready. A manual `publish` workflow exists in `.github/workflows/publish.yml`; it defaults to `--dry-run` and requires the `NPM_TOKEN` secret.
