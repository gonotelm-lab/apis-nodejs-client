import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  ChannelCredentials,
  Metadata as GrpcMetadata,
  Server,
  ServerCredentials,
  status,
} from "@grpc/grpc-js";
import * as api from "../dist/esm/index.js";

// Tests must not hard-code a proto path: every branch syncs a different tree.
// Find the generated promise flavors, then pick one service to exercise.
const distApps = fileURLToPath(new URL("../dist/esm/apps", import.meta.url));

function findFiles(dir, name) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return findFiles(full, name);
    return entry.name === name ? [full] : [];
  });
}

const promiseModules = findFiles(distApps, "promise.js");
assert.ok(promiseModules.length > 0, "expected at least one generated promise module");

const seenMetadata = [];
let CallbackClient;
let createPromiseClient;
let server;
let port;

before(async () => {
  // Default entry: plain grpc-js. The generated client constructor carries its
  // service definition, which is also what the server needs.
  CallbackClient = Object.values(api).find(
    (value) => typeof value === "function" && value.service && value.serviceName,
  );
  assert.ok(CallbackClient, "expected a generated grpc-js client");

  const promiseModule = await import(pathToFileURL(promiseModules[0]).href);
  createPromiseClient = Object.values(promiseModule).find(
    (value) => typeof value === "function" && /^create\w+Client$/.test(value.name),
  );
  assert.ok(createPromiseClient, "expected a generated promise factory");

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
        // Native grpc-js serializes what the handler returns; ts-proto's
        // `encode` expects a complete message, so fill the defaults.
        callback(
          null,
          api.GetUserResponse.fromPartial({
            user: { id: call.request.id, nickname: "nick" },
          }),
        );
      }, delay);
    },
    setUserStatus(_call, callback) {
      callback(
        null,
        api.SetUserStatusResponse.fromPartial({ user: { id: "status", nickname: "nick" } }),
      );
    },
  };

  server = new Server();
  server.addService(CallbackClient.service, implementation);
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

test("default entry calls the service with the native grpc-js API", async () => {
  const client = new CallbackClient(address(), ChannelCredentials.createInsecure());

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

test("promise entry calls the service", async () => {
  const client = createPromiseClient(address(), ChannelCredentials.createInsecure());

  const response = await client.getUser({ id: "promise" });
  assert.equal(response.user.id, "promise");
  assert.equal(response.user.nickname, "nick");
});

test("promise entry forwards metadata, deadline and abort signal", async () => {
  const client = createPromiseClient(address(), ChannelCredentials.createInsecure());

  const metadata = new GrpcMetadata();
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
  // The Promise flavor wraps the native client, so an abort is the same
  // grpc status a cancelled callback call reports.
  await assert.rejects(pending, (error) => error.code === status.CANCELLED);
});

test("promise entry accepts the full grpc-js ClientOptions", async () => {
  const intercepted = [];
  const interceptor = (options, nextCall) => {
    intercepted.push(options.method_definition.path);
    return nextCall(options);
  };

  const client = createPromiseClient(address(), ChannelCredentials.createInsecure(), {
    interceptors: [interceptor],
  });

  const response = await client.getUser({ id: "promise-interceptor" });
  assert.equal(response.user.id, "promise-interceptor");
  assert.equal(intercepted.length, 1);
  assert.match(intercepted[0], /\/GetUser$/);
});

test("promise entry forwards the full grpc-js CallOptions", async () => {
  const client = createPromiseClient(address(), ChannelCredentials.createInsecure());
  const intercepted = [];
  const interceptor = (options, nextCall) => {
    intercepted.push(options.method_definition.path);
    return nextCall(options);
  };

  const response = await client.getUser(
    { id: "promise-call-interceptor" },
    {
      deadline: Date.now() + 5000,
      interceptors: [interceptor],
    },
  );

  assert.equal(response.user.id, "promise-call-interceptor");
  assert.equal(intercepted.length, 1);
  assert.match(intercepted[0], /\/GetUser$/);
});

test("both entries surface the same grpc status", async () => {
  const promiseClient = createPromiseClient(address(), ChannelCredentials.createInsecure());
  const callbackClient = new CallbackClient(address(), ChannelCredentials.createInsecure());

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
    callbackClient.close();
  }
});

test("default entry can be cancelled with ClientUnaryCall.cancel", async () => {
  const client = new CallbackClient(address(), ChannelCredentials.createInsecure());

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
