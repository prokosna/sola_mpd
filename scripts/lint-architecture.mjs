// Enforces the import rules in docs/architecture.md and
// docs/adr/0001-inbound-messaging-and-composition-root.md. Biome cannot
// express path-dependent import rules, so this reads the import lists
// oxc-parser extracts.
import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { parseSync } from "oxc-parser";

const ROOT = process.cwd();

// Protobuf output, matching the exclusions in biome.json.
const GENERATED_GLOBS = [
	"packages/shared/src/models/**",
	"plugins/*/src/models/**",
];

const SOURCE_GLOBS = [
	"packages/*/src/**/*.{ts,tsx}",
	"plugins/*/src/**/*.{ts,tsx}",
];

/** Library -> files (or folders, ending in `/`) allowed to import it. */
const LIBRARY_OWNERS = {
	"socket.io": [
		"packages/backend/src/lib/messaging/MessagingServerSocketIo.ts",
		"packages/backend/src/index.ts",
	],
	"socket.io-client": [
		"packages/frontend/src/lib/messaging/MessagingClientSocketIo.ts",
	],
	electron: ["packages/desktop/src/"],
};

const WIRE_CODEC_NAMES = new Set([
	"fromBinary",
	"toBinary",
	"fromJson",
	"toJson",
]);

const DESKTOP_ENTRY_POINTS = [
	"packages/backend/src/createBackendDependencies.ts",
	"packages/backend/src/registerMessagingHandlers.ts",
];
const DESKTOP_FORBIDDEN = ["socket.io", "express", "better-sqlite3"];
const DESKTOP_FORBIDDEN_PREFIXES = ["@modelcontextprotocol/"];

const toPosix = (path) => path.split(sep).join("/");

function isTestOnlyFile(file) {
	return (
		/\.test\.tsx?$/.test(file) ||
		/(^|\/)(testHelpers|fake[^/]*)\.tsx?$/.test(file)
	);
}

