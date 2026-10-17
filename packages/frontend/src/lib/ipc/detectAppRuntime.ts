export type AppRuntime = "web" | "desktop";

export function detectAppRuntime(): AppRuntime {
	return window.__SOLA_IPC_BRIDGE__ != null ? "desktop" : "web";
}
