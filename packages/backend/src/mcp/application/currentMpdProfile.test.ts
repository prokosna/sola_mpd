import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// mpdProfileStateRepository is a module-level singleton constructed from a
// path relative to process.cwd() (see ConfigRepositoryFile.test.ts), so each
// test chdirs into a fresh temp directory and re-imports the module
// (vi.resetModules) to keep runs isolated and avoid touching the real
// packages/backend/db/ runtime data.
describe("resolveCurrentMpdProfile", () => {
	let tempDir: string;
	let originalCwd: string;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(
			path.join(os.tmpdir(), "sola-mpd-current-mpd-profile-test-"),
		);
		originalCwd = process.cwd();
		process.chdir(tempDir);
		vi.resetModules();
		// db/ doesn't exist yet on the first import in a fresh temp dir, so
		// the module-level backupDbDirectory() call logs a swallowed error;
		// silence it to keep test output clean.
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		errorSpy.mockRestore();
		vi.restoreAllMocks();
		process.chdir(originalCwd);
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	function profile(name: string) {
		return create(MpdProfileSchema, {
			name,
			host: `${name}.local`,
			port: 6600,
		});
	}

	it("returns the named profile when it matches listMpdProfiles()", async () => {
		const { mpdProfileStateRepository } = await import(
			"../../configs/repositories/ConfigRepositoryFile.js"
		);
		const { resolveCurrentMpdProfile } = await import("./currentMpdProfile.js");

		const a = profile("a");
		const b = profile("b");
		mpdProfileStateRepository.update(
			create(MpdProfileStateSchema, { profiles: [a, b], currentProfile: a }),
		);

		expect(resolveCurrentMpdProfile("b")).toEqual(b);
	});

	it("throws MpdProfileNotFoundError when the named profile does not match", async () => {
		const { mpdProfileStateRepository } = await import(
			"../../configs/repositories/ConfigRepositoryFile.js"
		);
		const { resolveCurrentMpdProfile, MpdProfileNotFoundError } = await import(
			"./currentMpdProfile.js"
		);

		const a = profile("a");
		mpdProfileStateRepository.update(
			create(MpdProfileStateSchema, { profiles: [a], currentProfile: a }),
		);

		expect(() => resolveCurrentMpdProfile("missing")).toThrow(
			MpdProfileNotFoundError,
		);
	});

	it("falls back to the workspace default profile when name is omitted", async () => {
		const { mpdProfileStateRepository } = await import(
			"../../configs/repositories/ConfigRepositoryFile.js"
		);
		const { resolveCurrentMpdProfile } = await import("./currentMpdProfile.js");

		const a = profile("a");
		mpdProfileStateRepository.update(
			create(MpdProfileStateSchema, { profiles: [a], currentProfile: a }),
		);

		expect(resolveCurrentMpdProfile()).toEqual(a);
	});

	it("throws NoCurrentMpdProfileError when name is omitted and no default is set", async () => {
		const { resolveCurrentMpdProfile, NoCurrentMpdProfileError } = await import(
			"./currentMpdProfile.js"
		);

		expect(() => resolveCurrentMpdProfile()).toThrow(NoCurrentMpdProfileError);
	});
});
