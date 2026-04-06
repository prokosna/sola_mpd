import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { describe, expect, it } from "vitest";

import type { ProfileInput } from "../types/profileTypes";

import { buildMpdProfileStateWithNewProfile } from "./profileConstruction";

const baseInput: ProfileInput = {
	name: "New Profile",
	host: "192.168.1.100",
	port: 6600,
};

describe("buildMpdProfileStateWithNewProfile", () => {
	it("should add a new profile to the state", () => {
		const existingProfile = create(MpdProfileSchema, {
			name: "Existing",
			host: "localhost",
			port: 6600,
		});
		const currentState = create(MpdProfileStateSchema, {
			currentProfile: existingProfile,
			profiles: [existingProfile],
		});

		const result = buildMpdProfileStateWithNewProfile(currentState, baseInput);
		expect(result.profiles).toHaveLength(2);
		expect(result.profiles[1].name).toBe("New Profile");
		expect(result.profiles[1].host).toBe("192.168.1.100");
		expect(result.profiles[1].port).toBe(6600);
	});

	it("should set currentProfile when none exists", () => {
		const currentState = create(MpdProfileStateSchema, {
			profiles: [],
		});

		const result = buildMpdProfileStateWithNewProfile(currentState, baseInput);
		expect(result.currentProfile).toBeDefined();
		expect(result.currentProfile?.name).toBe("New Profile");
	});

	it("should not overwrite existing currentProfile", () => {
		const existingProfile = create(MpdProfileSchema, {
			name: "Existing",
			host: "localhost",
			port: 6600,
		});
		const currentState = create(MpdProfileStateSchema, {
			currentProfile: existingProfile,
			profiles: [existingProfile],
		});

		const result = buildMpdProfileStateWithNewProfile(currentState, baseInput);
		expect(result.currentProfile?.name).toBe("Existing");
	});

	it("should use empty string for undefined password", () => {
		const currentState = create(MpdProfileStateSchema, { profiles: [] });
		const input: ProfileInput = { ...baseInput, password: undefined };

		const result = buildMpdProfileStateWithNewProfile(currentState, input);
		expect(result.profiles[0].password).toBe("");
	});

	it("should preserve password when provided", () => {
		const currentState = create(MpdProfileStateSchema, { profiles: [] });
		const input: ProfileInput = { ...baseInput, password: "secret" };

		const result = buildMpdProfileStateWithNewProfile(currentState, input);
		expect(result.profiles[0].password).toBe("secret");
	});

	it("should not mutate the original state", () => {
		const currentState = create(MpdProfileStateSchema, { profiles: [] });

		buildMpdProfileStateWithNewProfile(currentState, baseInput);
		expect(currentState.profiles).toHaveLength(0);
	});
});
