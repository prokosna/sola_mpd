import { useCallback, useEffect, useMemo, useRef } from "react";

import { useAppStore } from "../../global/store/AppStore";

import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdPlayerStatusPlaybackState } from "@/models/mpd/mpd_player";
import { AudioFormatEncoding, SongMetadataTag } from "@/models/song";
import { MpdUtils } from "@/utils/MpdUtils";
import { SongUtils } from "@/utils/SongUtils";
import { StringUtils } from "@/utils/StringUtils";

export function usePlayer() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const currentSong = useAppStore((state) => state.currentSong);
  const mpdPlayerStatus = useAppStore((state) => state.mpdPlayerStatus);
  const mpdPlayerVolume = useAppStore((state) => state.mpdPlayerVolume);
  const pullCurrentSong = useAppStore((state) => state.pullCurrentSong);
  const pullPlayerStatus = useAppStore((state) => state.pullMpdPlayerStatus);
  const pullMpdPlayerVolume = useAppStore((state) => state.pullMpdPlayerVolume);

  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    const timer = setInterval(() => {
      pullPlayerStatus(profile);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [profile, pullPlayerStatus]);

  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    pullCurrentSong(profile);
    pullPlayerStatus(profile);
    pullMpdPlayerVolume(profile);
  }, [profile, pullCurrentSong, pullMpdPlayerVolume, pullPlayerStatus]);

  const songFirstLine = useMemo(() => {
    if (currentSong === undefined) {
      return "Not playing";
    }
    return SongUtils.getSongMetadataAsString(
      currentSong,
      SongMetadataTag.TITLE,
    );
  }, [currentSong]);

  const songSecondLine = useMemo(() => {
    if (currentSong === undefined) {
      return "";
    }
    return SongUtils.getSongMetadataAsString(
      currentSong,
      SongMetadataTag.ALBUM,
    );
  }, [currentSong]);

  const songThirdLine = useMemo(() => {
    if (currentSong === undefined) {
      return "";
    }
    const artist = SongUtils.getSongMetadataAsString(
      currentSong,
      SongMetadataTag.ARTIST,
    );
    const albumArtist = SongUtils.getSongMetadataAsString(
      currentSong,
      SongMetadataTag.ALBUM_ARTIST,
    );
    const composer = SongUtils.getSongMetadataAsString(
      currentSong,
      SongMetadataTag.COMPOSER,
    );
    const date = SongUtils.getSongMetadataAsString(
      currentSong,
      SongMetadataTag.DATE,
    );
    let text = "";
    text += artist !== "" ? artist : albumArtist;
    text += composer !== "" ? ` / ${composer}` : "";
    text += date !== "" ? ` (${date})` : "";
    return text;
  }, [currentSong]);

  function getDurationPercentage(): number {
    if (
      mpdPlayerStatus?.duration === undefined ||
      mpdPlayerStatus?.elapsed === undefined ||
      mpdPlayerStatus?.duration === 0
    ) {
      return -1;
    }
    return (mpdPlayerStatus.elapsed / mpdPlayerStatus.duration) * 100;
  }

  function getDurationString(): string {
    if (
      mpdPlayerStatus?.duration === undefined ||
      mpdPlayerStatus?.elapsed === undefined ||
      mpdPlayerStatus?.duration === 0
    ) {
      return "";
    }
    return `${StringUtils.displayDuration(
      mpdPlayerStatus.elapsed,
    )} / ${StringUtils.displayDuration(mpdPlayerStatus.duration)}`;
  }

  function getVolume(): number {
    if (mpdPlayerVolume === undefined || mpdPlayerVolume.volume === undefined) {
      return -1;
    }
    return mpdPlayerVolume.volume;
  }

  const { isHiRes, isDsd, formatString } = useMemo(() => {
    if (currentSong === undefined) {
      return { isHires: false, isDsd: false, formatString: "" };
    }
    const format = currentSong.metadata[SongMetadataTag.FORMAT];
    if (format.value?.$case === "format") {
      const f = format.value.format;
      const formatString = SongUtils.convertAudioFormatToString(f);
      switch (f.encoding) {
        case AudioFormatEncoding.DSD:
          return { isHiRes: true, isDsd: true, formatString };
        case AudioFormatEncoding.PCM:
          if (f.bits > 16 || f.samplingRate > 44100) {
            return { isHiRes: true, isDsd: false, formatString };
          }
          return { isHiRes: false, isDsd: false, formatString };
        default:
          return { isHiRes: false, isDsd: false, formatString };
      }
    }
    return { isHiRes: false, isDsd: false, formatString: "" };
  }, [currentSong]);

  const onPreviousClicked = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    const command = MpdRequest.create({
      profile,
      command: {
        $case: "previous",
        previous: {},
      },
    });
    await MpdUtils.command(command);
  }, [profile]);

  const onStopClicked = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    const command = MpdRequest.create({
      profile,
      command: {
        $case: "stop",
        stop: {},
      },
    });
    await MpdUtils.command(command);
  }, [profile]);

  const onResumeClicked = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    let command;
    switch (mpdPlayerStatus?.playbackState) {
      case MpdPlayerStatusPlaybackState.STOP:
        command = MpdRequest.create({
          profile,
          command: {
            $case: "pause",
            pause: { pause: false },
          },
        });
        break;
      case MpdPlayerStatusPlaybackState.PAUSE:
        command = MpdRequest.create({
          profile,
          command: {
            $case: "pause",
            pause: { pause: false },
          },
        });
        break;
      case MpdPlayerStatusPlaybackState.PLAY:
        command = MpdRequest.create({
          profile,
          command: {
            $case: "pause",
            pause: { pause: true },
          },
        });
        break;
      default:
        return;
    }
    await MpdUtils.command(command);
  }, [mpdPlayerStatus?.playbackState, profile]);

  const onNextClicked = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    const command = MpdRequest.create({
      profile,
      command: {
        $case: "next",
        next: {},
      },
    });
    await MpdUtils.command(command);
  }, [profile]);

  const onRandomToggled = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    const command = MpdRequest.create({
      profile,
      command: {
        $case: "random",
        random: { enable: !mpdPlayerStatus?.isRandom },
      },
    });
    await MpdUtils.command(command);
  }, [mpdPlayerStatus?.isRandom, profile]);

  const onRepeatToggled = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    const command = MpdRequest.create({
      profile,
      command: {
        $case: "repeat",
        repeat: { enable: !mpdPlayerStatus?.isRepeat },
      },
    });
    await MpdUtils.command(command);
  }, [mpdPlayerStatus?.isRepeat, profile]);

  const onConsumeToggled = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    const command = MpdRequest.create({
      profile,
      command: {
        $case: "consume",
        consume: { enable: !mpdPlayerStatus?.isConsume },
      },
    });
    await MpdUtils.command(command);
  }, [mpdPlayerStatus?.isConsume, profile]);

  const onVolumeClicked = useCallback(
    async (value: number) => {
      if (value < 0 || value > 100) {
        return;
      }
      if (profile === undefined) {
        return;
      }
      const command = MpdRequest.create({
        profile,
        command: {
          $case: "setvol",
          setvol: { vol: value },
        },
      });
      await MpdUtils.command(command);
    },
    [profile],
  );

  const lastSeekClicked = useRef(new Date());
  const onSeekClicked = useCallback(
    async (value: number) => {
      if (value < 0 || value > 100) {
        return;
      }
      if (profile === undefined) {
        return;
      }
      if (mpdPlayerStatus === undefined) {
        return;
      }
      if (mpdPlayerStatus.duration === undefined) {
        return;
      }

      const now = new Date();
      const last = lastSeekClicked.current;
      const elapsed = now.getTime() - last.getTime();
      if (elapsed < 1000) {
        return;
      }
      lastSeekClicked.current = now;

      const seekTo = (value / 100) * mpdPlayerStatus.duration;
      const command = MpdRequest.create({
        profile,
        command: {
          $case: "seek",
          seek: { target: { $case: "current", current: true }, time: seekTo },
        },
      });
      await MpdUtils.command(command);
    },
    [profile, mpdPlayerStatus],
  );

  return {
    currentSong,
    songFirstLine,
    songSecondLine,
    songThirdLine,
    playbackState:
      mpdPlayerStatus?.playbackState || MpdPlayerStatusPlaybackState.UNKNOWN,
    durationPercentage: getDurationPercentage(),
    durationString: getDurationString(),
    volume: getVolume(),
    isHiRes,
    isDsd,
    formatString,
    isRepeat: mpdPlayerStatus?.isRepeat,
    isRandom: mpdPlayerStatus?.isRandom,
    isConsume: mpdPlayerStatus?.isConsume,
    onPreviousClicked,
    onStopClicked,
    onResumeClicked,
    onNextClicked,
    onRandomToggled,
    onRepeatToggled,
    onConsumeToggled,
    onVolumeClicked,
    onSeekClicked,
  };
}
