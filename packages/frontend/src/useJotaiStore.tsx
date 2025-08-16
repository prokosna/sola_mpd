import { createStore } from "jotai";

import { browserStateRepositoryAtom } from "./features/browsing/browser/states/browserStateRepository";
import { recentlyAddedStateRepositoryAtom } from "./features/browsing/recently_added/states/recentlyAddedStateRepository";
import { mpdClientAtom } from "./features/mpd/states/mpdClient";
import { mpdListenerAtom } from "./features/mpd/states/mpdListener";
import { pluginServiceAtom } from "./features/plugin/states/pluginServiceState";
import { pluginStateRepositoryAtom } from "./features/plugin/states/pluginStateRepository";
import { mpdProfileStateRepositoryAtom } from "./features/profile/states/mpdProfileStateRepository";
import { savedSearchesRepositoryAtom } from "./features/search/states/savedSearchesRepository";
import { songTableStateRepositoryAtom } from "./features/song_table/states/songTableStateRepository";
import { BrowserStateRepositoryImplHttp } from "./infrastructure/browser/BrowserStateRepositoryImplHttp";
import { HttpClientImplFetch } from "./infrastructure/http/HttpClientImplFetch";
import { MpdClientSocketIo } from "./infrastructure/mpd/MpdClientImplSocketIo";
import { MpdListenerImplSocketIo } from "./infrastructure/mpd/MpdListenerImplSocketIo";
import { MpdProfileStateRepositoryImplHttp } from "./infrastructure/mpd/MpdProfileStateRepositoryImplHttp";
import { PluginServiceImplSocketIo } from "./infrastructure/plugin/PluginServiceImplSocketIo";
import { PluginStateRepositoryImplHttp } from "./infrastructure/plugin/PluginStateRepositoryImplHttp";
import { RecentlyAddedStateRepositoryImplHttp } from "./infrastructure/recently_added/RecentlyAddedStateRepositoryImplHttp";
import { SavedSearchesRepositoryImplHttp } from "./infrastructure/search/SavedSearchesRepositoryImplHttp";
import { SocketIoClientImpl } from "./infrastructure/socket_io/SocketIoClientImpl";
import { SongTableStateRepositoryImplHttp } from "./infrastructure/song_table/SongTableStateRepositoryImplHttp";

let globalStore: ReturnType<typeof createStore> | undefined = undefined;

export function useJotaiStore() {
	const injectDependencies = async (): Promise<
		ReturnType<typeof createStore>
	> => {
		const store = createStore();

		// DI
		const httpClient = new HttpClientImplFetch();
		const socketIoClient = new SocketIoClientImpl();
		await socketIoClient.isReady();

		store.set(mpdClientAtom, new MpdClientSocketIo(socketIoClient));
		store.set(mpdListenerAtom, new MpdListenerImplSocketIo(socketIoClient));
		store.set(
			songTableStateRepositoryAtom,
			new SongTableStateRepositoryImplHttp(httpClient),
		);
		store.set(
			browserStateRepositoryAtom,
			new BrowserStateRepositoryImplHttp(httpClient),
		);
		store.set(
			pluginStateRepositoryAtom,
			new PluginStateRepositoryImplHttp(httpClient),
		);
		store.set(pluginServiceAtom, new PluginServiceImplSocketIo(socketIoClient));
		store.set(
			mpdProfileStateRepositoryAtom,
			new MpdProfileStateRepositoryImplHttp(httpClient),
		);
		store.set(
			savedSearchesRepositoryAtom,
			new SavedSearchesRepositoryImplHttp(httpClient),
		);
		store.set(
			recentlyAddedStateRepositoryAtom,
			new RecentlyAddedStateRepositoryImplHttp(httpClient),
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
