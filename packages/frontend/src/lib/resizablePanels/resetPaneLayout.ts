// The prefix is private to react-resizable-panels, but nothing else in
// localStorage uses it, so clearing it resets every pane split — including the
// per-filter-set ids BrowserNavigationView generates — without a hardcoded list.
const RESIZABLE_PANELS_KEY_PREFIX = "react-resizable-panels:";

export function resetPaneLayout(storage: Storage = globalThis.localStorage) {
	const keysToRemove: string[] = [];
	for (let i = 0; i < storage.length; i++) {
		const key = storage.key(i);
		if (key?.startsWith(RESIZABLE_PANELS_KEY_PREFIX)) {
			keysToRemove.push(key);
		}
	}
	for (const key of keysToRemove) {
		storage.removeItem(key);
	}
}