/** Bare package name of a specifier, or undefined for relative and alias paths. */
function packageName(specifier) {
	if (specifier.startsWith(".") || specifier.startsWith("#")) {
		return undefined;
	}
	const parts = specifier.replace(/^node:/, "").split("/");
	return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/** Absolute path a relative or `#backend/*` specifier points at, without extension probing. */
function rawTarget(fromFile, specifier) {
	if (specifier.startsWith(".")) {
		return resolve(dirname(fromFile), specifier);
	}
	if (specifier.startsWith("#backend/")) {
		return join(
			ROOT,
			"packages/backend/src",
			specifier.slice("#backend/".length),
		);
	}
	return undefined;
}

/** Maps a `.js` specifier to the `.ts(x)` file it stands for. */
function resolveSourceFile(target) {
	const stem = target.replace(/\.[cm]?jsx?$/, "");
	const candidates = [
		target,
		`${stem}.ts`,
		`${stem}.tsx`,
		`${target}.ts`,
		`${target}.tsx`,
		join(target, "index.ts"),
		join(target, "index.tsx"),
	];
	return candidates.find((c) => /\.tsx?$/.test(c) && existsSync(c));
}

function createLineOf(text) {
	const lineStarts = [0];
	for (let i = 0; i < text.length; i++) {
		if (text[i] === "\n") {
			lineStarts.push(i + 1);
		}
	}
	return (offset) => {
		let low = 0;
		let high = lineStarts.length - 1;
		while (low < high) {
			const mid = (low + high + 1) >> 1;
			if (lineStarts[mid] <= offset) {
				low = mid;
			} else {
				high = mid - 1;
			}
		}
		return low + 1;
	};
}

const importCache = new Map();

/**
 * Every import, re-export and string-literal dynamic import of a file.
 * `typeOnly` is true when nothing is emitted at runtime; `names` holds the
 * imported binding names.
 */
function readImports(file) {
	const cached = importCache.get(file);
	if (cached) {
		return cached;
	}
	const text = readFileSync(file, "utf8");
	const { module } = parseSync(file, text);
	const lineOf = createLineOf(text);
	const imports = [];

	for (const decl of module.staticImports) {
		imports.push({
			specifier: decl.moduleRequest.value,
			line: lineOf(decl.start),
			typeOnly: decl.entries.length > 0 && decl.entries.every((e) => e.isType),
			names: decl.entries.map((e) => e.importName.name ?? "default"),
		});
	}
	for (const decl of module.staticExports) {
		const bySource = new Map();
		for (const entry of decl.entries) {
			if (entry.moduleRequest) {
				const list = bySource.get(entry.moduleRequest.value) ?? [];
				list.push(entry);
				bySource.set(entry.moduleRequest.value, list);
			}
		}
		for (const [specifier, entries] of bySource) {
			imports.push({
				specifier,
				line: lineOf(decl.start),
				typeOnly: entries.every((e) => e.isType),
				names: entries.map((e) => e.importName.name ?? "*"),
			});
		}
	}
	for (const dyn of module.dynamicImports) {
		const raw = text.slice(dyn.moduleRequest.start, dyn.moduleRequest.end);
		const literal = raw.match(/^(["'`])(.*)\1$/s);
		if (literal) {
			imports.push({
				specifier: literal[2],
				line: lineOf(dyn.start),
				typeOnly: false,
				names: [],
			});
		}
	}

	importCache.set(file, imports);
	return imports;
}

/** True when a directory (not the file name) on the path has this name. */
function hasSegment(path, segment) {
	return toPosix(path).split("/").slice(0, -1).includes(segment);
}

function importsFolder(fromFile, specifier, folders) {
	const target = rawTarget(fromFile, specifier);
	return target !== undefined && folders.some((f) => hasSegment(target, f));
}

const findings = [];
const report = (file, line, message) =>
	findings.push({ file: toPosix(relative(ROOT, file)), line, message });

const generated = new Set(
	GENERATED_GLOBS.flatMap((glob) => globSync(glob)).map((f) => toPosix(f)),
);
const files = [...new Set(SOURCE_GLOBS.flatMap((glob) => globSync(glob)))]
	.map(toPosix)
	.filter((file) => !generated.has(file) && !isTestOnlyFile(file))
	.sort();

for (const file of files) {
	const abs = resolve(ROOT, file);
	const inApplication = hasSegment(abs, "application");
	const inTransports = hasSegment(abs, "transports");

	for (const imp of readImports(abs)) {
		const lib = packageName(imp.specifier);

		const owners = lib && LIBRARY_OWNERS[lib];
		if (
			owners &&
			!owners.some((o) => (o.endsWith("/") ? file.startsWith(o) : file === o))
		) {
			report(
				file,
				imp.line,
				`"${lib}" may only be imported by ${owners.join(", ")}`,
			);
		}

		const isPortFolder = importsFolder(abs, imp.specifier, [
			"services",
			"repositories",
		]);

		if (inApplication) {
			if (lib === "@bufbuild/protobuf") {
				for (const name of imp.names) {
					if (WIRE_CODEC_NAMES.has(name)) {
						report(
							file,
							imp.line,
							`use cases must not import ${name} from "@bufbuild/protobuf"; encode and decode in a transport`,
						);
					}
				}
			}
			if (importsFolder(abs, imp.specifier, ["transports"])) {
				report(
					file,
					imp.line,
					`use cases must not import from transports: "${imp.specifier}"`,
				);
			}
			if (isPortFolder && !imp.typeOnly) {
				report(
					file,
					imp.line,
					`use cases may import services/repositories only as types (use "import type"): "${imp.specifier}"`,
				);
			}
		}

		if (inTransports && isPortFolder && !imp.typeOnly) {
			report(
				file,
				imp.line,
				`transports may import services/repositories only as types (use "import type"): "${imp.specifier}"`,
			);
		}
	}
}

// Desktop bundles the closure of these entry points into the Electron main process.
function checkDesktopClosure() {
	const parent = new Map();
	const queue = [];
	for (const entry of DESKTOP_ENTRY_POINTS) {
		const abs = resolve(ROOT, entry);
		if (!existsSync(abs)) {
			report(abs, 1, "desktop-safe entry point does not exist");
			continue;
		}
		parent.set(abs, undefined);
		queue.push(abs);
	}

	const chainTo = (file) => {
		const chain = [];
		for (let f = file; f !== undefined; f = parent.get(f)) {
			chain.unshift(toPosix(relative(ROOT, f)));
		}
		return chain.join(" -> ");
	};

	while (queue.length > 0) {
		const file = queue.shift();
		for (const imp of readImports(file)) {
			const lib = packageName(imp.specifier);
			if (
				lib &&
				(DESKTOP_FORBIDDEN.includes(lib) ||
					DESKTOP_FORBIDDEN_PREFIXES.some((p) => imp.specifier.startsWith(p)))
			) {
				report(
					file,
					imp.line,
					`"${imp.specifier}" is not desktop-safe but is reachable from the desktop core: ${chainTo(file)} -> ${imp.specifier}`,
				);
				continue;
			}
			const target = rawTarget(file, imp.specifier);
			const next = target && resolveSourceFile(target);
			if (next && !parent.has(next)) {
				parent.set(next, file);
				queue.push(next);
			}
		}
	}
}

checkDesktopClosure();

if (findings.length > 0) {
	findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
	for (const { file, line, message } of findings) {
		console.error(`${file}:${line}: ${message}`);
	}
	console.error(
		`\n${findings.length} architecture violation${findings.length === 1 ? "" : "s"}. See docs/architecture.md.`,
	);
	process.exit(1);
}
