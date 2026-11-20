import type { CallOptions as GrpcCallOptions, Metadata, ServiceDefinition } from "@grpc/grpc-js";
export type CallOptions = GrpcCallOptions & {
    /** Per-call metadata (grpc-js `Metadata`, same as the callback client). */
    metadata?: Metadata;
    /** Cancels the call when aborted. */
    signal?: AbortSignal;
};
type AnyClient = Record<string, (...args: any[]) => any>;
export declare function createPromiseClient(client: object, definition: ServiceDefinition): AnyClient;
export {};
