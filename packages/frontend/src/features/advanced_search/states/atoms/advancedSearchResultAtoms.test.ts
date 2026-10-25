import { create } from "@bufbuild/protobuf";
import {
	MpdProfileSchema,
	MpdProfileStateSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { SongSchema } from "@sola_mpd/shared/src/models/song_pb.js";
import { createStore, type PrimitiveAtom } from "jotai";
import { describe, expect, it, vi } from "vitest";
import type { DeviceSettingsRepository } from "../../../common";
import { deviceSettingsRepositoryAtom } from "../../../common";
import {
	currentMpdProfileAtom,
	mpdProfileStateAsyncAtom,
} from "../../../profile/states/atoms/mpdProfileAtom";
import type { AdvancedSearchClient } from "../../services/AdvancedSearchClient";
import { advancedSearchEndpointAtom } from "./advancedSearchAtom";
import { advancedSearchClientAtom } from "./advancedSearchClientAtom";
import {
	similaritySearchSongsAsyncAtom,
	similaritySearchTargetSongAtom,
} from "./similaritySearchAtom";
import {
	textToMusicSearchSongsAsyncAtom,
	textToMusicSearchTextAtom,
} from "./textToMusicSearchAtom";

const deviceSettingsRepository: DeviceSettingsRepository = {
	get: ((_key: string, defaultValue?: unknown) =>
		defaultValue) as DeviceSettingsRepository["get"],
	set: vi.fn() as DeviceSettingsRepository["set"],
	remove: vi.fn() as DeviceSettingsRepository["remove"],
	listKeys: vi.fn(() => []) as DeviceSettingsRepository["listKeys"],
};

async function createStoreWithClient(client: AdvancedSearchClient) {
	const store = createStore();
	const profile = create(MpdProfileSchema, {
		name: "Home",
		host: "localhost",
		port: 6600,
	});
	store.set(deviceSettingsRepositoryAtom, deviceSettingsRepository);
	store.set(
		mpdProfileStateAsyncAtom,
		Promise.resolve(
			create(MpdProfileStateSchema, {
				currentProfile: profile,
				profiles: [profile],
			}),
		),
	);
	store.get(currentMpdProfileAtom);
	await new Promise((resolve) => setTimeout(resolve, 0));
	// Typed read-only because its initial value comes from an untyped env var.
	store.set(
		advancedSearchEndpointAtom as unknown as PrimitiveAtom<string | undefined>,
		"http://lainbow.test",
	);
	store.set(advancedSearchClientAtom, client);
	return store;
}

describe("advanced search result atoms", () => {
	it("similarity search resolves to an error result when the client rejects", async () => {
		const client: AdvancedSearchClient = {
			command: vi.fn().mockRejectedValue(new Error("network down")),
		};
		const store = await createStoreWithClient(client);
		store.set(
			similaritySearchTargetSongAtom,
			create(SongSchema, { path: "a.mp3" }),
		);

		const result = await store.get(similaritySearchSongsAsyncAtom);

		expect(client.command).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ kind: "error", message: "network down" });
	});

	it("text-to-music search resolves to an error result when the client rejects", async () => {
		const client: AdvancedSearchClient = {
			command: vi.fn().mockRejectedValue(new Error("network down")),
		};
		const store = await createStoreWithClient(client);
		store.set(textToMusicSearchTextAtom, "lofi");

		const result = await store.get(textToMusicSearchSongsAsyncAtom);

		expect(client.command).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ kind: "error", message: "network down" });
	});
});
