"use strict";
// Hand-written scaffold. Exposes the same services through the native
// `@grpc/grpc-js` callback API, derived from the ts-proto generic service
// definitions that `buf` generates for the promise entry.
Object.defineProperty(exports, "__esModule", { value: true });
exports.toGrpcJsServiceDefinition = toGrpcJsServiceDefinition;
exports.createCallbackClient = createCallbackClient;
const grpc_js_1 = require("@grpc/grpc-js");
function serialize(type, value) {
    const message = type.fromPartial ? type.fromPartial(value) : value;
    return Buffer.from(type.encode(message).finish());
}
/**
 * Converts a ts-proto generic service definition into a `@grpc/grpc-js`
 * service definition. The result can be used both for `makeClientConstructor`
 * and for `server.addService`.
 */
function toGrpcJsServiceDefinition(definition) {
    const service = {};
    for (const [key, method] of Object.entries(definition.methods)) {
        const requestType = method.requestType;
        const responseType = method.responseType;
        service[key] = {
            path: `/${definition.fullName}/${method.name}`,
            requestStream: method.requestStream,
            responseStream: method.responseStream,
            requestSerialize: (value) => serialize(requestType, value),
            requestDeserialize: (bytes) => requestType.decode(bytes),
            responseSerialize: (value) => serialize(responseType, value),
            responseDeserialize: (bytes) => responseType.decode(bytes),
        };
    }
    return service;
}
/**
 * Creates a native `@grpc/grpc-js` client for a generated service definition.
 *
 * ```ts
 * const client = createCallbackClient(IdentityServiceDefinition, address, creds);
 * client.getUser({ id: "1" }, (error, response) => { ... });
 * ```
 */
function createCallbackClient(definition, address, credentials, options) {
    const ClientConstructor = (0, grpc_js_1.makeClientConstructor)(toGrpcJsServiceDefinition(definition), definition.fullName);
    return new ClientConstructor(address, credentials, options);
}
//# sourceMappingURL=callback.js.map