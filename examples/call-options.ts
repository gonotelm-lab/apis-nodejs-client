// Per-call options: grpc-js CallOptions + metadata + AbortSignal.
import {
  ChannelCredentials,
  InterceptingCall,
  Metadata,
  type Interceptor,
} from "@grpc/grpc-js";
import { createIdentityServiceClient } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/identity_service/promise";

const address = process.env.GRPC_ADDR ?? "127.0.0.1:7100";
const client = createIdentityServiceClient(address, ChannelCredentials.createInsecure());

const metadata = new Metadata();
metadata.set("authorization", "Bearer <token>");

const perCallLogging: Interceptor = (options, nextCall) =>
  new InterceptingCall(nextCall(options), {
    start(md, listener, next) {
      console.log("call →", options.method_definition.path);
      next(md, listener);
    },
  });

const { user } = await client.getUser(
  { id: "42" },
  {
    metadata,
    deadline: Date.now() + 5_000,
    signal: AbortSignal.timeout(5_000),
    // Native grpc-js CallOptions fields forward as-is (after stripping metadata/signal):
    interceptors: [perCallLogging],
    // credentials / host / parent / propagate_flags also accepted.
  },
);

console.log(user?.id);
