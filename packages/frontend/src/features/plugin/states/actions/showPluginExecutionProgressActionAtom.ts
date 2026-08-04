import { atom } from "jotai";

import { pluginExecutionModalOpenAtom } from "../atoms/pluginExecutionAtom";

/**
 * Shows the progress step — either because the run has just been started from
 * the parameter step, or because the user reopened a run still in flight from
 * the indicator.
 */
export const showPluginExecutionProgressActionAtom = atom(null, (_get, set) => {
	set(pluginExecutionModalOpenAtom, "progress");
});
