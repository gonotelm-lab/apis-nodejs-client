// Hand-written scaffold. Do not delete: the sync job only replaces
// `src/{apps,google,buf}`, and `scripts/build-index.mjs` appends this entry to
// the generated root barrel.

export {
  createChannel,
  createClient,
  createClientFactory,
  waitForChannelReady,
} from "nice-grpc";

export type {
  CallOptions,
  Channel,
  ChannelCredentials,
  ChannelOptions,
  Client,
} from "nice-grpc";
