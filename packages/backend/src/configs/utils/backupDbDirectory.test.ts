import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { backupDbDirectory } from "./backupDbDirectory.js";

describe("backupDbDirectory", () => {
	let dbDirectoryPath: string;

	beforeEach(() => {
		dbDirectoryPath = fs.mkdtempSync(
			path.join(os.tmpdir(), "sola-mpd-backup-test-"),
		);
	});

	afterEach(() => {
		fs.rmSync(dbDirectoryPath, { recursive: true, force: true });
	});

	it("copies the top-level json files into a timestamped backup and writes the marker", () => {
		fs.writeFileSync(
			path.join(dbDirectoryPath, "browser_state.json"),
			'{"a":1}',
		);
		fs.writeFileSync(path.join(dbDirectoryPath, "notes.txt"), "not json");

		backupDbDirectory(dbDirectoryPath);

		expect(fs.existsSync(path.join(dbDirectoryPath, ".backup-v1-done"))).toBe(
			true,
		);

		const backupsRoot = path.join(dbDirectoryPath, "backups");
		const snapshots = fs.readdirSync(backupsRoot);
		expect(snapshots).toHaveLength(1);

		const snapshotDir = path.join(backupsRoot, snapshots[0]);
		expect(fs.readdirSync(snapshotDir)).toEqual(["browser_state.json"]);
		expect(
			fs.readFileSync(path.join(snapshotDir, "browser_state.json"), "utf-8"),
		).toBe('{"a":1}');
		// Filesystem-safe: no colons, which ISO8601 would contain.
		expect(snapshots[0]).not.toContain(":");
	});

	it("does nothing on a second call, so db/backups never copies itself", () => {
		fs.writeFileSync(
			path.join(dbDirectoryPath, "browser_state.json"),
			'{"a":1}',
		);

		backupDbDirectory(dbDirectoryPath);
		const backupsRoot = path.join(dbDirectoryPath, "backups");
		const snapshotsAfterFirst = fs.readdirSync(backupsRoot);
		expect(snapshotsAfterFirst).toHaveLength(1);

		backupDbDirectory(dbDirectoryPath);
		const snapshotsAfterSecond = fs.readdirSync(backupsRoot);
		expect(snapshotsAfterSecond).toEqual(snapshotsAfterFirst);

		// The one snapshot that does exist must not have absorbed `backups/`.
		const snapshotDir = path.join(backupsRoot, snapshotsAfterSecond[0]);
		expect(fs.readdirSync(snapshotDir)).toEqual(["browser_state.json"]);
	});

	it("logs and continues without writing the marker when the directory cannot be read", () => {
		const notADirectory = path.join(dbDirectoryPath, "actually_a_file");
		fs.writeFileSync(notADirectory, "");
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => backupDbDirectory(notADirectory)).not.toThrow();

		expect(errorSpy).toHaveBeenCalled();
		expect(fs.existsSync(path.join(notADirectory, ".backup-v1-done"))).toBe(
			false,
		);
		errorSpy.mockRestore();
	});
});
