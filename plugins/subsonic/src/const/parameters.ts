// Single source of truth for parameter keys exchanged between the
// PluginRegisterResponse (advertised by register()) and the
// PluginExecuteRequest (consumed by execute()). The host application looks up
// these keys verbatim from `requiredPluginParameters` / `requiredRequestParameters`
// when building its config form, so register and execute must use the same
// strings — defining them here prevents drift.

export const SUBSONIC_PLUGIN_PARAMETER_KEYS = {
	url: "Url",
	user: "User",
	password: "Password",
} as const;

export const SUBSONIC_REQUEST_PARAMETER_KEYS = {
	playlistName: "Playlist Name",
} as const;

export const SUBSONIC_REQUIRED_PLUGIN_PARAMETERS: readonly string[] = [
	SUBSONIC_PLUGIN_PARAMETER_KEYS.url,
	SUBSONIC_PLUGIN_PARAMETER_KEYS.user,
	SUBSONIC_PLUGIN_PARAMETER_KEYS.password,
];

export const SUBSONIC_REQUIRED_REQUEST_PARAMETERS: readonly string[] = [
	SUBSONIC_REQUEST_PARAMETER_KEYS.playlistName,
];
