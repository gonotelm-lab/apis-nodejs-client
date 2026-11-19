import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import {
  ChannelCredentials,
  Metadata as GrpcMetadata,
  Server,
  ServerCredentials,
  status,
} from "@grpc/grpc-js";
import { Metadata } from "nice-grpc";
import { createChannel, createClient, IdentityServiceDefinition } from "../dist/esm/index.js";
import {
  createCallbackClient,
  toGrpcJsServiceDefinition,
} from "../dist/esm/callback.js";

const seenMetadata = [];
let server;
let port;

before(async () => {
  const implementation = {
    getUser(call, callback) {
      seenMetadata.push(call.metadata.get("x-test"));

      if (call.request.id === "missing") {
        callback({ code: status.NOT_FOUND, details: "missing user" });
        return;
      }

      const delay = call.request.id === "slow" ? 200 : 0;
      setTimeout(() => {
        if (call.cancelled) return;
        callback(null, { user: { id: call.request.id, nickname: "nick" } });
      }, delay);
    },
  };

  server = new Server();
  server.addService(toGrpcJsServiceDefinition(IdentityServiceDefinition), implementation);
  port = await new Promise((resolve, reject) => {
    server.bindAsync("127.0.0.1:0", ServerCredentials.createInsecure(), (error, boundPort) =>
      error ? reject(error) : resolve(boundPort),
    );
  });
});

after(() => {
  server.forceShutdown();
});

const address = () => `127.0.0.1:${port}`;

test("promise entry calls the service", async () => {
  const channel = createChannel(address(), ChannelCredentials.createInsecure());
  const client = createClient(IdentityServiceDefinition, channel);

  try {
    const response = await client.getUser({ id: "promise" });
    assert.equal(response.user.id, "promise");
    assert.equal(response.user.nickname, "nick");
  } finally {
    channel.close();
  }
});

test("promise entry forwards metadata, deadline and abort signal", async () => {
  const channel = createChannel(address(), ChannelCredentials.createInsecure());
  const client = createClient(IdentityServiceDefinition, channel);

  try {
    const metadata = new Metadata();
    metadata.set("x-test", "from-promise");

    await client.getUser(
      { id: "promise-meta" },
      {
        metadata,
        deadline: Date.now() + 5000,
        signal: new AbortController().signal,
      },
    );

    assert.deepEqual(seenMetadata.at(-1), ["from-promise"]);

    const controller = new AbortController();
    const pending = client.getUser({ id: "slow" }, { signal: controller.signal });
    controller.abort();
    // nice-grpc reports caller aborts as a DOMException, not as a grpc status.
    await assert.rejects(pending, (error) => error.name === "AbortError");
  } finally {
    channel.close();
  }
});

test("callback entry calls the service with the native grpc-js API", async () => {
  const client = createCallbackClient(
    IdentityServiceDefinition,
    address(),
    ChannelCredentials.createInsecure(),
  );

  try {
    const response = await new Promise((resolve, reject) => {
      client.getUser({ id: "callback" }, (error, value) =>
        error ? reject(error) : resolve(value),
      );
    });

    assert.equal(response.user.id, "callback");

    const metadata = new GrpcMetadata();
    metadata.set("x-test", "from-callback");

    const withMetadata = await new Promise((resolve, reject) => {
      const call = client.getUser(
        { id: "callback-meta" },
        metadata,
        { deadline: Date.now() + 5000 },
        (error, value) => (error ? reject(error) : resolve(value)),
      );
      assert.equal(typeof call.cancel, "function");
      assert.equal(typeof call.on, "function");
    });

    assert.equal(withMetadata.user.id, "callback-meta");
    assert.deepEqual(seenMetadata.at(-1), ["from-callback"]);
  } finally {
    client.close();
  }
});

test("both entries surface the same grpc status", async () => {
  const channel = createChannel(address(), ChannelCredentials.createInsecure());
  const promiseClient = createClient(IdentityServiceDefinition, channel);
  const callbackClient = createCallbackClient(
    IdentityServiceDefinition,
    address(),
    ChannelCredentials.createInsecure(),
  );

  try {
    await assert.rejects(
      promiseClient.getUser({ id: "missing" }),
      (error) => error.code === status.NOT_FOUND,
    );

    const callbackError = await new Promise((resolve) => {
      callbackClient.getUser({ id: "missing" }, (error) => resolve(error));
    });
    assert.equal(callbackError.code, status.NOT_FOUND);
    assert.equal(callbackError.details, "missing user");
  } finally {
    channel.close();
    callbackClient.close();
  }
});

test("callback entry can be cancelled with ClientUnaryCall.cancel", async () => {
  const client = createCallbackClient(
    IdentityServiceDefinition,
    address(),
    ChannelCredentials.createInsecure(),
  );

  try {
    const error = await new Promise((resolve) => {
      const call = client.getUser({ id: "slow" }, (callError) => resolve(callError));
      call.cancel();
    });

    assert.equal(error.code, status.CANCELLED);
  } finally {
    client.close();
  }
});
