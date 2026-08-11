import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { UpdateMode } from "../../../../types/stateTypes";
import type { MpdProfileStateRepository } from "../../repositories/MpdProfileStateRepository";
import {
	mpdProfileStateAsyncAtom,
	mpdProfileStateAtom,
} from "../atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../atoms/mpdProfileStateRepositoryAtom";

import { updateCurrentMpdProfileActionAtom } from "./updateCurrentMpdProfileActionAtom";

function createFakeMpdProfileStateRepository(): MpdProfileStateRepository {
	return {
		fetch: vi.fn(),
		save: vi.fn().mockResolvedValue(undefined),
	};
}

async function flush() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

// The action's only caller is "Set as default" in Settings, always with
// LOCAL_STATE | PERSIST. Ordinary profile switching goes through
// useChangeCurrentMpdProfile instead.
describe("updateCurrentMpdProfileActionAtom", () => {
	it(
		"updates the local mirror's currentProfile immediately on " +
			"LOCAL_STATE | PERSIST (regression: a derived 'is default' check " +
			"must flip without waiting for a refetch)",
		async () => {
			const store = createStore();
			store.set(
				mpdProfileStateRepositoryAtom,
				createFakeMpdProfileStateRepository(),
			);

			const profileA = create(MpdProfileSchema, {
				name: "A",
				host: "localhost",
				port: 6600,
			});
			const profileB = create(MpdProfileSchema, {
				name: "B",
				host: "localhost",
				port: 6601,
			});
			const state = create(MpdProfileStateSchema, {
				currentProfile: profileA,
				profiles: [profileA, profileB],
			});
			store.set(mpdProfileStateAsyncAtom, Promise.resolve(state));
			store.get(mpdProfileStateAtom); // primes the async->sync unwrap
			await flush();
			expect(store.get(mpdProfileStateAtom)?.currentProfile?.name).toBe("A");

			await store.set(updateCurrentMpdProfileActionAtom, {
				profile: profileB,
				mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
			});
			// The action swaps in a new (already-resolved) promise; the
			// unwrap layer needs one more microtask flush to register and
			// resolve it, same as the initial priming above.
			store.get(mpdProfileStateAtom);
			await flush();

			expect(store.get(mpdProfileStateAtom)?.currentProfile?.name).toBe("B");
		},
	);

	it("persists the new default to the server repository when PERSIST is set", async () => {
		const store = createStore();
		const mpdProfileStateRepository = createFakeMpdProfileStateRepository();
		store.set(mpdProfileStateRepositoryAtom, mpdProfileStateRepository);

		const profileA = create(MpdProfileSchema, {
			name: "A",
			host: "localhost",
			port: 6600,
		});
		const profileB = create(MpdProfileSchema, {
			name: "B",
			host: "localhost",
			port: 6601,
		});
		const state = create(MpdProfileStateSchema, {
			currentProfile: profileA,
			profiles: [profileA, profileB],
		});
		store.set(mpdProfileStateAsyncAtom, Promise.resolve(state));

		await store.set(updateCurrentMpdProfileActionAtom, {
			profile: profileB,
			mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		});

		expect(mpdProfileStateRepository.save).toHaveBeenCalledTimes(1);
		const savedState = (
			mpdProfileStateRepository.save as ReturnType<typeof vi.fn>
		).mock.calls[0][0];
		expect(savedState.currentProfile.name).toBe("B");
	});
});
