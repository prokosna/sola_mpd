// The prefix is private to react-resizable-panels, but nothing else in
// localStorage uses it, so clearing it resets every pane split — including the
// per-filter-set ids BrowserNavigationView generates — without a hardcoded list.
const RESIZABLE_PANELS_KEY_PREFIX = "react-resizable-panels:";

/**
 * `useDefaultLayout` keys a panel group as `<prefix><id>` or, with dynamic
 * `panelIds`, `<prefix><id>:<panelId>:...`; matching on `<prefix><id>` exactly
 * or as a `:`-delimited prefix keeps "search" from also matching
 * "search-navigation"'s key.
 */
function matchesPanelGroup(key: string, groupId: string): boolean {
	const base = `${RESIZABLE_PANELS_KEY_PREFIX}${groupId}`;
	return key === base || key.startsWith(`${base}:`);
}

/** With no `panelGroupIds`, every pane split resets — the default for every view but Search. */
export function resetPaneLayout(
	storage: Storage = globalThis.localStorage,
	panelGroupIds?: string[],
) {
	const keysToRemove: string[] = [];
	for (let i = 0; i < storage.length; i++) {
		const key = storage.key(i);
		if (key === null || !key.startsWith(RESIZABLE_PANELS_KEY_PREFIX)) {
			continue;
		}
		if (
			panelGroupIds === undefined ||
			panelGroupIds.some((groupId) => matchesPanelGroup(key, groupId))
		) {
			keysToRemove.push(key);
		}
	}
	for (const key of keysToRemove) {
		storage.removeItem(key);
	}
}
