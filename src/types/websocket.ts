export type PluginRequestMessage = {
  data: Uint8Array;
  callbackEvent: string;
};

export type PluginResponseMessage = {
  data: Uint8Array | undefined;
  error: string;
  status: "ok" | "error" | "end";
};
