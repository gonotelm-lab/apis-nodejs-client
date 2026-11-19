const test = require("node:test");
const assert = require("node:assert/strict");
const { ChannelCredentials, Server, ServerCredentials } = require("@grpc/grpc-js");
const {
  IdentityServiceDefinition,
  createChannel,
  createClient,
  createIdentityServiceClient,
} = require("../dist/cjs/index.js");
const {
  createCallbackClient,
  toGrpcJsServiceDefinition,
} = require("../dist/cjs/callback.js");

let server;
let port;

test.before(async () => {
  server = new Server();
  server.addService(toGrpcJsServiceDefinition(IdentityServiceDefinition), {
    getUser(call, callback) {
      callback(null, { user: { id: call.request.id, nickname: "cjs" } });
    },
  });

  port = await new Promise((resolve, reject) => {
    server.bindAsync("127.0.0.1:0", ServerCredentials.createInsecure(), (error, boundPort) =>
      error ? reject(error) : resolve(boundPort),
    );
  });
});

test.after(() => {
  server.forceShutdown();
});

test("CJS require resolves both entries", async () => {
  const address = `127.0.0.1:${port}`;

  const channel = createChannel(address, ChannelCredentials.createInsecure());
  const promiseClient = createClient(IdentityServiceDefinition, channel);
  const callbackClient = createCallbackClient(
    IdentityServiceDefinition,
    address,
    ChannelCredentials.createInsecure(),
  );

  try {
    const promised = await promiseClient.getUser({ id: "cjs-promise" });
    assert.equal(promised.user.id, "cjs-promise");

    const viaFactory = await createIdentityServiceClient(
      address,
      ChannelCredentials.createInsecure(),
    ).getUser({ id: "cjs-factory" });
    assert.equal(viaFactory.user.id, "cjs-factory");

    const calledBack = await new Promise((resolve, reject) => {
      callbackClient.getUser({ id: "cjs-callback" }, (error, value) =>
        error ? reject(error) : resolve(value),
      );
    });
    assert.equal(calledBack.user.id, "cjs-callback");
  } finally {
    channel.close();
    callbackClient.close();
  }
});
