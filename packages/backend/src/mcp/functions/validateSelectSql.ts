const PERMITTED_PREFIXES = ["select", "with", "explain"];

function stripLeadingNoise(sql: string): string {
	let cursor = 0;
	while (cursor < sql.length) {
		const remaining = sql.slice(cursor);
		const wsMatch = remaining.match(/^\s+/);
		if (wsMatch !== null) {
			cursor += wsMatch[0].length;
			continue;
		}
		if (remaining.startsWith("--")) {
			const newlineIndex = remaining.indexOf("\n");
			cursor += newlineIndex === -1 ? remaining.length : newlineIndex + 1;
			continue;
		}
		if (remaining.startsWith("/*")) {
			const end = remaining.indexOf("*/");
			cursor += end === -1 ? remaining.length : end + 2;
			continue;
		}
		break;
	}
	return sql.slice(cursor);
}

/**
 * Lightweight gate that rejects obviously non-SELECT SQL before handing it to
 * better-sqlite3. The SQLite connection separately runs in `query_only` mode
 * during user queries, so this gate is a defense-in-depth check that produces
 * a friendlier error than the engine's syntax error.
 */
export function validateSelectSql(sql: string): void {
	const stripped = stripLeadingNoise(sql).toLowerCase();
	if (stripped.length === 0) {
		throw new Error("SQL query is empty.");
	}
	const matched = PERMITTED_PREFIXES.some(
		(p) =>
			stripped.startsWith(`${p} `) ||
			stripped.startsWith(`${p}\n`) ||
			stripped.startsWith(`${p}(`) ||
			stripped === p,
	);
	if (!matched) {
		throw new Error(
			"Only SELECT / WITH / EXPLAIN statements are allowed in library_query_sql.",
		);
	}
}
