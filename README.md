# @gonotelm-lab/apis-nodejs-client

Generated Node.js gRPC client for [gonotelm-lab/apis](https://github.com/gonotelm-lab/apis).

Do not edit anything under `src/` by hand. `src/apps/`, `src/google/`, `src/buf/`, `src/index.ts`, and `dist/` are regenerated and committed by CI.

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

ESM:

```ts
import { IdentityServiceClient } from "@gonotelm-lab/apis-nodejs-client"

const client = new IdentityServiceClient("127.0.0.1:7100", grpc.credentials.createInsecure())
```

CommonJS:

```js
const { IdentityServiceClient } = require("@gonotelm-lab/apis-nodejs-client")
```

Deep imports map one-to-one with proto files:

```ts
import type { User } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/user"
```

## Layout

- `src/apps/**` — generated protobuf messages and gRPC service stubs.
- `src/google/**`, `src/buf/**` — generated well-known types and validation code.
- `src/index.ts` — flat re-exports of `src/apps/**`.
- `dist/cjs`, `dist/esm` — built JavaScript and type declarations.

## Publishing

The package is npm-ready. A manual `publish` workflow exists in `.github/workflows/publish.yml`; it defaults to `--dry-run` and requires the `NPM_TOKEN` secret.
