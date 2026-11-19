import type { CallContext, CallOptions } from "nice-grpc-common";
import { GetUserRequest, GetUserResponse } from "./user.js";
export type IdentityServiceDefinition = typeof IdentityServiceDefinition;
export declare const IdentityServiceDefinition: {
    readonly name: "IdentityService";
    readonly fullName: "apps.notelm.admin.identity.v1.IdentityService";
    readonly methods: {
        readonly getUser: {
            readonly name: "GetUser";
            readonly requestType: typeof GetUserRequest;
            readonly requestStream: false;
            readonly responseType: typeof GetUserResponse;
            readonly responseStream: false;
            readonly options: {};
        };
    };
};
export interface IdentityServiceImplementation<CallContextExt = {}> {
    getUser(request: GetUserRequest, context: CallContext & CallContextExt): Promise<DeepPartial<GetUserResponse>>;
}
export interface IdentityServiceClient<CallOptionsExt = {}> {
    getUser(request: DeepPartial<GetUserRequest>, options?: CallOptions & CallOptionsExt): Promise<GetUserResponse>;
}
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};
