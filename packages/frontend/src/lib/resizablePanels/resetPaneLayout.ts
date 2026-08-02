// react-resizable-panels' `useDefaultLayout({ storage })` persists every
// pane group under a key of the form `react-resizable-panels:<id>` (and, for
// groups that pass panelIds, `react-resizable-panels:<id>:<panelId>:...`
// per-panel-set variants — see BrowserNavigationView, whose id list changes
// with the active filter tags). That prefix is private to the library, but
// it's the only thing under this prefix in localStorage, so clearing
// everything that starts with it resets every pane split in the app — static
// ids and dynamic per-filter-set ids alike — without hardcoding the id list.
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
