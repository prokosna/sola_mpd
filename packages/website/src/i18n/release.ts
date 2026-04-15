const REPO = "prokosna/sola_mpd";

export type ReleaseInfo = {
	version: string;
	url: string;
};

const fallback: ReleaseInfo = {
	version: "",
	url: `https://github.com/${REPO}/releases/latest`,
};

export async function fetchLatestRelease(): Promise<ReleaseInfo> {
	try {
		const headers: Record<string, string> = {
			Accept: "application/vnd.github+json",
			"User-Agent": "sola_mpd-website-build",
		};
		const token = process.env.GITHUB_TOKEN;
		if (token) headers.Authorization = `Bearer ${token}`;

		const res = await fetch(
			`https://api.github.com/repos/${REPO}/releases/latest`,
			{ headers },
		);
		if (!res.ok) return fallback;
		const data = (await res.json()) as {
			tag_name?: string;
			html_url?: string;
		};
		return {
			version: data.tag_name ?? "",
			url: data.html_url ?? fallback.url,
		};
	} catch {
		return fallback;
	}
}
