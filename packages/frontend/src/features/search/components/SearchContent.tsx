import { Box } from "@chakra-ui/react";
import { Song } from "@sola_mpd/domain/src/models/song_pb.js";
import { SongTableColumn } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { useCallback, useRef, useState } from "react";

import { CenterSpinner } from "../../loading";
import {
  PlaylistSelectModal,
  usePlaylistSelectModalProps,
} from "../../playlist";
import {
  ColumnEditModal,
  SongTable,
  useColumnEditModalProps,
} from "../../song_table";
import { changeEditingSearchColumns } from "../helpers/search";
import { useSearchSongTableProps } from "../hooks/useSearchSongTableProps";
import {
  useEditingSearchState,
  useSetEditingSearchState,
} from "../states/edit";
import { EditingSearchStatus } from "../types/search";

export function SearchContent() {
  const songsToAddToPlaylistRef = useRef<Song[]>([]);
  const [isOpenPlaylistSelectModal, setIsOpenPlaylistSelectModal] =
    useState(false);
  const [isOpenColumnEditModal, setIsOpenColumnEditModal] = useState(false);
  const editingSearch = useEditingSearchState();
  const setEditingSearch = useSetEditingSearchState();

  const songTableProps = useSearchSongTableProps(
    songsToAddToPlaylistRef,
    setIsOpenPlaylistSelectModal,
    setIsOpenColumnEditModal,
  );

  const playlistSelectModalProps = usePlaylistSelectModalProps(
    isOpenPlaylistSelectModal,
    songsToAddToPlaylistRef,
    setIsOpenPlaylistSelectModal,
  );

  const onClickColumnEditModalOk = useCallback(
    (columns: SongTableColumn[]) => {
      const newSearch = changeEditingSearchColumns(editingSearch, columns);
      setEditingSearch(newSearch, EditingSearchStatus.COLUMNS_UPDATED);
    },
    [editingSearch, setEditingSearch],
  );

  const columnEditModalProps = useColumnEditModalProps(
    isOpenColumnEditModal,
    setIsOpenColumnEditModal,
    editingSearch.columns,
    onClickColumnEditModalOk,
    () => {},
  );

  if (songTableProps === undefined || columnEditModalProps === undefined) {
    return (
      <Box w="100%" h="100%" className="layout-border-top layout-border-left">
        <CenterSpinner />
      </Box>
    );
  }

  return (
    <>
      <Box w="100%" h="full">
        <SongTable {...songTableProps} />
        <PlaylistSelectModal {...playlistSelectModalProps} />
        <ColumnEditModal {...columnEditModalProps} />
      </Box>
    </>
  );
}
