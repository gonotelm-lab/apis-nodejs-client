import { type CallOptions, type ChannelCredentials, type ChannelOptions, type Client, type ClientDuplexStream, type ClientReadableStream, type ClientUnaryCall, type ClientWritableStream, type Metadata, type ServiceDefinition as GrpcJsServiceDefinition, type ServiceError } from "@grpc/grpc-js";
import type { TsProtoServiceDefinition } from "nice-grpc";
/**
 * Converts a ts-proto generic service definition into a `@grpc/grpc-js`
 * service definition. The result can be used both for `makeClientConstructor`
 * and for `server.addService`.
 */
export declare function toGrpcJsServiceDefinition(definition: TsProtoServiceDefinition): GrpcJsServiceDefinition;
type MessageRequest<Method> = Method extends {
    requestType: {
        decode(input: Uint8Array): infer Request;
    };
} ? Request : never;
type MessageResponse<Method> = Method extends {
    responseType: {
        decode(input: Uint8Array): infer Response;
    };
} ? Response : never;
type UnaryCallback<Res> = (error: ServiceError | null, response: Res) => void;
type UnaryMethod<Req, Res> = {
    (request: Req, callback: UnaryCallback<Res>): ClientUnaryCall;
    (request: Req, metadata: Metadata, callback: UnaryCallback<Res>): ClientUnaryCall;
    (request: Req, metadata: Metadata, options: Partial<CallOptions>, callback: UnaryCallback<Res>): ClientUnaryCall;
};
type ServerStreamingMethod<Req, Res> = {
    (request: Req, metadata?: Metadata, options?: Partial<CallOptions>): ClientReadableStream<Res>;
};
type ClientStreamingMethod<Req, Res> = {
    (callback: UnaryCallback<Res>): ClientWritableStream<Req>;
    (metadata: Metadata, callback: UnaryCallback<Res>): ClientWritableStream<Req>;
    (metadata: Metadata, options: Partial<CallOptions>, callback: UnaryCallback<Res>): ClientWritableStream<Req>;
};
type BidiStreamingMethod<Req, Res> = {
    (metadata?: Metadata, options?: Partial<CallOptions>): ClientDuplexStream<Req, Res>;
};
type CallbackMethod<Req, Res, RequestStream extends boolean, ResponseStream extends boolean> = RequestStream extends true ? ResponseStream extends true ? BidiStreamingMethod<Req, Res> : ClientStreamingMethod<Req, Res> : ResponseStream extends true ? ServerStreamingMethod<Req, Res> : UnaryMethod<Req, Res>;
/** The callback client type derived from a service definition. */
export type CallbackClient<Def extends TsProtoServiceDefinition> = Client & {
    [K in keyof Def["methods"]]: CallbackMethod<MessageRequest<Def["methods"][K]>, MessageResponse<Def["methods"][K]>, Def["methods"][K]["requestStream"], Def["methods"][K]["responseStream"]>;
};
export type CallbackClientConstructor<Def extends TsProtoServiceDefinition> = {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CallbackClient<Def>;
};
/**
 * Creates a native `@grpc/grpc-js` client for a generated service definition.
 *
 * ```ts
 * const client = createCallbackClient(IdentityServiceDefinition, address, creds);
 * client.getUser({ id: "1" }, (error, response) => { ... });
 * ```
 */
export declare function createCallbackClient<Def extends TsProtoServiceDefinition>(definition: Def, address: string, credentials: ChannelCredentials, options?: Partial<ChannelOptions>): CallbackClient<Def>;
export {};
