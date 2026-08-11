// Biome has no rule for comment length, and its GritQL plugins cannot match
// trivia, so this walks the TypeScript CST instead.
import { globSync, readFileSync, statSync } from "node:fs";
import { relative } from "node:path";
import ts from "typescript";

const MAX_COMMENT_LINES = 4;

// Protobuf output, matching the exclusions in biome.json.
const GENERATED_GLOBS = [
	"packages/shared/src/models/**",
	"plugins/*/src/models/**",
];

/**
 * Every comment in the file, in source order, with runs of consecutive `//`
 * lines merged into one block.
 */
function collectCommentBlocks(fileName, text) {
	const sourceFile = ts.createSourceFile(
		fileName,
		text,
		ts.ScriptTarget.Latest,
		true,
		fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);

	const ranges = [];
	const seen = new Set();
	const visit = (node) => {
		const children = node.getChildren(sourceFile);
		if (children.length === 0) {
			for (const range of ts.getLeadingCommentRanges(text, node.pos) ?? []) {
				if (!seen.has(range.pos)) {
					seen.add(range.pos);
					ranges.push(range);
				}
			}
			return;
		}
		for (const child of children) {
			visit(child);
		}
	};
	visit(sourceFile);
	ranges.sort((a, b) => a.pos - b.pos);

	const blocks = [];
	for (const range of ranges) {
		const startLine = sourceFile.getLineAndCharacterOfPosition(range.pos).line;
		const endLine = sourceFile.getLineAndCharacterOfPosition(range.end).line;
		const isSingleLine = range.kind === ts.SyntaxKind.SingleLineCommentTrivia;

		const previous = blocks.at(-1);
		if (
			previous?.isSingleLine &&
			isSingleLine &&
			startLine === previous.endLine + 1
		) {
			previous.endLine = endLine;
			previous.lines += 1;
			continue;
		}

		blocks.push({
			isSingleLine,
			startLine,
			endLine,
			lines: isSingleLine
				? 1
				: countContentLines(text.slice(range.pos, range.end)),
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
