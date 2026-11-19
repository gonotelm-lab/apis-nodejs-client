import type { ChannelCredentials, ChannelOptions, Client } from "nice-grpc";
import { IdentityServiceDefinition } from "./apps/notelm/admin/identity/v1/identity_service.js";
export declare function createIdentityServiceClient(address: string, credentials?: ChannelCredentials, options?: ChannelOptions): Client<typeof IdentityServiceDefinition>;
