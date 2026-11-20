// Shared runtime for the generated Promise flavor.
//
// The Promise client wraps the native generated grpc-js client, so the whole
// grpc-js `ClientOptions` surface (interceptors, channel overrides, channel
// options, callInvocationTransformer, ...) behaves exactly like the callback
// client. This module only adapts calls to Promises / AsyncIterables.
import { once } from "node:events";
import type {
  CallOptions as GrpcCallOptions,
  ClientDuplexStream,
  ClientReadableStream,
  ClientUnaryCall,
  ClientWritableStream,
  Metadata,
  ServiceDefinition,
  ServiceError,
} from "@grpc/grpc-js";
import { Metadata as GrpcMetadata } from "@grpc/grpc-js";

// grpc-js keeps Metadata as a separate argument and has no AbortSignal field.
// Promise calls fold those into one options object, then strip them before the
// native CallOptions are forwarded.
export type CallOptions = GrpcCallOptions & {
  /** Per-call metadata (grpc-js `Metadata`, same as the callback client). */
  metadata?: Metadata;
  /** Cancels the call when aborted. */
  signal?: AbortSignal;
};

type AnyClient = Record<string, (...args: any[]) => any>;

interface ReadableStreamLike<T> {
  on(event: "data", listener: (value: T) => void): void;
  on(event: "end", listener: () => void): void;
  on(event: "error", listener: (error: Error) => void): void;
  cancel(): void;
}

function grpcCallOptions(options: CallOptions): GrpcCallOptions {
  const { metadata: _metadata, signal: _signal, ...rest } = options;
  return rest;
}

function metadataOf(options: CallOptions): Metadata {
  return options.metadata ?? new GrpcMetadata();
}

function cancelOnAbort(call: { cancel(): void }, signal?: AbortSignal): void {
  if (!signal) return;

  if (signal.aborted) {
    call.cancel();
    return;
  }

  const cancel = () => call.cancel();
  signal.addEventListener("abort", cancel, { once: true });

  // Do not keep a finished call alive through a long-lived signal.
  (call as unknown as { on(event: string, listener: () => void): void }).on("status", () =>
    signal.removeEventListener("abort", cancel),
  );
}

// Buffer stream events so a call that fails before the caller starts iterating
// still reports the error instead of crashing the process.
function toAsyncIterable<T>(stream: ReadableStreamLike<T>): AsyncIterable<T> {
  const queue: T[] = [];
  let done = false;
  let failure: unknown;
  let notify: (() => void) | undefined;

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
            yield queue.shift() as T;
            continue;
          }

          if (done) {
            if (failure !== undefined) throw failure;
            return;
          }

          await new Promise<void>((resolve) => {
            notify = resolve;
          });
        }
      } finally {
        if (!done) stream.cancel();
      }
    },
  };
}

function unary(client: AnyClient, method: string) {
  return (request: unknown, options: CallOptions = {}): Promise<unknown> =>
    new Promise((resolve, reject) => {
      const call = client[method](
        request,
        metadataOf(options),
        grpcCallOptions(options),
        (error: ServiceError | null, response: unknown) =>
          error ? reject(error) : resolve(response),
      ) as ClientUnaryCall;

      cancelOnAbort(call, options.signal);
    });
}

function serverStreaming(client: AnyClient, method: string) {
  return (request: unknown, options: CallOptions = {}): AsyncIterable<unknown> => {
    const call = client[method](
      request,
      metadataOf(options),
      grpcCallOptions(options),
    ) as ClientReadableStream<unknown>;

    cancelOnAbort(call, options.signal);
    return toAsyncIterable(call as unknown as ReadableStreamLike<unknown>);
  };
}

function clientStreaming(client: AnyClient, method: string) {
  return async (requests: AsyncIterable<unknown>, options: CallOptions = {}): Promise<unknown> =>
    new Promise((resolve, reject) => {
      const call = client[method](
        metadataOf(options),
        grpcCallOptions(options),
        (error: ServiceError | null, response: unknown) =>
          error ? reject(error) : resolve(response),
      ) as ClientWritableStream<unknown>;

      cancelOnAbort(call, options.signal);

      void (async () => {
        try {
          for await (const request of requests) {
            if (!call.write(request)) await once(call, "drain");
          }
          call.end();
        } catch (error) {
          call.destroy(error as Error);
          reject(error);
        }
      })();
    });
}

function bidiStreaming(client: AnyClient, method: string) {
  return (requests: AsyncIterable<unknown>, options: CallOptions = {}): AsyncIterable<unknown> => {
    const call = client[method](
      metadataOf(options),
      grpcCallOptions(options),
    ) as ClientDuplexStream<unknown, unknown>;

    cancelOnAbort(call, options.signal);

    void (async () => {
      try {
        for await (const request of requests) {
          if (!call.write(request)) await once(call, "drain");
        }
        call.end();
      } catch (error) {
        call.destroy(error as Error);
      }
    })();

    return toAsyncIterable(call as unknown as ReadableStreamLike<unknown>);
  };
}

export function createPromiseClient(
  client: object,
  definition: ServiceDefinition,
): AnyClient {
  const grpcClient = client as AnyClient;
  const wrapped: AnyClient = {};

  for (const [name, method] of Object.entries(definition)) {
    if (!method.requestStream && !method.responseStream) {
      wrapped[name] = unary(grpcClient, name);
    } else if (!method.requestStream) {
      wrapped[name] = serverStreaming(grpcClient, name);
    } else if (!method.responseStream) {
      wrapped[name] = clientStreaming(grpcClient, name);
    } else {
      wrapped[name] = bidiStreaming(grpcClient, name);
    }
  }

  return wrapped;
}
