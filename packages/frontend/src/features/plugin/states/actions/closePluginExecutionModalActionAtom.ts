import { atom } from "jotai";

import { pluginExecutionModalOpenAtom } from "../atoms/pluginExecutionAtom";

/**
 * Dismisses the modal. Closing does not cancel a run in flight; the indicator
 * stays available to reopen the progress step.
 */
export const closePluginExecutionModalActionAtom = atom(null, (_get, set) => {
	set(pluginExecutionModalOpenAtom, "closed");
});
