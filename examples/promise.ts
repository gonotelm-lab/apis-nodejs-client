// Promise entry: same generated service, node:fs / node:fs/promises style.
import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { createIdentityServiceClient } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/identity_service/promise";

const address = process.env.GRPC_ADDR ?? "127.0.0.1:7100";
const client = createIdentityServiceClient(address, ChannelCredentials.createInsecure());

const metadata = new Metadata();
metadata.set("x-request-id", "example-promise");

const controller = new AbortController();

const { user } = await client.getUser(
  { id: "42" },
  {
    metadata,
    deadline: Date.now() + 5_000,
    signal: controller.signal,
  },
);

console.log(user?.id, user?.nickname);

// Abort mid-flight (maps to grpc status CANCELLED):
// controller.abort();
