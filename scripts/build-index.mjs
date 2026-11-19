import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../src/", import.meta.url));
const files = readdirSync(join(src, "apps"), { recursive: true })
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.split("\\").join("/"))
  .sort();

const body = files
  .map((file) => `export * from "./apps/${file.replace(/\.ts$/, ".js")}";`)
  .join("\n");

writeFileSync(join(src, "index.ts"), `${body}\n`);
