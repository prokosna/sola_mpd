import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const rootPkgPath = resolve(here, "../../../package.json");
const { version } = JSON.parse(readFileSync(rootPkgPath, "utf8"));

const result = spawnSync(
	"electron-builder",
	[`--config.extraMetadata.version=${version}`, ...process.argv.slice(2)],
	{ stdio: "inherit", shell: true },
);

process.exit(result.status ?? 1);
