import type { AppRuntime } from "../../../lib/ipc/detectAppRuntime";

type MpdConnectionFailure =
	| "refused"
	| "hostNotFound"
	| "timeout"
	| "password"
	| "permission"
	| "notMpd";

const DOCKER_HOST_ALIAS = "host.docker.internal";

const FAILURE_PATTERNS: ReadonlyArray<[MpdConnectionFailure, RegExp]> = [
	["password", /Failed to authenticate with password|ACK \[3@/],
	["permission", /ACK \[4@/],
	["refused", /ECONNREFUSED/],
	["hostNotFound", /ENOTFOUND|EAI_AGAIN/],
	["timeout", /Connection timed out after|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH/],
	[
		"notMpd",
		/Unexpected response from server|Connection closed before MPD welcome message/,
	],
];

export function classifyMpdConnectionError(
	errorMessage: string,
): MpdConnectionFailure | undefined {
	return FAILURE_PATTERNS.find(([, pattern]) =>
		pattern.test(errorMessage),
	)?.[0];
}

export function isLoopbackHost(host: string): boolean {
	const normalized = host.trim().toLowerCase();
	return (
		normalized === "localhost" ||
		normalized === "::1" ||
		normalized === "[::1]" ||
		normalized.startsWith("127.")
	);
}

function buildRefusedHint(host: string, runtime: AppRuntime): string {
	const prefix = "Nothing is accepting connections at this host and port.";
	if (!isLoopbackHost(host)) {
		return `${prefix} Check that MPD is running on that host, that the port is correct, and that "bind_to_address" in mpd.conf is not limited to localhost.`;
	}
	if (runtime === "desktop") {
		return `${prefix} Check that MPD is running on this computer and that the port matches "port" in mpd.conf.`;
	}
	return `${prefix} Sola MPD connects from its server, not from your browser. If it runs in Docker with bridge networking, "localhost" is the container itself: use "${DOCKER_HOST_ALIAS}" instead, and make sure "bind_to_address" in mpd.conf accepts connections from the container. Otherwise, check that MPD is running and listening on this port.`;
}

function buildHostNotFoundHint(host: string, runtime: AppRuntime): string {
	if (host.trim().toLowerCase() !== DOCKER_HOST_ALIAS) {
		return "The host name could not be resolved. Check its spelling, or use the IP address of the MPD server.";
	}
	if (runtime === "desktop") {
		return `"${DOCKER_HOST_ALIAS}" only exists inside Docker containers. Use "localhost" for MPD running on this computer.`;
	}
	return `"${DOCKER_HOST_ALIAS}" only resolves inside Docker; with bridge networking on Linux it also needs the "extra_hosts" entry from docker-compose.yaml. If Sola MPD uses host networking or runs outside Docker, use "localhost" instead.`;
}

export function buildMpdConnectionHint(
	errorMessage: string,
	host: string,
	runtime: AppRuntime,
): string | undefined {
	switch (classifyMpdConnectionError(errorMessage)) {
		case "refused":
			return buildRefusedHint(host, runtime);
		case "hostNotFound":
			return buildHostNotFoundHint(host, runtime);
		case "timeout":
			return "The MPD server did not respond. Check the host and port, and that no firewall blocks the port between Sola MPD and MPD.";
		case "password":
			return 'MPD rejected the password. Check it against "password" in mpd.conf.';
		case "permission":
			return 'MPD denied the command. Enter a password that grants the required permissions ("password" in mpd.conf).';
		case "notMpd":
			return "Something answered on this port, but it does not look like MPD. Check the port (MPD's default is 6600).";
		case undefined:
			return undefined;
	}
}
