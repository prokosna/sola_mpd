import { createStore } from "jotai";

import { mpdServiceAtom } from "./features/mpd";
import { mpdProfileStateRepositoryAtom } from "./features/profile";
import { HttpClientFetch } from "./infrastructure/http/HttpClientFetch";
import { MpdClientHttp } from "./infrastructure/mpd/MpdClientHttp";
import { MpdServiceImpl } from "./infrastructure/mpd/MpdServiceImpl";
import { MpdProfileStateRepositoryHttp } from "./infrastructure/profile/MpdProfileStateRepositoryHttp";

let globalStore: ReturnType<typeof createStore> | undefined = undefined;

export function useJotaiStore() {
  const injectDependencies = async (): Promise<
    ReturnType<typeof createStore>
  > => {
    const store = createStore();

    // DI
    const httpClient = new HttpClientFetch();
    const mpdClient = new MpdClientHttp(httpClient);

    store.set(mpdServiceAtom, new MpdServiceImpl(mpdClient));
    store.set(
      mpdProfileStateRepositoryAtom,
      new MpdProfileStateRepositoryHttp(httpClient),
    );

    globalStore = store;
    return globalStore;
  };

  if (globalStore === undefined) {
    throw injectDependencies();
  }

  return globalStore;
}
