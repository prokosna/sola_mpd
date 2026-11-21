import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createConfigRepositoriesFile } from "../../configs/repositories/ConfigRepositoryFile.js";
import {
	MpdProfileNotFoundError,
	NoCurrentMpdProfileError,
	resolveCurrentMpdProfile,
} from "./currentMpdProfile.js";

describe("resolveCurrentMpdProfile", () => {
	let tempDir: string;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(
			path.join(os.tmpdir(), "sola-mpd-current-mpd-profile-test-"),
		);
		// db/ doesn't exist yet on the first write in a fresh temp dir, so the
		// backup logs a swallowed error; silence it to keep test output clean.
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		errorSpy.mockRestore();
		vi.restoreAllMocks();
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	function createRepository() {
		return createConfigRepositoriesFile(path.join(tempDir, "db"))
			.mpdProfileState;
	}

	function profile(name: string) {
		return create(MpdProfileSchema, {
			name,
			host: `${name}.local`,
			port: 6600,
		});
	}

	it("returns the named profile when it matches listMpdProfiles()", () => {
		const repository = createRepository();
		const a = profile("a");
		const b = profile("b");
		repository.update(
			create(MpdProfileStateSchema, { profiles: [a, b], currentProfile: a }),
		);

		expect(resolveCurrentMpdProfile(repository, "b")).toEqual(b);
	});

	it("throws MpdProfileNotFoundError when the named profile does not match", () => {
		const repository = createRepository();
		const a = profile("a");
		repository.update(
			create(MpdProfileStateSchema, { profiles: [a], currentProfile: a }),
		);

		expect(() => resolveCurrentMpdProfile(repository, "missing")).toThrow(
			MpdProfileNotFoundError,
		);
	});

	it("falls back to the workspace default profile when name is omitted", () => {
		const repository = createRepository();
		const a = profile("a");
		repository.update(
			create(MpdProfileStateSchema, { profiles: [a], currentProfile: a }),
		);

		expect(resolveCurrentMpdProfile(repository)).toEqual(a);
	});

	it("throws NoCurrentMpdProfileError when name is omitted and no default is set", () => {
		expect(() => resolveCurrentMpdProfile(createRepository())).toThrow(
			NoCurrentMpdProfileError,
		);
	});
});
