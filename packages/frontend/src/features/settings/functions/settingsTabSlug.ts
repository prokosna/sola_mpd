// The URL is the source of truth for which Settings tab is active
// (Settings.tsx syncs it via useParams/navigate). This mapping is kept as
// pure functions, separate from the component, so the slug<->value
// round-trip and the unknown-slug fallback are unit-testable without
// rendering the tab contents (each of which pulls in real app state).
export const SETTINGS_TAB_SLUG_TO_VALUE: Record<string, string> = {
	profiles: "Profiles",
	library: "Library",
	"this-device": "This device",
	"raw-data": "Raw Data",
};

export const SETTINGS_TAB_VALUE_TO_SLUG: Record<string, string> =
	Object.fromEntries(
		Object.entries(SETTINGS_TAB_SLUG_TO_VALUE).map(([slug, value]) => [
			value,
			slug,
		]),
	);

export const SETTINGS_DEFAULT_TAB_VALUE = "Profiles";

/**
 * Resolves a URL slug to the Tabs `value` it maps to. Retired slugs (e.g.
 * the old "locale"/"advanced-search" tabs) and any other unrecognized slug
 * fall back to the default tab rather than leaving no tab selected.
 */
export function resolveSettingsTabValue(slug: string | undefined): string {
	if (slug === undefined) {
		return SETTINGS_DEFAULT_TAB_VALUE;
	}
	return SETTINGS_TAB_SLUG_TO_VALUE[slug] ?? SETTINGS_DEFAULT_TAB_VALUE;
}

/** Resolves a Tabs `value` back to the URL slug it should be shown as. */
export function resolveSettingsTabSlug(value: string): string {
	return SETTINGS_TAB_VALUE_TO_SLUG[value] ?? value;
}
