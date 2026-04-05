import { createStore } from "jotai";
import { advancedSearchClientAtom } from "./features/advanced_search/states/atoms/advancedSearchClientAtom";
import { browserStateRepositoryAtom } from "./features/browsing/browser/states/atoms/browserStateRepositoryAtom";
import { recentlyAddedStateRepositoryAtom } from "./features/browsing/recently_added/states/atoms/recentlyAddedStateRepositoryAtom";
import { setMpdClientActionAtom } from "./features/mpd/states/actions/setMpdClientActionAtom";
import { setMpdListenerActionAtom } from "./features/mpd/states/actions/setMpdListenerActionAtom";
import { pluginServiceAtom } from "./features/plugin/states/atoms/pluginServiceAtom";
import { pluginStateRepositoryAtom } from "./features/plugin/states/atoms/pluginStateRepositoryAtom";
import { mpdProfileStateRepositoryAtom } from "./features/profile/states/atoms/mpdProfileStateRepositoryAtom";
import { savedSearchesRepositoryAtom } from "./features/search/states/atoms/savedSearchesRepositoryAtom";
import { songTableStateRepositoryAtom } from "./features/song_table/states/atoms/songTableStateRepositoryAtom";
import { AdvancedSearchClientImplSocketIo } from "./infrastructure/advanced_search/AdvancedSearchClientImplSocketIo";
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

let globalStore: ReturnType<typeof createStore> | undefined;

export function useJotaiStore() {
	const injectDependencies = async (): Promise<
		ReturnType<typeof createStore>
	> => {
		const store = createStore();

		// DI
		const httpClient = new HttpClientImplFetch();
		const socketIoClient = new SocketIoClientImpl();
		await socketIoClient.isReady();

		store.set(setMpdClientActionAtom, new MpdClientSocketIo(socketIoClient));
		store.set(
			setMpdListenerActionAtom,
			new MpdListenerImplSocketIo(socketIoClient),
		);
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
		store.set(
			advancedSearchClientAtom,
			new AdvancedSearchClientImplSocketIo(socketIoClient),
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
