import { atom } from "jotai";

import { outputDevicesAsyncAtom } from "../atoms/outputDevicesAtom";

export const refreshOutputDevicesActionAtom = atom(null, (_get, set) => {
	set(outputDevicesAsyncAtom);
});
