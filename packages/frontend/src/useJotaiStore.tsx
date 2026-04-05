import { createStore } from "jotai";
import { AdvancedSearchClientSocketIo } from "./features/advanced_search/services/AdvancedSearchClientSocketIo";
import { advancedSearchClientAtom } from "./features/advanced_search/states/atoms/advancedSearchClientAtom";
import { BrowserStateRepositoryHttp } from "./features/browsing/browser/services/BrowserStateRepositoryHttp";
import { browserStateRepositoryAtom } from "./features/browsing/browser/states/atoms/browserStateRepositoryAtom";
import { RecentlyAddedStateRepositoryHttp } from "./features/browsing/recently_added/services/RecentlyAddedStateRepositoryHttp";
import { recentlyAddedStateRepositoryAtom } from "./features/browsing/recently_added/states/atoms/recentlyAddedStateRepositoryAtom";
import { MpdClientSocketIo } from "./features/mpd/services/MpdClientSocketIo";
import { MpdListenerSocketIo } from "./features/mpd/services/MpdListenerSocketIo";
import { setMpdClientActionAtom } from "./features/mpd/states/actions/setMpdClientActionAtom";
import { setMpdListenerActionAtom } from "./features/mpd/states/actions/setMpdListenerActionAtom";
import { PluginServiceSocketIo } from "./features/plugin/services/PluginServiceSocketIo";
import { PluginStateRepositoryHttp } from "./features/plugin/services/PluginStateRepositoryHttp";
import { pluginServiceAtom } from "./features/plugin/states/atoms/pluginServiceAtom";
import { pluginStateRepositoryAtom } from "./features/plugin/states/atoms/pluginStateRepositoryAtom";
import { MpdProfileStateRepositoryHttp } from "./features/profile/services/MpdProfileStateRepositoryHttp";
import { mpdProfileStateRepositoryAtom } from "./features/profile/states/atoms/mpdProfileStateRepositoryAtom";
import { SavedSearchesRepositoryHttp } from "./features/search/services/SavedSearchesRepositoryHttp";
import { savedSearchesRepositoryAtom } from "./features/search/states/atoms/savedSearchesRepositoryAtom";
import { SongTableStateRepositoryHttp } from "./features/song_table/services/SongTableStateRepositoryHttp";
import { songTableStateRepositoryAtom } from "./features/song_table/states/atoms/songTableStateRepositoryAtom";
import { HttpClientFetch } from "./lib/http/HttpClientFetch";
import { SocketIoClientDefault } from "./lib/socket_io/SocketIoClientDefault";

let globalStore: ReturnType<typeof createStore> | undefined;

export function useJotaiStore() {
	const injectDependencies = async (): Promise<
		ReturnType<typeof createStore>
	> => {
		const store = createStore();

		// DI
		const httpClient = new HttpClientFetch();
		const socketIoClient = new SocketIoClientDefault();
		await socketIoClient.isReady();

		store.set(setMpdClientActionAtom, new MpdClientSocketIo(socketIoClient));
		store.set(
			setMpdListenerActionAtom,
			new MpdListenerSocketIo(socketIoClient),
		);
		store.set(
			songTableStateRepositoryAtom,
			new SongTableStateRepositoryHttp(httpClient),
		);
		store.set(
			browserStateRepositoryAtom,
			new BrowserStateRepositoryHttp(httpClient),
		);
		store.set(
			pluginStateRepositoryAtom,
			new PluginStateRepositoryHttp(httpClient),
		);
		store.set(pluginServiceAtom, new PluginServiceSocketIo(socketIoClient));
		store.set(
			mpdProfileStateRepositoryAtom,
			new MpdProfileStateRepositoryHttp(httpClient),
		);
		store.set(
			savedSearchesRepositoryAtom,
			new SavedSearchesRepositoryHttp(httpClient),
		);
		store.set(
			recentlyAddedStateRepositoryAtom,
			new RecentlyAddedStateRepositoryHttp(httpClient),
		);
		store.set(
			advancedSearchClientAtom,
			new AdvancedSearchClientSocketIo(socketIoClient),
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
