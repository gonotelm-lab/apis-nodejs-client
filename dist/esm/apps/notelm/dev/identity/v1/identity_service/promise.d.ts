import type { ChannelCredentials, ChannelOptions, Client } from "nice-grpc";
import { IdentityServiceService } from "../identity_service.js";
export type IdentityServiceClient = Client<typeof IdentityServiceService>;
export declare function createIdentityServiceClient(address: string, credentials?: ChannelCredentials, options?: ChannelOptions): IdentityServiceClient;
