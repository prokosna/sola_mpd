import { createStore } from "jotai";

let globalStore: ReturnType<typeof createStore> | undefined = undefined;

export function useJotaiStore() {
  const injectDependencies = async (): Promise<
    ReturnType<typeof createStore>
  > => {
    const store = createStore();

    // DI
    // const httpClient = new HttpClientFetch();
    // const mpdClient = new MpdClientHttp(httpClient);
    // const socketIoClient = new SocketIoClientImpl();

    // store.set(mpdServiceAtom, new MpdServiceImpl(mpdClient, socketIoClient));
    // store.set(
    //   mpdProfileStateRepositoryAtom,
    //   new MpdProfileStateRepositoryHttp(httpClient),
    // );

    globalStore = store;
    return globalStore;
  };

  if (globalStore === undefined) {
    throw injectDependencies();
  }

  return globalStore;
}
