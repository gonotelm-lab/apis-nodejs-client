import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
export interface User {
    id: string;
    nickname: string;
    emailVerifiedAt: Date | undefined;
    status: User_Status;
    avatar: string;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
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
export declare const User: MessageFns<User>;
export declare const GetUserRequest: MessageFns<GetUserRequest>;
export declare const GetUserResponse: MessageFns<GetUserResponse>;
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
