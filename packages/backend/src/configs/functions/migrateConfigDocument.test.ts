import type { JsonObject } from "@bufbuild/protobuf";
import { CONFIG_KEY_BROWSER_STATE } from "@sola_mpd/shared/src/const/socketio.js";
import { describe, expect, it } from "vitest";

import {
	CONFIG_MIGRATION_CHAINS,
	type ConfigMigrationChainTable,
	getConfigDocumentCurrentVersion,
	migrateConfigDocument,
} from "./migrateConfigDocument.js";

describe("migrateConfigDocument", () => {
	it("leaves the document unchanged when the chain is empty", () => {
		const doc: JsonObject = { schemaVersion: 1, filters: [] };

		const result = migrateConfigDocument(CONFIG_KEY_BROWSER_STATE, doc);

		expect(result).toEqual(doc);
	});

	it.each([
		undefined,
		0,
		1,
	])("treats schemaVersion %s as version 1", (schemaVersion) => {
		const doc: JsonObject =
			schemaVersion === undefined
				? { filters: [] }
				: { schemaVersion, filters: [] };

		expect(getConfigDocumentCurrentVersion(CONFIG_KEY_BROWSER_STATE)).toBe(1);
		expect(migrateConfigDocument(CONFIG_KEY_BROWSER_STATE, doc)).toEqual(doc);
	});

	it("runs an injected non-empty chain against a document with no schemaVersion", () => {
		const chains: ConfigMigrationChainTable = {
			...CONFIG_MIGRATION_CHAINS,
			[CONFIG_KEY_BROWSER_STATE]: [
				(doc: JsonObject) => ({ ...doc, migratedFromV1: true }),
			],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_BROWSER_STATE,
			{ filters: [] },
			chains,
		);

		expect(result).toEqual({ filters: [], migratedFromV1: true });
		expect(
			getConfigDocumentCurrentVersion(CONFIG_KEY_BROWSER_STATE, chains),
		).toBe(2);
	});

	it("chains multiple migrations in order across versions", () => {
		const chains: ConfigMigrationChainTable = {
			...CONFIG_MIGRATION_CHAINS,
			[CONFIG_KEY_BROWSER_STATE]: [
				(doc: JsonObject) => ({
					...doc,
					steps: [...(doc.steps as number[]), 1],
				}),
				(doc: JsonObject) => ({
					...doc,
					steps: [...(doc.steps as number[]), 2],
				}),
			],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_BROWSER_STATE,
			{ steps: [] },
			chains,
		);

		expect(result).toEqual({ steps: [1, 2] });
	});

	it("only runs the remaining migrations when starting from a mid-chain version", () => {
		const chains: ConfigMigrationChainTable = {
			...CONFIG_MIGRATION_CHAINS,
			[CONFIG_KEY_BROWSER_STATE]: [
				(doc: JsonObject) => ({
					...doc,
					steps: [...(doc.steps as number[]), 1],
				}),
				(doc: JsonObject) => ({
					...doc,
					steps: [...(doc.steps as number[]), 2],
				}),
			],
		};

		const result = migrateConfigDocument(
			CONFIG_KEY_BROWSER_STATE,
			{ schemaVersion: 2, steps: [] },
			chains,
		);

		expect(result).toEqual({ schemaVersion: 2, steps: [2] });
	});
});
