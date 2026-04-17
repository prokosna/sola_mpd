import { createStore } from "jotai";
import { AdvancedSearchClientSocketIo } from "./features/advanced_search/services/AdvancedSearchClientSocketIo";
import { advancedSearchClientAtom } from "./features/advanced_search/states/atoms/advancedSearchClientAtom";
import { BrowserStateRepositorySocketIo } from "./features/browsing/browser/repositories/BrowserStateRepositorySocketIo";
import { browserStateRepositoryAtom } from "./features/browsing/browser/states/atoms/browserStateRepositoryAtom";
import { RecentlyAddedStateRepositorySocketIo } from "./features/browsing/recently_added/repositories/RecentlyAddedStateRepositorySocketIo";
import { recentlyAddedStateRepositoryAtom } from "./features/browsing/recently_added/states/atoms/recentlyAddedStateRepositoryAtom";
import { MpdClientSocketIo } from "./features/mpd/services/MpdClientSocketIo";
import { MpdListenerSocketIo } from "./features/mpd/services/MpdListenerSocketIo";
import { setMpdClientActionAtom } from "./features/mpd/states/actions/setMpdClientActionAtom";
import { setMpdListenerActionAtom } from "./features/mpd/states/actions/setMpdListenerActionAtom";
import { PluginStateRepositorySocketIo } from "./features/plugin/repositories/PluginStateRepositorySocketIo";
import { PluginServiceSocketIo } from "./features/plugin/services/PluginServiceSocketIo";
import { pluginServiceAtom } from "./features/plugin/states/atoms/pluginServiceAtom";
import { pluginStateRepositoryAtom } from "./features/plugin/states/atoms/pluginStateRepositoryAtom";
import { MpdProfileStateRepositorySocketIo } from "./features/profile/repositories/MpdProfileStateRepositorySocketIo";
import { mpdProfileStateRepositoryAtom } from "./features/profile/states/atoms/mpdProfileStateRepositoryAtom";
import { SavedSearchesRepositorySocketIo } from "./features/search/repositories/SavedSearchesRepositorySocketIo";
import { savedSearchesRepositoryAtom } from "./features/search/states/atoms/savedSearchesRepositoryAtom";
import { SongTableStateRepositorySocketIo } from "./features/song_table/repositories/SongTableStateRepositorySocketIo";
import { songTableStateRepositoryAtom } from "./features/song_table/states/atoms/songTableStateRepositoryAtom";
import type { MessagingClient } from "./lib/messaging/MessagingClient";
import { MessagingClientElectronIpc } from "./lib/messaging/MessagingClientElectronIpc";
import { MessagingClientSocketIo } from "./lib/messaging/MessagingClientSocketIo";

let globalStore: ReturnType<typeof createStore> | undefined;

export function useJotaiStore() {
	const injectDependencies = async (): Promise<
		ReturnType<typeof createStore>
	> => {
		const store = createStore();

		// DI
		let messagingClient: MessagingClient;
		if (window.__SOLA_IPC_BRIDGE__ != null) {
			messagingClient = new MessagingClientElectronIpc(
				window.__SOLA_IPC_BRIDGE__,
			);
		} else {
			messagingClient = new MessagingClientSocketIo();
		}
		await messagingClient.isReady();

		store.set(setMpdClientActionAtom, new MpdClientSocketIo(messagingClient));
		store.set(
			setMpdListenerActionAtom,
			new MpdListenerSocketIo(messagingClient),
		);
		store.set(
			songTableStateRepositoryAtom,
			new SongTableStateRepositorySocketIo(messagingClient),
		);
		store.set(
			browserStateRepositoryAtom,
			new BrowserStateRepositorySocketIo(messagingClient),
		);
		store.set(
			pluginStateRepositoryAtom,
			new PluginStateRepositorySocketIo(messagingClient),
		);
		store.set(pluginServiceAtom, new PluginServiceSocketIo(messagingClient));
		store.set(
			mpdProfileStateRepositoryAtom,
			new MpdProfileStateRepositorySocketIo(messagingClient),
		);
		store.set(
			savedSearchesRepositoryAtom,
			new SavedSearchesRepositorySocketIo(messagingClient),
		);
		store.set(
			recentlyAddedStateRepositoryAtom,
			new RecentlyAddedStateRepositorySocketIo(messagingClient),
		);
		store.set(
			advancedSearchClientAtom,
			new AdvancedSearchClientSocketIo(messagingClient),
		);

		globalStore = store;
		return globalStore;
	};

	if (globalStore === undefined) {
		// Throw Promise to suspend until dependencies are ready.
		throw injectDependencies();
	}

	return globalStore;
}
