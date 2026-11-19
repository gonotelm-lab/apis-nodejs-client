"use strict";
// Hand-written scaffold. Do not delete: the sync job only replaces
// `src/{apps,google,buf}`, and `scripts/build-index.mjs` appends this entry to
// the generated root barrel.
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForChannelReady = exports.createClientFactory = exports.createClient = exports.createChannel = void 0;
var nice_grpc_1 = require("nice-grpc");
Object.defineProperty(exports, "createChannel", { enumerable: true, get: function () { return nice_grpc_1.createChannel; } });
Object.defineProperty(exports, "createClient", { enumerable: true, get: function () { return nice_grpc_1.createClient; } });
Object.defineProperty(exports, "createClientFactory", { enumerable: true, get: function () { return nice_grpc_1.createClientFactory; } });
Object.defineProperty(exports, "waitForChannelReady", { enumerable: true, get: function () { return nice_grpc_1.waitForChannelReady; } });
//# sourceMappingURL=promise.js.map