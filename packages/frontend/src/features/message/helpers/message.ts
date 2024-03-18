import { AppMessageLevel } from "../types/message";

export function getAppMessageDuration(level: AppMessageLevel): number {
  switch (level) {
    case AppMessageLevel.INFO:
      return 5000;
    case AppMessageLevel.WARN:
      return 10000;
    case AppMessageLevel.ERROR:
      return -1;
  }
}
