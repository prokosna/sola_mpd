import { SOCKETIO_CONFIG_CHANGED } from "@sola_mpd/shared/src/const/socketio.js";
import { createStore } from "jotai";
import { AdvancedSearchClientMessaging } from "./features/advanced_search/services/AdvancedSearchClientMessaging";
import { advancedSearchClientAtom } from "./features/advanced_search/states/atoms/advancedSearchClientAtom";
import { BrowserStateRepositoryMessaging } from "./features/browsing/browser/repositories/BrowserStateRepositoryMessaging";
import { browserStateRepositoryAtom } from "./features/browsing/browser/states/atoms/browserStateRepositoryAtom";
import { ViewStateBlobRepositoryMessaging } from "./features/browsing/common/repositories/ViewStateBlobRepositoryMessaging";
import { viewStateBlobRepositoryAtom } from "./features/browsing/common/states/atoms/viewStateBlobRepositoryAtom";
import { RecentlyAddedStateRepositoryMessaging } from "./features/browsing/recently_added/repositories/RecentlyAddedStateRepositoryMessaging";
import { recentlyAddedStateRepositoryAtom } from "./features/browsing/recently_added/states/atoms/recentlyAddedStateRepositoryAtom";
import { DeviceSettingsRepositoryLocalStorage } from "./features/common/repositories/DeviceSettingsRepositoryLocalStorage";
import { handleConfigChangedActionAtom } from "./features/common/states/actions/handleConfigChangedActionAtom";
import { deviceSettingsRepositoryAtom } from "./features/common/states/atoms/deviceSettingsRepositoryAtom";
import { MpdClientMessaging } from "./features/mpd/services/MpdClientMessaging";
import { MpdListenerMessaging } from "./features/mpd/services/MpdListenerMessaging";
import { setMpdClientActionAtom } from "./features/mpd/states/actions/setMpdClientActionAtom";
import { setMpdListenerActionAtom } from "./features/mpd/states/actions/setMpdListenerActionAtom";
import { PluginStateRepositoryMessaging } from "./features/plugin/repositories/PluginStateRepositoryMessaging";
import { PluginServiceMessaging } from "./features/plugin/services/PluginServiceMessaging";
import { pluginServiceAtom } from "./features/plugin/states/atoms/pluginServiceAtom";
import { pluginStateRepositoryAtom } from "./features/plugin/states/atoms/pluginStateRepositoryAtom";
import { MpdProfileStateRepositoryMessaging } from "./features/profile/repositories/MpdProfileStateRepositoryMessaging";
import { mpdProfileStateRepositoryAtom } from "./features/profile/states/atoms/mpdProfileStateRepositoryAtom";
import { SavedSearchesRepositoryMessaging } from "./features/search/repositories/SavedSearchesRepositoryMessaging";
import { savedSearchesRepositoryAtom } from "./features/search/states/atoms/savedSearchesRepositoryAtom";
import { SongTableStateRepositoryMessaging } from "./features/song_table/repositories/SongTableStateRepositoryMessaging";
import { ClipboardNavigator } from "./features/song_table/services/ClipboardNavigator";
import { clipboardAtom } from "./features/song_table/states/atoms/clipboardAtom";
import { songTableStateRepositoryAtom } from "./features/song_table/states/atoms/songTableStateRepositoryAtom";
import type { MessagingClient } from "./lib/messaging/MessagingClient";
import { MessagingClientElectronIpc } from "./lib/messaging/MessagingClientElectronIpc";
import { MessagingClientSocketIo } from "./lib/messaging/MessagingClientSocketIo";

let globalStore: ReturnType<typeof createStore> | undefined;
let globalStorePromise: Promise<ReturnType<typeof createStore>> | undefined;

async function injectDependencies(): Promise<ReturnType<typeof createStore>> {
	const store = createStore();

	let messagingClient: MessagingClient;
	if (window.__SOLA_IPC_BRIDGE__ !== undefined) {
		messagingClient = new MessagingClientElectronIpc(
			window.__SOLA_IPC_BRIDGE__,
		);
	} else {
		messagingClient = new MessagingClientSocketIo();
	}
	await messagingClient.isReady();

	await messagingClient.on(SOCKETIO_CONFIG_CHANGED, (payload) => {
		store.set(handleConfigChangedActionAtom, new TextDecoder().decode(payload));
	});

	store.set(setMpdClientActionAtom, new MpdClientMessaging(messagingClient));
	store.set(
		setMpdListenerActionAtom,
		new MpdListenerMessaging(messagingClient),
	);
	store.set(
		songTableStateRepositoryAtom,
		new SongTableStateRepositoryMessaging(messagingClient),
	);
	store.set(
		browserStateRepositoryAtom,
		new BrowserStateRepositoryMessaging(messagingClient),
	);
	store.set(
		viewStateBlobRepositoryAtom,
		new ViewStateBlobRepositoryMessaging(messagingClient),
	);
	store.set(
		pluginStateRepositoryAtom,
		new PluginStateRepositoryMessaging(messagingClient),
	);
	store.set(pluginServiceAtom, new PluginServiceMessaging(messagingClient));
	store.set(
		mpdProfileStateRepositoryAtom,
		new MpdProfileStateRepositoryMessaging(messagingClient),
	);
	store.set(
		savedSearchesRepositoryAtom,
		new SavedSearchesRepositoryMessaging(messagingClient),
	);
	store.set(
		recentlyAddedStateRepositoryAtom,
		new RecentlyAddedStateRepositoryMessaging(messagingClient),
	);
	store.set(
		advancedSearchClientAtom,
		new AdvancedSearchClientMessaging(messagingClient),
	);
	store.set(
		deviceSettingsRepositoryAtom,
		new DeviceSettingsRepositoryLocalStorage(),
	);
	store.set(clipboardAtom, new ClipboardNavigator());

	globalStore = store;
	return globalStore;
}

export function useJotaiStore() {
	if (globalStore === undefined) {
		if (globalStorePromise === undefined) {
			globalStorePromise = injectDependencies().catch((err) => {
				globalStorePromise = undefined;
				throw err;
			});
		}
		// Throw cached Promise to suspend until dependencies are ready.
		throw globalStorePromise;
	}

	return globalStore;
}
