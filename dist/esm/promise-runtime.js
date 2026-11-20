// Shared runtime for the generated Promise flavor.
//
// The Promise client wraps the native generated grpc-js client, so the whole
// grpc-js `ClientOptions` surface (interceptors, channel overrides, channel
// options, callInvocationTransformer, ...) behaves exactly like the callback
// client. This module only adapts calls to Promises / AsyncIterables.
import { once } from "node:events";
import { Metadata as GrpcMetadata } from "@grpc/grpc-js";
function grpcCallOptions(options) {
    return options.deadline === undefined ? {} : { deadline: options.deadline };
}
function metadataOf(options) {
    return options.metadata ?? new GrpcMetadata();
}
function cancelOnAbort(call, signal) {
    if (!signal)
        return;
    if (signal.aborted) {
        call.cancel();
        return;
    }
    const cancel = () => call.cancel();
    signal.addEventListener("abort", cancel, { once: true });
    // Do not keep a finished call alive through a long-lived signal.
    call.on("status", () => signal.removeEventListener("abort", cancel));
}
// Buffer stream events so a call that fails before the caller starts iterating
// still reports the error instead of crashing the process.
function toAsyncIterable(stream) {
    const queue = [];
    let done = false;
    let failure;
    let notify;
    const wake = () => {
        const resolve = notify;
        notify = undefined;
        resolve?.();
    };
    stream.on("data", (value) => {
        queue.push(value);
        wake();
    });
    stream.on("end", () => {
        done = true;
        wake();
    });
    stream.on("error", (error) => {
        failure = error;
        done = true;
        wake();
    });
    return {
        async *[Symbol.asyncIterator]() {
            try {
                while (true) {
                    if (queue.length > 0) {
                        yield queue.shift();
                        continue;
                    }
                    if (done) {
                        if (failure !== undefined)
                            throw failure;
                        return;
                    }
                    await new Promise((resolve) => {
                        notify = resolve;
                    });
                }
            }
            finally {
                if (!done)
                    stream.cancel();
            }
        },
    };
}
function unary(client, method) {
    return (request, options = {}) => new Promise((resolve, reject) => {
        const call = client[method](request, metadataOf(options), grpcCallOptions(options), (error, response) => error ? reject(error) : resolve(response));
        cancelOnAbort(call, options.signal);
    });
}
function serverStreaming(client, method) {
    return (request, options = {}) => {
        const call = client[method](request, metadataOf(options), grpcCallOptions(options));
        cancelOnAbort(call, options.signal);
        return toAsyncIterable(call);
    };
}
function clientStreaming(client, method) {
    return async (requests, options = {}) => new Promise((resolve, reject) => {
        const call = client[method](metadataOf(options), grpcCallOptions(options), (error, response) => error ? reject(error) : resolve(response));
        cancelOnAbort(call, options.signal);
        void (async () => {
            try {
                for await (const request of requests) {
                    if (!call.write(request))
                        await once(call, "drain");
                }
                call.end();
            }
            catch (error) {
                call.destroy(error);
                reject(error);
            }
        })();
    });
}
function bidiStreaming(client, method) {
    return (requests, options = {}) => {
        const call = client[method](metadataOf(options), grpcCallOptions(options));
        cancelOnAbort(call, options.signal);
        void (async () => {
            try {
                for await (const request of requests) {
                    if (!call.write(request))
                        await once(call, "drain");
                }
                call.end();
            }
            catch (error) {
                call.destroy(error);
            }
        })();
        return toAsyncIterable(call);
    };
}
export function createPromiseClient(client, definition) {
    const grpcClient = client;
    const wrapped = {};
    for (const [name, method] of Object.entries(definition)) {
        if (!method.requestStream && !method.responseStream) {
            wrapped[name] = unary(grpcClient, name);
        }
        else if (!method.requestStream) {
            wrapped[name] = serverStreaming(grpcClient, name);
        }
        else if (!method.responseStream) {
            wrapped[name] = clientStreaming(grpcClient, name);
        }
        else {
            wrapped[name] = bidiStreaming(grpcClient, name);
        }
    }
    return wrapped;
}
//# sourceMappingURL=promise-runtime.js.map