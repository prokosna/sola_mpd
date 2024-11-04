import { createStore } from "jotai";

import { mpdClientAtom } from "./features/mpd";
import { songTableStateRepositoryAtom } from "./features/song_table";
import { HttpClientImplFetch } from "./infrastructure/http/HttpClientImplFetch";
import { MpdClientSocket } from "./infrastructure/mpd/MpdClientImplSocketio";
import { SocketIoClientImpl } from "./infrastructure/socketio/SocketIoClientImpl";
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
    store.set(mpdClientAtom, new MpdClientSocket(socketIoClient));
    store.set(
      songTableStateRepositoryAtom,
      new SongTableStateRepositoryImplHttp(httpClient),
    );

    globalStore = store;
    return globalStore;
  };

  if (globalStore === undefined) {
    throw injectDependencies();
  }

  return globalStore;
}
