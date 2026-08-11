import { create } from "@bufbuild/protobuf";
import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
} from "@sola_mpd/shared/src/const/socketio.js";
import { BrowserStateSchema } from "@sola_mpd/shared/src/models/browser_pb.js";
import { MpdProfileStateSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { PluginStateSchema } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/shared/src/models/recently_added_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/shared/src/models/search_pb.js";
import { SongTableStateSchema } from "@sola_mpd/shared/src/models/song_table_pb.js";
import { createStore } from "jotai";
import { describe, expect, it, vi } from "vitest";

import { browserStateAsyncAtom } from "../../../browsing/browser/states/atoms/browserStateAtom";
import { browserStateRepositoryAtom } from "../../../browsing/browser/states/atoms/browserStateRepositoryAtom";
import { recentlyAddedStateAsyncAtom } from "../../../browsing/recently_added/states/atoms/recentlyAddedStateAtom";
import { recentlyAddedStateRepositoryAtom } from "../../../browsing/recently_added/states/atoms/recentlyAddedStateRepositoryAtom";
import { pluginAsyncAtom } from "../../../plugin/states/atoms/pluginAtom";
import { pluginServiceAtom } from "../../../plugin/states/atoms/pluginServiceAtom";
import { pluginStateRepositoryAtom } from "../../../plugin/states/atoms/pluginStateRepositoryAtom";
import { mpdProfileStateAsyncAtom } from "../../../profile/states/atoms/mpdProfileAtom";
import { mpdProfileStateRepositoryAtom } from "../../../profile/states/atoms/mpdProfileStateRepositoryAtom";
import { savedSearchesAsyncAtom } from "../../../search/states/atoms/savedSearchesAtom";
import { savedSearchesRepositoryAtom } from "../../../search/states/atoms/savedSearchesRepositoryAtom";
import { songTableStateAsyncAtom } from "../../../song_table/states/atoms/songTableAtom";
import { songTableStateRepositoryAtom } from "../../../song_table/states/atoms/songTableStateRepositoryAtom";
import { deviceSettingsRepositoryAtom } from "../atoms/deviceSettingsRepositoryAtom";

import { handleConfigChangedActionAtom } from "./handleConfigChangedActionAtom";

function createFakeDeviceSettingsRepository() {
	return {
		get: vi.fn(),
		set: vi.fn(),
		remove: vi.fn(),
		listKeys: vi.fn().mockReturnValue([]),
	};
}

describe("handleConfigChangedActionAtom", () => {
	// Each case primes one repository's async atom, dispatches the config key,
	// and asserts fetch() ran again. fetch() being the only method ever invoked
	// is also the check that the refresh path never calls save(), which would
	// risk a broadcast storm.
	it("CONFIG_KEY_BROWSER_STATE refetches the browser state", async () => {
		const store = createStore();
		const fetch = vi
			.fn()
			.mockResolvedValue(create(BrowserStateSchema, { filters: [] }));
		store.set(browserStateRepositoryAtom, { fetch, save: vi.fn() });

		await store.get(browserStateAsyncAtom);
		expect(fetch).toHaveBeenCalledTimes(1);

		store.set(handleConfigChangedActionAtom, CONFIG_KEY_BROWSER_STATE);
		await store.get(browserStateAsyncAtom);

		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it("CONFIG_KEY_COMMON_SONG_TABLE_STATE refetches the song table state", async () => {
		const store = createStore();
		const fetch = vi
			.fn()
			.mockResolvedValue(create(SongTableStateSchema, { columns: [] }));
		store.set(songTableStateRepositoryAtom, { fetch, save: vi.fn() });

		await store.get(songTableStateAsyncAtom);
		expect(fetch).toHaveBeenCalledTimes(1);

		store.set(
			handleConfigChangedActionAtom,
			CONFIG_KEY_COMMON_SONG_TABLE_STATE,
		);
		await store.get(songTableStateAsyncAtom);

		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it("CONFIG_KEY_MPD_PROFILE_STATE refetches the mpd profile state", async () => {
		const store = createStore();
		const fetch = vi
			.fn()
			.mockResolvedValue(create(MpdProfileStateSchema, { profiles: [] }));
		store.set(mpdProfileStateRepositoryAtom, { fetch, save: vi.fn() });
		store.set(
			deviceSettingsRepositoryAtom,
			createFakeDeviceSettingsRepository(),
		);

		await store.get(mpdProfileStateAsyncAtom);
		expect(fetch).toHaveBeenCalledTimes(1);

		store.set(handleConfigChangedActionAtom, CONFIG_KEY_MPD_PROFILE_STATE);
		await store.get(mpdProfileStateAsyncAtom);

		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it("CONFIG_KEY_PLUGIN_STATE refetches the plugin state", async () => {
		const store = createStore();
		const fetch = vi
			.fn()
			.mockResolvedValue(create(PluginStateSchema, { plugins: [] }));
		store.set(pluginStateRepositoryAtom, { fetch, save: vi.fn() });
		// Never invoked: registerAllPluginsAndCheckAvailability short-circuits
		// on an empty plugin list, so a stub is enough.
		store.set(pluginServiceAtom, {
			register: vi.fn(),
			execute: vi.fn(),
		});

		await store.get(pluginAsyncAtom);
		expect(fetch).toHaveBeenCalledTimes(1);

		store.set(handleConfigChangedActionAtom, CONFIG_KEY_PLUGIN_STATE);
		await store.get(pluginAsyncAtom);

		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it("CONFIG_KEY_SAVED_SEARCHES refetches the saved searches", async () => {
		const store = createStore();
		const fetch = vi
			.fn()
			.mockResolvedValue(create(SavedSearchesSchema, { searches: [] }));
		store.set(savedSearchesRepositoryAtom, { fetch, save: vi.fn() });

		await store.get(savedSearchesAsyncAtom);
		expect(fetch).toHaveBeenCalledTimes(1);

		store.set(handleConfigChangedActionAtom, CONFIG_KEY_SAVED_SEARCHES);
		await store.get(savedSearchesAsyncAtom);

		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it("CONFIG_KEY_RECENTLY_ADDED_STATE refetches the recently added state", async () => {
		const store = createStore();
		const fetch = vi
			.fn()
			.mockResolvedValue(create(RecentlyAddedStateSchema, { filters: [] }));
		store.set(recentlyAddedStateRepositoryAtom, { fetch, save: vi.fn() });

		await store.get(recentlyAddedStateAsyncAtom);
		expect(fetch).toHaveBeenCalledTimes(1);

		store.set(handleConfigChangedActionAtom, CONFIG_KEY_RECENTLY_ADDED_STATE);
		await store.get(recentlyAddedStateAsyncAtom);

		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it("ignores an unknown config key instead of throwing", () => {
		const store = createStore();

		expect(() =>
			store.set(handleConfigChangedActionAtom, "some_future_config_key"),
		).not.toThrow();
	});
});
