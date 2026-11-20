import type { Metadata, ServiceDefinition } from "@grpc/grpc-js";
export interface CallOptions {
    /** Per-call metadata (grpc-js `Metadata`, same as the callback client). */
    metadata?: Metadata;
    /** Absolute deadline, as a `Date` or a number of milliseconds since epoch. */
    deadline?: number | Date;
    /** Cancels the call when aborted. */
    signal?: AbortSignal;
}
type AnyClient = Record<string, (...args: any[]) => any>;
export declare function createPromiseClient(client: object, definition: ServiceDefinition): AnyClient;
export {};
