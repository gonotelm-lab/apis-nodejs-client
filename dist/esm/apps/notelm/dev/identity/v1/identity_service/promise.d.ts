import type { CallOptions, ChannelCredentials, ChannelOptions } from "nice-grpc";
import type { GetUserRequest, GetUserResponse, SetUserStatusRequest, SetUserStatusResponse } from "../user.js";
export interface IdentityServiceClient {
    getUser(request: GetUserRequest, options?: CallOptions): Promise<GetUserResponse>;
    setUserStatus(request: SetUserStatusRequest, options?: CallOptions): Promise<SetUserStatusResponse>;
}
export declare function createIdentityServiceClient(address: string, credentials?: ChannelCredentials, options?: ChannelOptions): IdentityServiceClient;
