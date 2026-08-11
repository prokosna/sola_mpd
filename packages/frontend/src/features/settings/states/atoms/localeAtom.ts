import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
	buildDeviceSettingKey,
	DEVICE_SETTING_KEY_LOCALE,
} from "../../../common";

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

export const supportedLocalesAtom = atom((_) => {
	const supportedLocaleTags = Intl.Collator.supportedLocalesOf(
		Object.values(localeCandidates),
	);

	return Object.fromEntries(
		Object.entries(localeCandidates).filter(([, localeTag]) =>
			supportedLocaleTags.includes(localeTag),
		),
	);
});

export const localeAtom = atomWithStorage(
	buildDeviceSettingKey(DEVICE_SETTING_KEY_LOCALE),
	"en",
	undefined,
	{ getOnInit: true },
);

export const localeCollatorAtom = atom((get) => {
	const locale = get(localeAtom);
	return new Intl.Collator(locale, {
		usage: "sort",
		sensitivity: "base",
		ignorePunctuation: true,
		numeric: true,
	});
});
