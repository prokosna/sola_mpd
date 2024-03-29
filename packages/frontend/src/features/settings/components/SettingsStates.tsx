import {
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";
import { LayoutState } from "@sola_mpd/domain/src/models/layout_pb.js";
import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";
import { CommonSongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import { IoCreate } from "react-icons/io5";

import { useBrowserState, useUpdateBrowserState } from "../../browser";
import { useLayoutState, useSetLayoutState } from "../../layout";
import { CenterSpinner } from "../../loading";
import { useMpdProfileState, useSetMpdProfileState } from "../../profile";
import { useSavedSearchesState, useSetSavedSearchesState } from "../../search";
import {
  useCommonSongTableState,
  useSetCommonSongTableState,
} from "../../song_table";
import { useSettingsStateEditorProps } from "../hooks/useSettingsStateEditorProps";

import { SettingsStatesEditor } from "./SettingsStatesEditor";

export function SettingsStates() {
  const mpdProfileState = useMpdProfileState();
  const setMpdProfileState = useSetMpdProfileState();
  const [onOpenProfileState, profileStateProps] =
    useSettingsStateEditorProps<MpdProfileState>(
      mpdProfileState,
      setMpdProfileState,
      MpdProfileState.fromJson,
    );

  const layoutState = useLayoutState();
  const setLayoutState = useSetLayoutState();
  const [onOpenLayoutState, layoutStateProps] =
    useSettingsStateEditorProps<LayoutState>(
      layoutState,
      setLayoutState,
      LayoutState.fromJson,
    );

  const commonSongTableState = useCommonSongTableState();
  const setCommonSongTableState = useSetCommonSongTableState();
  const [onOpenCommonSongTableState, commonSongTableStateProps] =
    useSettingsStateEditorProps<CommonSongTableState>(
      commonSongTableState,
      setCommonSongTableState,
      CommonSongTableState.fromJson,
    );

  const browserState = useBrowserState();
  const updateBrowserState = useUpdateBrowserState();
  const [onOpenBrowserState, browserStateProps] =
    useSettingsStateEditorProps<BrowserState>(
      browserState,
      updateBrowserState,
      BrowserState.fromJson,
    );

  const savedSearches = useSavedSearchesState();
  const setSavedSearches = useSetSavedSearchesState();
  const [onOpenSavedSearches, savedSearchesProps] =
    useSettingsStateEditorProps<SavedSearches>(
      new SavedSearches({ searches: savedSearches || [] }),
      async (savedSearches: SavedSearches) => {
        setSavedSearches(savedSearches.searches);
      },
      SavedSearches.fromJson,
    );

  if (
    mpdProfileState === undefined ||
    profileStateProps === undefined ||
    layoutState === undefined ||
    layoutStateProps === undefined ||
    commonSongTableState === undefined ||
    commonSongTableStateProps === undefined ||
    browserState === undefined ||
    browserStateProps === undefined ||
    savedSearches === undefined ||
    savedSearchesProps === undefined
  ) {
    return <CenterSpinner className="layout-border-top layout-border-left" />;
  }

  return (
    <>
      <VStack spacing={"12px"} align={"start"}>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>STATE</Th>
                <Th>ACTION</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Profile</Td>
                <Td>
                  <IconButton
                    variant="outline"
                    aria-label="Edit"
                    size="xs"
                    icon={<IoCreate />}
                    onClick={onOpenProfileState}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>Layout</Td>
                <Td>
                  <IconButton
                    variant="outline"
                    aria-label="Edit"
                    size="xs"
                    icon={<IoCreate />}
                    onClick={onOpenLayoutState}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>Song Table</Td>
                <Td>
                  <IconButton
                    variant="outline"
                    aria-label="Edit"
                    size="xs"
                    icon={<IoCreate />}
                    onClick={onOpenCommonSongTableState}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>Browser</Td>
                <Td>
                  <IconButton
                    variant="outline"
                    aria-label="Edit"
                    size="xs"
                    icon={<IoCreate />}
                    onClick={onOpenBrowserState}
                  />
                </Td>
              </Tr>
              <Tr>
                <Td>Saved Searches</Td>
                <Td>
                  <IconButton
                    variant="outline"
                    aria-label="Edit"
                    size="xs"
                    icon={<IoCreate />}
                    onClick={onOpenSavedSearches}
                  />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
      <SettingsStatesEditor<MpdProfileState> {...profileStateProps} />
      <SettingsStatesEditor<LayoutState> {...layoutStateProps} />
      <SettingsStatesEditor<CommonSongTableState>
        {...commonSongTableStateProps}
      />
      <SettingsStatesEditor<BrowserState> {...browserStateProps} />
      <SettingsStatesEditor<SavedSearches> {...savedSearchesProps} />
    </>
  );
}
