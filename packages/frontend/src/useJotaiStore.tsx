import { createStore } from "jotai";

import { mpdClientAtom } from "./features/mpd";
import { MpdClientSocket } from "./infrastructure/mpd/MpdClientImplSocketio";
import { SocketIoClientImpl } from "./infrastructure/socketio/SocketIoClientImpl";

let globalStore: ReturnType<typeof createStore> | undefined = undefined;

export function useJotaiStore() {
  const injectDependencies = async (): Promise<
    ReturnType<typeof createStore>
  > => {
    const store = createStore();

    // DI
    const socketIoClient = new SocketIoClientImpl();

    store.set(mpdClientAtom, new MpdClientSocket(socketIoClient));

    globalStore = store;
    return globalStore;
  };

  if (globalStore === undefined) {
    throw injectDependencies();
  }

  return globalStore;
}
