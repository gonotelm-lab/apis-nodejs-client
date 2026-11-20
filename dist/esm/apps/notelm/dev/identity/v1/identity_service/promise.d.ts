import type { ChannelCredentials, ClientOptions } from "@grpc/grpc-js";
import { type CallOptions } from "../../../../../../promise-runtime.js";
import type { GetUserRequest, GetUserResponse, SetUserStatusRequest, SetUserStatusResponse } from "../user.js";
export type { ClientOptions };
export interface IdentityServiceClient {
    getUser(request: GetUserRequest, options?: CallOptions): Promise<GetUserResponse>;
    setUserStatus(request: SetUserStatusRequest, options?: CallOptions): Promise<SetUserStatusResponse>;
}
export declare function createIdentityServiceClient(address: string, credentials?: ChannelCredentials, options?: ClientOptions): IdentityServiceClient;
