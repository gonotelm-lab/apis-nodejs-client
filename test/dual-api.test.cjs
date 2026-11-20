const test = require("node:test");
const assert = require("node:assert/strict");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { ChannelCredentials, Server, ServerCredentials } = require("@grpc/grpc-js");
const api = require("../dist/cjs/index.js");

// Tests must not hard-code a proto path: every branch syncs a different tree.
const distApps = join(__dirname, "..", "dist", "cjs", "apps");

function findFiles(dir, name) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return findFiles(full, name);
    return entry.name === name ? [full] : [];
  });
}

const promiseModules = findFiles(distApps, "promise.js");
assert.ok(promiseModules.length > 0, "expected at least one generated promise module");

let CallbackClient;
let createPromiseClient;
let server;
let port;

test.before(async () => {
  CallbackClient = Object.values(api).find(
    (value) => typeof value === "function" && value.service && value.serviceName,
  );
  assert.ok(CallbackClient, "expected a generated grpc-js client");

  const promiseModule = require(promiseModules[0]);
  createPromiseClient = Object.values(promiseModule).find(
    (value) => typeof value === "function" && /^create\w+Client$/.test(value.name),
  );
  assert.ok(createPromiseClient, "expected a generated promise factory");

  server = new Server();
  server.addService(CallbackClient.service, {
    getUser(call, callback) {
      callback(
        null,
        api.GetUserResponse.fromPartial({ user: { id: call.request.id, nickname: "cjs" } }),
      );
    },
    setUserStatus(_call, callback) {
      callback(
        null,
        api.SetUserStatusResponse.fromPartial({ user: { id: "status", nickname: "cjs" } }),
      );
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

  const promiseClient = createPromiseClient(address, ChannelCredentials.createInsecure());
  const callbackClient = new CallbackClient(address, ChannelCredentials.createInsecure());

  try {
    const promised = await promiseClient.getUser({ id: "cjs-promise" });
    assert.equal(promised.user.id, "cjs-promise");

    const calledBack = await new Promise((resolve, reject) => {
      callbackClient.getUser({ id: "cjs-callback" }, (error, value) =>
        error ? reject(error) : resolve(value),
      );
    });
    assert.equal(calledBack.user.id, "cjs-callback");
  } finally {
    callbackClient.close();
  }
});
