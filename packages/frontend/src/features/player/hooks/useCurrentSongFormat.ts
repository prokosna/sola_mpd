import {
  AudioFormat_Encoding,
  Song_MetadataTag,
} from "@sola_mpd/domain/src/models/song_pb.js";
import { SongUtils } from "@sola_mpd/domain/src/utils/SongUtils.js";
import { useMemo } from "react";

import { useCurrentSongState } from "../states/song";

export function useCurrentSongFormat() {
  const song = useCurrentSongState();

  const { isHiRes, isDsd, formatString } = useMemo(() => {
    if (song === undefined) {
      return { isHires: false, isDsd: false, formatString: "" };
    }

    const format = song.metadata[Song_MetadataTag.FORMAT];
    if (format.value.case === "format") {
      const f = format.value.value;
      const formatString = SongUtils.convertAudioFormatToString(f);
      switch (f.encoding) {
        case AudioFormat_Encoding.DSD:
          return { isHiRes: true, isDsd: true, formatString };
        case AudioFormat_Encoding.PCM:
          if (f.bits > 16 || f.samplingRate > 44100) {
            return { isHiRes: true, isDsd: false, formatString };
          }
          return { isHiRes: false, isDsd: false, formatString };
        default:
          return { isHiRes: false, isDsd: false, formatString };
      }
    }
    return { isHiRes: false, isDsd: false, formatString: "" };
  }, [song]);

  return {
    isHiRes,
    isDsd,
    formatString,
  };
}
