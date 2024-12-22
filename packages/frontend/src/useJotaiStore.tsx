import { createStore } from "jotai";

import { browserStateRepositoryAtom } from "./features/browser";
import { mpdClientAtom, mpdListenerAtom } from "./features/mpd";
import {
  pluginServiceAtom,
  pluginStateRepositoryAtom,
} from "./features/plugin";
import { mpdProfileStateRepositoryAtom } from "./features/profile";
import { savedSearchRepositoryAtom } from "./features/search";
import { songTableStateRepositoryAtom } from "./features/song_table";
import { BrowserStateRepositoryImplHttp } from "./infrastructure/browser/BrowserStateRepositoryImplHttp";
import { HttpClientImplFetch } from "./infrastructure/http/HttpClientImplFetch";
import { MpdClientSocketIo } from "./infrastructure/mpd/MpdClientImplSocketIo";
import { MpdListenerImplSocketIo } from "./infrastructure/mpd/MpdListenerImplSocketIo";
import { MpdProfileStateRepositoryImplHttp } from "./infrastructure/mpd/MpdProfileStateRepositoryImplHttp";
import { PluginServiceImplSocketIo } from "./infrastructure/plugin/PluginServiceImplSocketIo";
import { PluginStateRepositoryImplHttp } from "./infrastructure/plugin/PluginStateRepositoryImplHttp";
import { SavedSearchRepositoryImplHttp } from "./infrastructure/search/SavedSearchRepositoryImplHttp";
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
      savedSearchRepositoryAtom,
      new SavedSearchRepositoryImplHttp(httpClient),
    );

    globalStore = store;
    return globalStore;
  };

  if (globalStore === undefined) {
    throw injectDependencies();
  }

  return globalStore;
}
