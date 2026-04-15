import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://prokosna.github.io",
	base: "/sola_mpd",
	trailingSlash: "ignore",
	i18n: {
		defaultLocale: "en",
		locales: ["en", "ja"],
		routing: {
			prefixDefaultLocale: false,
		},
	},
});
