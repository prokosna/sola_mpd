import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";
import type { MpdProfileStateRepository } from "../../repositories/MpdProfileStateRepository";
import {
	mpdProfileStateAsyncAtom,
	mpdProfileStateAtom,
} from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

import { deleteMpdProfileActionAtom } from "./deleteMpdProfileActionAtom";

function createFakeMpdProfileStateRepository(): MpdProfileStateRepository {
	return {
		fetch: vi.fn(),
		save: vi.fn().mockResolvedValue(undefined),
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("deleteMpdProfileActionAtom", () => {
	it("removes the profile, persists, and updates local state", async () => {
		const store = createStore();
		const mpdProfileStateRepository = createFakeMpdProfileStateRepository();
		store.set(mpdProfileStateRepositoryAtom, mpdProfileStateRepository);

		const profileHome = create(MpdProfileSchema, {
			name: "Home",
			host: "localhost",
			port: 6600,
		});
		const profileOffice = create(MpdProfileSchema, {
			name: "Office",
			host: "localhost",
			port: 6601,
		});
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileHome,
			profiles: [profileHome, profileOffice],
		});
		store.set(mpdProfileStateAsyncAtom, Promise.resolve(state));

		await store.set(deleteMpdProfileActionAtom, { profileName: "Home" });

		expect(mpdProfileStateRepository.save).toHaveBeenCalledTimes(1);
		const savedState = (
			mpdProfileStateRepository.save as ReturnType<typeof vi.fn>
		).mock.calls[0][0];
		expect(savedState.profiles.map((p: { name: string }) => p.name)).toEqual([
			"Office",
		]);

		store.get(mpdProfileStateAtom); // primes the async->sync unwrap
		await flush();
		expect(store.get(mpdProfileStateAtom)?.profiles.map((p) => p.name)).toEqual(
			["Office"],
		);
	});

	it("does nothing when the profile is not found", async () => {
		const store = createStore();
		const mpdProfileStateRepository = createFakeMpdProfileStateRepository();
		store.set(mpdProfileStateRepositoryAtom, mpdProfileStateRepository);

		const profileHome = create(MpdProfileSchema, {
			name: "Home",
			host: "localhost",
			port: 6600,
		});
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileHome,
			profiles: [profileHome],
		});
		store.set(mpdProfileStateAsyncAtom, Promise.resolve(state));

		await store.set(deleteMpdProfileActionAtom, {
			profileName: "NonExistent",
		});

		expect(mpdProfileStateRepository.save).not.toHaveBeenCalled();
	});
});
