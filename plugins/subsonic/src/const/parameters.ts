// register() advertises these keys and execute() consumes them, and the host
// looks them up verbatim when building its config form, so both sides have to
// use the same strings.

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
