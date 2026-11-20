// Client construction: full grpc-js ClientOptions (shared by callback + promise).
import {
  ChannelCredentials,
  InterceptingCall,
  type Interceptor,
} from "@grpc/grpc-js";
import { createIdentityServiceClient } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/identity_service/promise";

const logging: Interceptor = (options, nextCall) =>
  new InterceptingCall(nextCall(options), {
    start(metadata, listener, next) {
      console.log("→", options.method_definition.path);
      next(metadata, listener);
    },
  });

const address = process.env.GRPC_ADDR ?? "127.0.0.1:7100";
const client = createIdentityServiceClient(
  address,
  ChannelCredentials.createInsecure(),
  {
    // Same ClientOptions as `new IdentityServiceClient(addr, creds, options)`.
    interceptors: [logging],
    // channelOverride / channelFactoryOverride / callInvocationTransformer also work.
  },
);

const { user } = await client.getUser({ id: "42" });
console.log(user?.id);
