import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const localeCandidates = {
	English: "en",
	Chinese: "zh",
	Spanish: "es",
	Arabic: "ar",
	Hindi: "hi",
	Portuguese: "pt",
	French: "fr",
	Russian: "ru",
	Japanese: "ja",
	German: "de",
	Korean: "ko",
	Italian: "it",
	Turkish: "tr",
	Vietnamese: "vi",
	Thai: "th",
	Indonesian: "id",
	Persian: "fa",
	Dutch: "nl",
	Swedish: "sv",
	Polish: "pl",
	Tamil: "ta",
	Urdu: "ur",
	Hebrew: "he",
};

const supportedLocalesAtom = atom((_) => {
	const supportedLocaleTags = Intl.Collator.supportedLocalesOf(
		Object.values(localeCandidates),
	);

	return Object.fromEntries(
		Object.entries(localeCandidates).filter(([, localeTag]) =>
			supportedLocaleTags.includes(localeTag),
		),
	);
});

const localeAtom = atomWithStorage("solaMpdLocale", "en", undefined, {
	getOnInit: true,
});

export const localeCollatorAtom = atom((get) => {
	const locale = get(localeAtom);
	return new Intl.Collator(locale, {
		usage: "sort",
		sensitivity: "base",
		ignorePunctuation: true,
		numeric: true,
	});
});

/**
 * Hook to access the supported locales state.
 *
 * @returns An object containing key-value pairs of supported locales,
 * where the key is the locale name and the value is the locale code.
 */
export function useSupportedLocalesState() {
	return useAtomValue(supportedLocalesAtom);
}

/**
 * Hook to access the current locale state.
 *
 * @returns The current locale code as a string.
 */
export function useLocaleState() {
	return useAtomValue(localeAtom);
}

/**
 * Hook to set the current locale state.
 *
 * @returns A function to update the locale state.
 */
export function useSetLocaleState() {
	return useSetAtom(localeAtom);
}

/**
 * Hook to access the current locale collator state.
 *
 * @returns An Intl.Collator instance configured with the current locale settings.
 * This collator can be used for locale-aware string comparisons and sorting.
 */
export function useLocaleCollatorState() {
	return useAtomValue(localeCollatorAtom);
}
