import { atom } from "jotai";

// Monotonic milliseconds (performance.now()) of the last clock tick.
export const playerClockAtom = atom<number>(0);
