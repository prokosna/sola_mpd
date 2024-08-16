import { atom } from "jotai";

const EVENT_THRESHOLD = 1000;

export const mpdDatabaseEventLastPublishedAtom = atom(0);
export const publishMpdDatabaseEventAtom = atom(null, (get, set) => {
  const lastUpdated = get(mpdDatabaseEventLastPublishedAtom);
  const now = performance.now();
  if (now - lastUpdated > EVENT_THRESHOLD) {
    set(mpdDatabaseEventLastPublishedAtom, now);
  }
});

export const mpdUpdateEventLastPublishedAtom = atom(0);
export const publishMpdUpdateEventAtom = atom(null, (get, set) => {
  const lastUpdated = get(mpdUpdateEventLastPublishedAtom);
  const now = performance.now();
  if (now - lastUpdated > EVENT_THRESHOLD) {
    set(mpdUpdateEventLastPublishedAtom, now);
  }
});

export const mpdPlaylistEventLastPublishedAtom = atom(0);
export const publishMpdPlaylistEventAtom = atom(null, (get, set) => {
  const lastUpdated = get(mpdPlaylistEventLastPublishedAtom);
  const now = performance.now();
  if (now - lastUpdated > EVENT_THRESHOLD) {
    set(mpdPlaylistEventLastPublishedAtom, now);
  }
});

export const mpdPlayQueueEventLastPublishedAtom = atom(0);
export const publishMpdPlayQueueEventAtom = atom(null, (get, set) => {
  const lastUpdated = get(mpdPlayQueueEventLastPublishedAtom);
  const now = performance.now();
  if (now - lastUpdated > EVENT_THRESHOLD) {
    set(mpdPlayQueueEventLastPublishedAtom, now);
  }
});

export const mpdMixerEventLastPublishedAtom = atom(0);
export const publishMpdMixerEventAtom = atom(null, (get, set) => {
  const lastUpdated = get(mpdMixerEventLastPublishedAtom);
  const now = performance.now();
  if (now - lastUpdated > EVENT_THRESHOLD) {
    set(mpdMixerEventLastPublishedAtom, now);
  }
});

export const mpdOptionsEventLastPublishedAtom = atom(0);
export const publishMpdOptionsEventAtom = atom(null, (get, set) => {
  const lastUpdated = get(mpdOptionsEventLastPublishedAtom);
  const now = performance.now();
  if (now - lastUpdated > EVENT_THRESHOLD) {
    set(mpdOptionsEventLastPublishedAtom, now);
  }
});

export const mpdPlayerEventLastPublishedAtom = atom(0);
export const publishMpdPlayerEventAtom = atom(null, (get, set) => {
  const lastUpdated = get(mpdPlayerEventLastPublishedAtom);
  const now = performance.now();
  if (now - lastUpdated > EVENT_THRESHOLD) {
    set(mpdPlayerEventLastPublishedAtom, now);
  }
});

export const mpdDisconnectedEventLastPublishedAtom = atom(0);
export const publishMpdDisconnectedEventAtom = atom(null, (get, set) => {
  const lastUpdated = get(mpdDisconnectedEventLastPublishedAtom);
  const now = performance.now();
  if (now - lastUpdated > EVENT_THRESHOLD) {
    set(mpdDisconnectedEventLastPublishedAtom, now);
  }
});
