import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
/** Identity 账号已绑定的一条三方身份 */
export interface Identity {
    /** 绑定记录 id（解绑时用） */
    id: string;
    provider: Identity_Provider;
    /** 三方侧 subject（全局唯一键的一部分） */
    subject: string;
    providerEmail: string;
    providerEmailVerified: boolean;
    boundAt: Date | undefined;
    lastLoginAt: Date | undefined;
}
export declare enum Identity_Provider {
    PROVIDER_UNSPECIFIED = 0,
    PROVIDER_GITHUB = 1,
    PROVIDER_GOOGLE = 2,
    UNRECOGNIZED = -1
}
export declare function identity_ProviderFromJSON(object: any): Identity_Provider;
export declare function identity_ProviderToJSON(object: Identity_Provider): string;
export interface User {
    id: string;
    nickname: string;
    emailVerifiedAt: Date | undefined;
    status: User_Status;
    avatar: string;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
    hasPassword: boolean;
    identities: Identity[];
}
export declare enum User_Status {
    STATUS_UNSPECIFIED = 0,
    STATUS_ACTIVE = 1,
    STATUS_BANNED = 2,
    UNRECOGNIZED = -1
}
export declare function user_StatusFromJSON(object: any): User_Status;
export declare function user_StatusToJSON(object: User_Status): string;
export interface GetUserRequest {
    id: string;
}
export interface GetUserResponse {
    user: User | undefined;
}
export interface SetUserStatusRequest {
    id: string;
    status: User_Status;
}
export interface SetUserStatusResponse {
    user: User | undefined;
}
export declare const Identity: MessageFns<Identity>;
export declare const User: MessageFns<User>;
export declare const GetUserRequest: MessageFns<GetUserRequest>;
export declare const GetUserResponse: MessageFns<GetUserResponse>;
export declare const SetUserStatusRequest: MessageFns<SetUserStatusRequest>;
export declare const SetUserStatusResponse: MessageFns<SetUserStatusResponse>;
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
type KeysOfUnion<T> = T extends T ? keyof T : never;
type Exact<P, I> = P extends Builtin ? P : P & {
    [K in keyof P as Extract<K, keyof I>]: Exact<P[K], I[K & keyof I]>;
} & {
    [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
};
interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;
    decode(input: BinaryReader | Uint8Array, length?: number): T;
    fromJSON(object: any): T;
    toJSON(message: T): unknown;
    create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
    fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
export {};
