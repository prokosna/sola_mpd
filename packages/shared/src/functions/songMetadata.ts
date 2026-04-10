import { create } from "@bufbuild/protobuf";
import {
	FloatValueSchema,
	Int32ValueSchema,
	StringValueSchema,
	timestampDate,
	timestampFromDate,
} from "@bufbuild/protobuf/wkt";
import dayjs from "dayjs";

import {
	type AudioFormat,
	AudioFormat_Encoding,
	type Song,
	Song_MetadataTag,
	type Song_MetadataValue,
	Song_MetadataValueSchema,
} from "../models/song_pb.js";

export function getSongMetadataAsString(
	song: Song,
	tag: Song_MetadataTag,
): string {
	const metadata = song.metadata[tag];
	return convertSongMetadataValueToString(metadata);
}

export function getSongMetadataAsNumber(
	song: Song,
	tag: Song_MetadataTag,
): number | undefined {
	const value = song.metadata[tag];
	switch (value.value.case) {
		case "floatValue":
			return value.value.value.value;
		case "stringValue":
			return Number(value.value.value.value);
		case "intValue":
			return value.value.value.value;
		case "timestamp":
			return timestampDate(value.value.value).getTime();
		case "format":
			return value.value.value.samplingRate;
	}
	return undefined;
}

export function convertStringToSongMetadataValue(
	value: string,
): Song_MetadataValue {
	if (value === "") {
		return create(Song_MetadataValueSchema, {
			value: {
				case: "stringValue",
				value: create(StringValueSchema, { value: "" }),
			},
		});
	}

	// Date
	const tryDate = dayjs(value);
	if (tryDate.isValid() && value.includes("-")) {
		return create(Song_MetadataValueSchema, {
			value: {
				case: "timestamp",
				value: timestampFromDate(tryDate.toDate()),
			},
		});
	}

	// number
	const tryNumber = Number(value);
	if (!Number.isNaN(tryNumber)) {
		if (tryNumber % 1 === 0) {
			return create(Song_MetadataValueSchema, {
				value: {
					case: "intValue",
					value: create(Int32ValueSchema, { value: tryNumber }),
				},
			});
		}
		return create(Song_MetadataValueSchema, {
			value: {
				case: "floatValue",
				value: create(FloatValueSchema, { value: tryNumber }),
			},
		});
	}

	// string
	return create(Song_MetadataValueSchema, {
		value: {
			case: "stringValue",
			value: create(StringValueSchema, { value }),
		},
	});
}

export function convertSongMetadataValueToString(
	value: Song_MetadataValue,
): string {
	switch (value.value.case) {
		case "floatValue":
			return String(value.value.value.value);
		case "intValue":
			return String(value.value.value.value);
		case "timestamp":
			return dayjs(timestampDate(value.value.value)).format("YYYY-MM-DD");
		case "stringValue":
			return value.value.value.value || "";
		case "format":
			return convertAudioFormatToString(value.value.value);
		default:
			return "";
	}
}

export function convertAudioFormatToString(format: AudioFormat): string {
	return `${AudioFormat_Encoding[format.encoding]}: ${format.channels}ch ${
		format.bits
	}bit ${format.samplingRate}Hz`;
}

export function listAllSongMetadataTags(): Song_MetadataTag[] {
	return Object.keys(Song_MetadataTag)
		.filter((v) => Number.isNaN(Number(v)))
		.map((v) => Song_MetadataTag[v as keyof typeof Song_MetadataTag])
		.filter((v) => v !== Song_MetadataTag.UNKNOWN);
}

export function compareSongsByMetadataValue(
	songA: Song,
	songB: Song,
	tag: Song_MetadataTag,
	collator: Intl.Collator,
): number {
	const valueA = songA.metadata[tag];
	const valueB = songB.metadata[tag];
	if (
		valueA.value.case === "floatValue" &&
		valueB.value.case === "floatValue"
	) {
		return compareNumbers(valueA.value.value.value, valueB.value.value.value);
	}
	if (
		valueA.value.case === "stringValue" &&
		valueB.value.case === "stringValue"
	) {
		return collator.compare(valueA.value.value.value, valueB.value.value.value);
	}
	if (valueA.value.case === "intValue" && valueB.value.case === "intValue") {
		return compareNumbers(valueA.value.value.value, valueB.value.value.value);
	}
	if (valueA.value.case === "timestamp" && valueB.value.case === "timestamp") {
		const dateA = dayjs(timestampDate(valueA.value.value)).format("YYYY-MM-DD");
		const dateB = dayjs(timestampDate(valueB.value.value)).format("YYYY-MM-DD");
		return collator.compare(dateA, dateB);
	}
	if (valueA.value.case === "format" && valueB.value.case === "format") {
		const formatA = convertAudioFormatToString(valueA.value.value);
		const formatB = convertAudioFormatToString(valueB.value.value);
		return collator.compare(formatA, formatB);
	}
	return 0;
}

function compareNumbers(numA: number, numB: number): number {
	if (numA === numB) {
		return 0;
	}
	if (numA > numB) {
		return 1;
	}
	return -1;
}
