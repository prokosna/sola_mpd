export enum AppMessageLevel {
  INFO = 0,
  WARN = 1,
  ERROR = 2,
}

export interface AppMessage {
  level: AppMessageLevel;
  message: string;
}
