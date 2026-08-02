import type { McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";

import { toolResultJson } from "../functions/toolResult.js";
import { validateSelectSql } from "../functions/validateSelectSql.js";
import { resolveCurrentMpdProfile } from "../utils/currentMpdProfile.js";
import { ensureLibraryIndexUseCase } from "./libraryIndexUseCases.js";
import {
	errorToToolResult,
	type RegisterMcpToolsDeps,
} from "./mcpToolHelpers.js";

const DEFAULT_SQL_ROWS = 1000;

export function registerLibrarySqlTools(
	server: McpServer,
	deps: RegisterMcpToolsDeps,
): void {
	const { mpdClient, libraryIndex } = deps;

	const { sql_schema, notes } = libraryIndex.describe();
	server.registerTool(
		"library_query_sql",
		{
			title: "Run a SQL query against the library mirror",
			description: `Runs a read-only SQL query against the in-memory SQLite mirror of the MPD library. Only SELECT / WITH / EXPLAIN are accepted.

Schema:
${sql_schema}

${notes}

Behaviour: rows beyond row_limit (default ${DEFAULT_SQL_ROWS}) are dropped and the response sets truncated=true. Use LIMIT in your SQL or raise row_limit when you really need more — large result sets may exceed your context window.`,
			inputSchema: z.object({
				sql: z
					.string()
					.min(1)
					.describe(
						"Single SELECT / WITH / EXPLAIN statement. Use ? placeholders bound by `params`.",
					),
				params: z
					.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))
					.optional(),
				row_limit: z
					.number()
					.int()
					.positive()
					.optional()
					.describe(
						`Maximum rows to materialize. Default ${DEFAULT_SQL_ROWS}. Very large values may exhaust server memory or your context window.`,
					),
			}),
		},
		async (args) => {
			try {
				const profile = resolveCurrentMpdProfile();
				await ensureLibraryIndexUseCase({ profile, mpdClient, libraryIndex });
				validateSelectSql(args.sql);
				const result = libraryIndex.querySql(
					args.sql,
					args.params ?? [],
					args.row_limit ?? DEFAULT_SQL_ROWS,
				);
				return toolResultJson(result);
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);

	server.registerTool(
		"library_index_stats",
		{
			title: "Library mirror stats",
			description:
				"Returns metadata about the analytical SQLite mirror: when it was last built and how many songs it currently holds.",
			inputSchema: z.object({}),
		},
		async () => {
			try {
				const profile = resolveCurrentMpdProfile();
				await ensureLibraryIndexUseCase({ profile, mpdClient, libraryIndex });
				return toolResultJson(libraryIndex.stats());
			} catch (err) {
				return errorToToolResult(err);
			}
		},
	);
}
