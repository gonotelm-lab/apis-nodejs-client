# @gonotelm-lab/apis-nodejs-client

Generated Node.js gRPC client for [gonotelm-lab/apis](https://github.com/gonotelm-lab/apis).

Do not edit the generated files (`src/apps/`, `src/google/`, `src/buf/`, `src/index.ts`, `dist/`) by hand — CI replaces them. `scripts/`, `test/`, and the configs are hand-written scaffold and are preserved by the sync job.

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

Each generated service module is a native [`@grpc/grpc-js`](https://github.com/grpc/grpc-node) client (callback API). A Promise flavor sits next to it under `<service>/promise`, the same split as `node:fs` and `node:fs/promises`.

### Callback (default, native grpc-js)

```ts
import { ChannelCredentials } from "@grpc/grpc-js"
import { IdentityServiceClient } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/identity_service"

const client = new IdentityServiceClient(
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

### Promise

Built on [`nice-grpc`](https://github.com/deeplay-io/nice-grpc). Unary calls return `Promise`; streaming calls return `AsyncIterable`.

```ts
import { createIdentityServiceClient } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/identity_service/promise"

const client = createIdentityServiceClient("http://127.0.0.1:7100")

const { user } = await client.getUser({ id: "42" })
```

The factory creates its own channel. To control the channel lifecycle, pass the generated service definition to `nice-grpc` yourself:

```ts
import { createChannel, createClient } from "nice-grpc"
import { IdentityServiceService } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/identity_service"

const channel = createChannel("http://127.0.0.1:7100")
const client = createClient(IdentityServiceService, channel)

const { user } = await client.getUser({ id: "42" })
channel.close()
```

### Deep imports

Deep imports map one-to-one with proto files:

```ts
import type { User } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/user"
```

## Layout

- `src/apps/**` — generated protobuf messages and native grpc-js services (the default entry).
- `src/apps/**/<service>/promise.ts` — generated Promise flavor, exported as `<service>/promise`.
- `src/google/**`, `src/buf/**` — generated well-known types and validation code.
- `src/index.ts` — generated flat re-exports of `src/apps/**`.
- `scripts/build-index.mjs` — generates `src/index.ts` and the per-service `promise.ts` modules during the build.
- `dist/cjs`, `dist/esm` — built JavaScript and type declarations.

## Tests

```bash
npm run build
npm test
```

The test suite starts a real gRPC server and exercises the default grpc-js entry, the promise entry, metadata, deadlines, status propagation, and `cancel()`.

## Publishing

The package is npm-ready. A manual `publish` workflow exists in `.github/workflows/publish.yml`; it defaults to `--dry-run` and requires the `NPM_TOKEN` secret.
