import { StateCreator } from "zustand";

import { AppMessage, AppMessageLevel } from "../types/AppMessage";

import { AllSlices } from "./AppStore";

function getAppMessageDuration(level: AppMessageLevel): number {
  switch (level) {
    case AppMessageLevel.INFO:
      return 5000;
    case AppMessageLevel.WARN:
      return 10000;
    case AppMessageLevel.ERROR:
      return -1;
  }
}

export type SystemSlice = {
  appMessage: AppMessage | undefined;
  appMessageTimeoutId: ReturnType<typeof setTimeout> | undefined;
  updateAppMessage: (appMessage: AppMessage) => Promise<void>;
};

export const createSystemSlice: StateCreator<AllSlices, [], [], SystemSlice> = (
  set,
  get
) => ({
  appMessage: undefined,
  appMessageTimeoutId: undefined,
  updateAppMessage: async (appMessage: AppMessage) => {
    if (get().appMessageTimeoutId !== undefined) {
      clearTimeout(get().appMessageTimeoutId);
    }
    let id = undefined;
    const duration = getAppMessageDuration(appMessage.level);
    if (duration > 0) {
      id = setTimeout(() => {
        set({
          appMessage: undefined,
          appMessageTimeoutId: undefined,
        });
      }, duration);
    }
    set({
      appMessage,
      appMessageTimeoutId: id,
    });
  },
});
