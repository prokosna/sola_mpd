import { describe, expect, it } from "vitest";

import {
	buildMpdConnectionHint,
	classifyMpdConnectionError,
	isLoopbackHost,
} from "./mpdConnectionHint";

describe("classifyMpdConnectionError", () => {
	it.each([
		["Error: connect ECONNREFUSED 127.0.0.1:6600", "refused"],
		["Error: connect ECONNREFUSED ::1:6600", "refused"],
		["Error: getaddrinfo ENOTFOUND mpd.local", "hostNotFound"],
		["Error: getaddrinfo EAI_AGAIN host.docker.internal", "hostNotFound"],
		["Error: Connection timed out after 2000ms", "timeout"],
		["Error: connect ETIMEDOUT 192.168.1.10:6600", "timeout"],
		["Error: connect EHOSTUNREACH 192.168.1.10:6600", "timeout"],
		["Error: connect ENETUNREACH 10.0.0.1:6600", "timeout"],
		[
			"Error: Failed to authenticate with password: ACK [3@0] {password} incorrect password\n",
			"password",
		],
		[
			'MPDError: you don\'t have permission for "ping"; ACK [4@0]',
			"permission",
		],
		[
			"Error: Unexpected response from server: HTTP/1.1 400 Bad Request",
			"notMpd",
		],
		["Error: Connection closed before MPD welcome message.", "notMpd"],
	] as const)("classifies %s as %s", (message, expected) => {
		expect(classifyMpdConnectionError(message)).toBe(expected);
	});

	it("returns undefined for unrecognized errors", () => {
		expect(classifyMpdConnectionError("Error: something else")).toBeUndefined();
	});
});

describe("isLoopbackHost", () => {
	it.each([
		"localhost",
		" LocalHost ",
		"127.0.0.1",
		"127.0.1.1",
		"::1",
		"[::1]",
	])("treats %s as loopback", (host) => {
		expect(isLoopbackHost(host)).toBe(true);
	});

	it.each([
		"192.168.1.10",
		"host.docker.internal",
		"mpd.local",
	])("treats %s as non-loopback", (host) => {
		expect(isLoopbackHost(host)).toBe(false);
	});
});

describe("buildMpdConnectionHint", () => {
	const refused = "Error: connect ECONNREFUSED 127.0.0.1:6600";
	const notFound = "Error: getaddrinfo ENOTFOUND host.docker.internal";

	it("suggests host.docker.internal for a refused loopback host on web", () => {
		const hint = buildMpdConnectionHint(refused, "localhost", "web");
		expect(hint).toContain("host.docker.internal");
		expect(hint).toContain("bind_to_address");
	});

	it("omits the Docker advice for a refused loopback host on desktop", () => {
		const hint = buildMpdConnectionHint(refused, "localhost", "desktop");
		expect(hint).not.toContain("Docker");
		expect(hint).toContain("mpd.conf");
	});

	it("mentions bind_to_address for a refused remote host", () => {
		const hint = buildMpdConnectionHint(
			"Error: connect ECONNREFUSED 192.168.1.10:6600",
			"192.168.1.10",
			"web",
		);
		expect(hint).toContain("bind_to_address");
		expect(hint).not.toContain("host.docker.internal");
	});

	it("explains host.docker.internal resolution on web", () => {
		const hint = buildMpdConnectionHint(
			notFound,
			"host.docker.internal",
			"web",
		);
		expect(hint).toContain("extra_hosts");
	});

	it("points desktop users at localhost instead of host.docker.internal", () => {
		const hint = buildMpdConnectionHint(
			notFound,
			"host.docker.internal",
			"desktop",
		);
		expect(hint).toContain('"localhost"');
		expect(hint).not.toContain("extra_hosts");
	});

	it("asks to check spelling for other unresolved hosts", () => {
		const hint = buildMpdConnectionHint(
			"Error: getaddrinfo ENOTFOUND mpd.lcoal",
			"mpd.lcoal",
			"web",
		);
		expect(hint).toContain("spelling");
	});

	it("mentions firewall for timeouts", () => {
		expect(
			buildMpdConnectionHint(
				"Error: Connection timed out after 2000ms",
				"192.168.1.10",
				"web",
			),
		).toContain("firewall");
	});

	it("mentions the password for authentication failures", () => {
		expect(
			buildMpdConnectionHint(
				"Error: Failed to authenticate with password: ACK [3@0] {password} incorrect password",
				"localhost",
				"web",
			),
		).toContain("password");
	});

	it("mentions the default port when the server is not MPD", () => {
		expect(
			buildMpdConnectionHint(
				"Error: Unexpected response from server: SSH-2.0-OpenSSH",
				"localhost",
				"web",
			),
		).toContain("6600");
	});

	it("returns undefined for unrecognized errors", () => {
		expect(
			buildMpdConnectionHint("Error: boom", "localhost", "web"),
		).toBeUndefined();
	});
});
