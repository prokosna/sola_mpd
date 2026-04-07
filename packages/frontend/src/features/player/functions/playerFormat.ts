import { convertAudioFormatToString } from "@sola_mpd/shared/src/functions/songMetadata.js";
import {
	type AudioFormat,
	AudioFormat_Encoding,
} from "@sola_mpd/shared/src/models/song_pb.js";

export type AudioFormatClassification = {
	isHiRes: boolean;
	isDsd: boolean;
	formatString: string;
};

export function classifyAudioFormat(
	format: AudioFormat | undefined,
): AudioFormatClassification {
	if (format === undefined) {
		return { isHiRes: false, isDsd: false, formatString: "" };
	}

	const formatString = convertAudioFormatToString(format);
	switch (format.encoding) {
		case AudioFormat_Encoding.DSD:
			return { isHiRes: true, isDsd: true, formatString };
		case AudioFormat_Encoding.PCM:
			if (format.bits > 16 || format.samplingRate > 44100) {
				return { isHiRes: true, isDsd: false, formatString };
			}
			return { isHiRes: false, isDsd: false, formatString };
		default:
			return { isHiRes: false, isDsd: false, formatString };
	}
}
