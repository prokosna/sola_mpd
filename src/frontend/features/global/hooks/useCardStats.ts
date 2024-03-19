import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";

import { useAppStore } from "../store/AppStore";

import { MpdRequest } from "@/models/mpd/mpd_command";
import { SongMetadataTag } from "@/models/song";
import { MpdUtils } from "@/utils/MpdUtils";
import { SongUtils } from "@/utils/SongUtils";
import { StringUtils } from "@/utils/StringUtils";

export function useCardStats() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const mpdPlayerStatus = useAppStore((state) => state.mpdPlayerStatus);
  const mpdStats = useAppStore((state) => state.mpdStats);
  const pullMpdStats = useAppStore((state) => state.pullMpdStats);
  const selectedSongs = useAppStore((state) => state.selectedSongs);
  const toast = useToast();

  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    pullMpdStats(profile);
  }, [profile, pullMpdStats]);

  const isSelectedVisible = selectedSongs.length >= 2;

  const songsCount = useMemo(() => {
    if (isSelectedVisible) {
      return selectedSongs.length;
    }
    return mpdStats?.songsCount;
  }, [isSelectedVisible, mpdStats?.songsCount, selectedSongs.length]);

  const albumsCount = useMemo(() => {
    if (isSelectedVisible) {
      return [
        ...new Set(
          selectedSongs.map((v) =>
            SongUtils.getSongMetadataAsString(v, SongMetadataTag.ALBUM),
          ),
        ),
      ].length;
    }
    return mpdStats?.albumsCount;
  }, [isSelectedVisible, mpdStats?.albumsCount, selectedSongs]);

  const artistsCount = useMemo(() => {
    if (isSelectedVisible) {
      return [
        ...new Set(
          selectedSongs.map((v) =>
            SongUtils.getSongMetadataAsString(v, SongMetadataTag.ARTIST),
          ),
        ),
      ].length;
    }
    return mpdStats?.artistsCount;
  }, [isSelectedVisible, mpdStats?.artistsCount, selectedSongs]);

  const totalDuration = useMemo(() => {
    if (isSelectedVisible) {
      return StringUtils.displayDuration(
        selectedSongs
          .map((v) =>
            SongUtils.getSongMetadataAsNumber(v, SongMetadataTag.DURATION),
          )
          .filter((v) => !isNaN(Number(v)))
          .reduce((a, b) => (a as number) + (b as number), 0) as number,
      );
    }
    if (mpdStats?.totalPlaytime === undefined) {
      return undefined;
    }
    return StringUtils.displayDuration(mpdStats.totalPlaytime);
  }, [isSelectedVisible, mpdStats?.totalPlaytime, selectedSongs]);

  const onDatabaseUpdateClicked = useCallback(async () => {
    if (profile === undefined) {
      return;
    }
    const command = MpdRequest.create({
      profile,
      command: {
        $case: "update",
        update: {},
      },
    });
    await MpdUtils.command(command);
    toast({
      title: "Update MPD DB",
      description: "DB is now updating...",
    });
  }, [profile, toast]);

  return {
    songsCount,
    artistsCount,
    albumsCount,
    totalDuration,
    isSelectedVisible,
    isDatabaseUpdating: mpdPlayerStatus?.isDatabaseUpdating,
    onDatabaseUpdateClicked,
  };
}
