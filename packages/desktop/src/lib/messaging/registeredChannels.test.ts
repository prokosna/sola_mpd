import {
	CONFIG_KEY_BROWSER_STATE,
	CONFIG_KEY_COMMON_SONG_TABLE_STATE,
	CONFIG_KEY_MPD_PROFILE_STATE,
	CONFIG_KEY_PLUGIN_STATE,
	CONFIG_KEY_RECENTLY_ADDED_STATE,
	CONFIG_KEY_SAVED_SEARCHES,
	SOCKETIO_CONFIG_CHANGED,
	SOCKETIO_MPD_EVENT,
} from "@sola_mpd/shared/src/const/socketio.js";
import type { IpcMain } from "electron";
import { describe, expect, it, vi } from "vitest";
import type { BackendDependencies } from "#backend/createBackendDependencies.js";
import { registerMessagingHandlers } from "#backend/registerMessagingHandlers.js";
import {
	ALLOWED_INVOKE_CHANNELS,
	ALLOWED_RECEIVE_CHANNELS,
	CONFIG_KEYS,
} from "../../preload/channels.js";
import { MessagingServerElectronIpc } from "./MessagingServerElectronIpc.js";

const fakeRepository = () => ({ get: vi.fn(), update: vi.fn() });
const fakeDeps = {
	mpdClient: {},
	pluginClient: {},
	advancedSearchApi: {},
	configRepositories: {
		browserState: fakeRepository(),
		commonSongTableState: fakeRepository(),
		mpdProfileState: fakeRepository(),
		pluginState: fakeRepository(),
		recentlyAddedState: fakeRepository(),
		savedSearches: fakeRepository(),
	},
	viewStateBlobRepository: {},
} as unknown as BackendDependencies;

describe("desktop channel parity", () => {
	it("registers exactly the channels the preload allows to be invoked", () => {
		const channels: string[] = [];
		const ipcMain = {
			handle: vi.fn((channel: string) => {
				channels.push(channel);
			}),
		} as unknown as IpcMain;

		registerMessagingHandlers(
			new MessagingServerElectronIpc(ipcMain),
			fakeDeps,
		);

		expect(channels.sort()).toEqual([...ALLOWED_INVOKE_CHANNELS].sort());
	});

	it("keeps the preload config keys in sync with the shared constants", () => {
		expect([...CONFIG_KEYS].sort()).toEqual(
			[
				CONFIG_KEY_BROWSER_STATE,
				CONFIG_KEY_COMMON_SONG_TABLE_STATE,
				CONFIG_KEY_MPD_PROFILE_STATE,
				CONFIG_KEY_PLUGIN_STATE,
				CONFIG_KEY_RECENTLY_ADDED_STATE,
				CONFIG_KEY_SAVED_SEARCHES,
			].sort(),
		);
	});

	it("allows receiving the broadcast channels", () => {
		expect(ALLOWED_RECEIVE_CHANNELS.has(SOCKETIO_MPD_EVENT)).toBe(true);
		expect(ALLOWED_RECEIVE_CHANNELS.has(SOCKETIO_CONFIG_CHANGED)).toBe(true);
	});
});
