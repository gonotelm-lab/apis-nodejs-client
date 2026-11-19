import { writeFileSync } from "node:fs";

writeFileSync("dist/cjs/package.json", '{"type":"commonjs"}\n');
writeFileSync("dist/esm/package.json", '{"type":"module"}\n');
