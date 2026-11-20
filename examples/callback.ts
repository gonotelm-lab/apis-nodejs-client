// Default entry: native @grpc/grpc-js callback client.
import { ChannelCredentials, Metadata } from "@grpc/grpc-js";
import { IdentityServiceClient } from "@gonotelm-lab/apis-nodejs-client/apps/notelm/dev/identity/v1/identity_service";

const address = process.env.GRPC_ADDR ?? "127.0.0.1:7100";
const client = new IdentityServiceClient(address, ChannelCredentials.createInsecure());

const metadata = new Metadata();
metadata.set("x-request-id", "example-callback");

const call = client.getUser(
  { id: "42" },
  metadata,
  { deadline: Date.now() + 5_000 },
  (error, response) => {
    if (error) {
      console.error(error);
      client.close();
      return;
    }
    console.log(response.user?.id, response.user?.nickname);
    client.close();
  },
);

// Native grpc-js handle: cancel(), event listeners, etc.
void call;
