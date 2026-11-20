// Biome has no rule for comment length, and its GritQL plugins cannot match
// trivia, so this reads the comments oxc-parser collects instead.
import { globSync, readFileSync, statSync } from "node:fs";
import { relative } from "node:path";
import { parseSync } from "oxc-parser";

const MAX_COMMENT_LINES = 4;

// Protobuf output, matching the exclusions in biome.json.
const GENERATED_GLOBS = [
	"packages/shared/src/models/**",
	"plugins/*/src/models/**",
];

/**
 * Every comment in the file, in source order, with runs of consecutive
 * full-line `//` comments merged into one block.
 */
function collectCommentBlocks(fileName, text) {
	const { comments } = parseSync(fileName, text);

	const lineStarts = [0];
	for (let i = 0; i < text.length; i++) {
		if (text[i] === "\n") {
			lineStarts.push(i + 1);
		}
	}
	const lineOf = (offset) => {
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
		return low;
	};

	const blocks = [];
	for (const comment of comments) {
		const startLine = lineOf(comment.start);
		const endLine = lineOf(comment.end);
		const isSingleLine = comment.type === "Line";
		// End-of-line comments annotate their own line, so a column of them is
		// not one long comment.
		const isMergeable =
			isSingleLine &&
			text.slice(lineStarts[startLine], comment.start).trim() === "";

		const previous = blocks.at(-1);
		if (
			previous?.isMergeable &&
			isMergeable &&
			startLine === previous.endLine + 1
		) {
			previous.endLine = endLine;
			previous.lines += 1;
			continue;
		}

		blocks.push({
			isMergeable,
			startLine,
			endLine,
			lines: isSingleLine
				? 1
				: countContentLines(text.slice(comment.start, comment.end)),
		});
	}
	return blocks;
}

/**
 * Lines of prose: delimiters do not count, and neither does anything from the
 * first JSDoc tag on, since `@param` and friends document an API rather than
 * explaining code.
 */
function countContentLines(comment) {
	let count = 0;
	for (const raw of comment.split("\n")) {
		const line = raw
			.trim()
			.replace(/^\/\*+/, "")
			.replace(/\*+\/$/, "")
			.replace(/^\*/, "")
			.trim();
		if (line.startsWith("@")) {
			break;
		}
		if (line !== "") {
			count += 1;
		}
	}
	return count;
}

/** Expands a path argument the way biome does: a directory means everything under it. */
function resolveTarget(target) {
	const matches = globSync(target);
	if (matches.length === 0) {
		console.error(`No such file or directory: ${target}`);
		process.exit(1);
	}
	return matches.flatMap((match) =>
		statSync(match).isDirectory()
			? globSync(`${match}/**/*.{ts,tsx}`)
			: [match],
	);
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
	console.error("Usage: node scripts/lint-comments.mjs <path>...");
	process.exit(1);
}

const generated = new Set(GENERATED_GLOBS.flatMap((glob) => globSync(glob)));
const files = [...new Set(targets.flatMap(resolveTarget))]
	.filter((file) => /\.tsx?$/.test(file) && !generated.has(file))
	.sort();

const findings = [];
for (const file of files) {
	const text = readFileSync(file, "utf8");
	for (const block of collectCommentBlocks(file, text)) {
		if (block.lines > MAX_COMMENT_LINES) {
			findings.push({ file: relative(process.cwd(), file), block });
		}
	}
}

if (findings.length > 0) {
	console.warn(
		`\n[33mwarning[0m  ${findings.length} comment${findings.length === 1 ? "" : "s"} longer than ${MAX_COMMENT_LINES} lines:\n`,
	);
	for (const { file, block } of findings) {
		console.warn(`  ${file}:${block.startLine + 1}  (${block.lines} lines)`);
	}
	console.warn(
		"\nA comment that long is usually narration, an apology for the code, or\nreasoning that belongs in the commit message. See CLAUDE.md.\n",
	);
}
