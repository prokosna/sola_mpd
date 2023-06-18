import { StateCreator } from "zustand";

import { AllSlices } from "../../global/store/AppStore";

import { Folder } from "@/models/file_explore";
import { MpdRequest } from "@/models/mpd/mpd_command";
import { MpdProfile } from "@/models/mpd/mpd_profile";
import { Song } from "@/models/song";
import { MpdUtils } from "@/utils/MpdUtils";

export type FileExploreSlice = {
  fileExploreSongs: Song[];
  fileExploreFolders: Folder[] | undefined;
  selectedFileExploreFolder: Folder | undefined;
  pullFileExploreSongs: (profile: MpdProfile, folder: Folder) => Promise<void>;
  pullFileExploreFolders: (profile: MpdProfile) => Promise<void>;
  updateSelectedFileExploreFolder: (folder: Folder) => Promise<void>;
};

export const createFileExploreSlice: StateCreator<
  AllSlices,
  [],
  [],
  FileExploreSlice
> = (set, get) => ({
  fileExploreSongs: [],
  fileExploreFolders: undefined,
  selectedFileExploreFolder: undefined,
  pullFileExploreSongs: async (profile: MpdProfile, folder: Folder) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "listSongsInFolder", listSongsInFolder: { folder } },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "listSongsInFolder") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const songs = res.command.listSongsInFolder.songs;

    set({
      fileExploreSongs: songs.sort((a, b) => (a.path > b.path ? 1 : -1)),
    });
  },
  pullFileExploreFolders: async (profile: MpdProfile) => {
    const req = MpdRequest.create({
      profile,
      command: { $case: "listAllFolders", listAllFolders: {} },
    });
    const res = await MpdUtils.command(req);
    if (res.command?.$case !== "listAllFolders") {
      throw Error(`Invalid MPD response: ${res}`);
    }
    const folders = res.command.listAllFolders.folders;

    set({
      fileExploreFolders: folders,
    });
  },
  updateSelectedFileExploreFolder: async (folder: Folder) => {
    set({
      selectedFileExploreFolder: folder,
    });
  },
});
