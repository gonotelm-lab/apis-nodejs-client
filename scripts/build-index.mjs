import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../src/", import.meta.url));
const files = readdirSync(join(src, "apps"), { recursive: true })
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.split("\\").join("/"))
  .sort();

const generated = files
  .map((file) => `export * from "./apps/${file.replace(/\.ts$/, ".js")}";`)
  .join("\n");

// `promise.ts` is hand-written scaffold, not generated. It is appended here so
// the root entry always exposes the nice-grpc client factory.
writeFileSync(
  join(src, "index.ts"),
  `${[generated, 'export * from "./promise.js";'].filter(Boolean).join("\n")}\n`,
);
