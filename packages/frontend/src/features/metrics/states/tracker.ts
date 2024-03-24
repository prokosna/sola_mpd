import { atom, useAtomValue, useSetAtom } from "jotai";

import { atomWithRefresh } from "../../../lib/jotai/atomWithRefresh";
import { MetricsTracker } from "../utils/MetricsTracker";

const metricsTrackerAtom = atom((_get) => {
  return new MetricsTracker();
});

const metricsAtom = atomWithRefresh((get) => {
  const tracker = get(metricsTrackerAtom);
  const metrics = tracker.getMetrics();
  return metrics;
});

export { metricsTrackerAtom };

export function useMetrics() {
  return useAtomValue(metricsAtom);
}

export function useRefreshMetrics() {
  return useSetAtom(metricsAtom);
}
