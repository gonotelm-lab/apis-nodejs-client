import { type CallOptions, type ChannelCredentials, Client, type ClientOptions, type ClientUnaryCall, type handleUnaryCall, type Metadata, type ServiceError, type UntypedServiceImplementation } from "@grpc/grpc-js";
import { GetUserRequest, GetUserResponse } from "./user.js";
export type IdentityServiceService = typeof IdentityServiceService;
export declare const IdentityServiceService: {
    readonly getUser: {
        readonly path: "/apps.notelm.admin.identity.v1.IdentityService/GetUser";
        readonly requestStream: false;
        readonly responseStream: false;
        readonly requestSerialize: (value: GetUserRequest) => Buffer;
        readonly requestDeserialize: (value: Buffer) => GetUserRequest;
        readonly responseSerialize: (value: GetUserResponse) => Buffer;
        readonly responseDeserialize: (value: Buffer) => GetUserResponse;
    };
};
export interface IdentityServiceServer extends UntypedServiceImplementation {
    getUser: handleUnaryCall<GetUserRequest, GetUserResponse>;
}
export interface IdentityServiceClient extends Client {
    getUser(request: GetUserRequest, callback: (error: ServiceError | null, response: GetUserResponse) => void): ClientUnaryCall;
    getUser(request: GetUserRequest, metadata: Metadata, callback: (error: ServiceError | null, response: GetUserResponse) => void): ClientUnaryCall;
    getUser(request: GetUserRequest, metadata: Metadata, options: Partial<CallOptions>, callback: (error: ServiceError | null, response: GetUserResponse) => void): ClientUnaryCall;
}
export declare const IdentityServiceClient: {
    new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): IdentityServiceClient;
    service: typeof IdentityServiceService;
    serviceName: string;
};
