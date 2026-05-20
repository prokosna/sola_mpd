import { describe, expect, it } from "vitest";

import { validateSelectSql } from "./validateSelectSql.js";

describe("validateSelectSql", () => {
	it("accepts a plain SELECT", () => {
		expect(() => validateSelectSql("SELECT * FROM songs")).not.toThrow();
	});

	it("accepts WITH and EXPLAIN", () => {
		expect(() =>
			validateSelectSql("WITH t AS (SELECT 1) SELECT * FROM t"),
		).not.toThrow();
		expect(() =>
			validateSelectSql("EXPLAIN QUERY PLAN SELECT * FROM songs"),
		).not.toThrow();
	});

	it("ignores leading whitespace, line comments and block comments", () => {
		expect(() =>
			validateSelectSql("   -- pick everything\n  SELECT 1"),
		).not.toThrow();
		expect(() => validateSelectSql("/* multi\nline */ SELECT 1")).not.toThrow();
	});

	it("rejects DML and DDL", () => {
		expect(() => validateSelectSql("INSERT INTO songs VALUES (1)")).toThrow();
		expect(() => validateSelectSql("DELETE FROM songs")).toThrow();
		expect(() => validateSelectSql("DROP TABLE songs")).toThrow();
		expect(() => validateSelectSql("UPDATE songs SET artist = ''")).toThrow();
	});

	it("rejects empty input", () => {
		expect(() => validateSelectSql("   ")).toThrow();
	});
});
