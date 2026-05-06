import { compare, validate } from "compare-versions";

const MIN_VERSION_MPD_024 = "0.24";

// MPD git builds may append suffixes like "~git" that compare-versions does not
// accept; strip them before delegating.
function normalize(raw: string | undefined): string | undefined {
	if (raw === undefined) {
		return undefined;
	}
	const trimmed = raw.trim();
	if (trimmed.length === 0) {
		return undefined;
	}
	const core = trimmed.split(/[~\s]/, 1)[0];
	return core.length > 0 && validate(core) ? core : undefined;
}

export function isMpdVersionAtLeast(
	rawVersion: string | undefined,
	minimum: string,
): boolean {
	const v = normalize(rawVersion);
	if (v === undefined) {
		return false;
	}
	return compare(v, minimum, ">=");
}

export function isMpd024OrLater(rawVersion: string | undefined): boolean {
	return isMpdVersionAtLeast(rawVersion, MIN_VERSION_MPD_024);
}
