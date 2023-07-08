"use client";
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
import React from "react";
import { IoCreate } from "react-icons/io5";

import { useSettingStates } from "../hooks/useSettingStates";
import { useStateEditor } from "../hooks/useStateEditor";

import StateEditor from "./StateEditor";

import { CenterSpinner } from "@/frontend/common_ui/elements/CenterSpinner";
import { BrowserState } from "@/models/browser";
import { LayoutState } from "@/models/layout";
import { MpdProfileState } from "@/models/mpd/mpd_profile";
import { SavedSearches } from "@/models/search";
import { CommonSongTableState } from "@/models/song_table";

export default function SettingStates() {
  const {
    profileState,
    updateProfileState,
    layoutState,
    updateLayoutState,
    commonSongTableState,
    updateCommonSongTableState,
    browserState,
    updateBrowserState,
    savedSearches,
    updateSavedSearches,
  } = useSettingStates();

  const profileEditor = useStateEditor<MpdProfileState>(
    profileState,
    MpdProfileState,
    updateProfileState,
  );
  const layoutEditor = useStateEditor<LayoutState>(
    layoutState,
    LayoutState,
    updateLayoutState,
  );
  const commonSongTableEditor = useStateEditor<CommonSongTableState>(
    commonSongTableState,
    CommonSongTableState,
    updateCommonSongTableState,
  );
  const browserStateEditor = useStateEditor<BrowserState>(
    browserState,
    BrowserState,
    updateBrowserState,
  );
  const savedSearchesEditor = useStateEditor<SavedSearches>(
    savedSearches,
    SavedSearches,
    updateSavedSearches,
  );

  if (
    profileState === undefined ||
    layoutState === undefined ||
    commonSongTableState === undefined ||
    browserState === undefined ||
    savedSearches === undefined ||
    profileEditor.props === undefined ||
    layoutEditor.props === undefined ||
    commonSongTableEditor.props === undefined ||
    browserStateEditor.props === undefined ||
    savedSearchesEditor.props === undefined
  ) {
    return <CenterSpinner></CenterSpinner>;
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
                    onClick={() => {
                      profileEditor.onOpen();
                    }}
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
                    onClick={() => {
                      layoutEditor.onOpen();
                    }}
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
                    onClick={() => {
                      commonSongTableEditor.onOpen();
                    }}
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
                    onClick={() => {
                      browserStateEditor.onOpen();
                    }}
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
                    onClick={() => {
                      savedSearchesEditor.onOpen();
                    }}
                  />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
      <StateEditor<MpdProfileState> {...profileEditor.props}></StateEditor>
      <StateEditor<LayoutState> {...layoutEditor.props}></StateEditor>
      <StateEditor<CommonSongTableState>
        {...commonSongTableEditor.props}
      ></StateEditor>
      <StateEditor<BrowserState> {...browserStateEditor.props}></StateEditor>
      <StateEditor<SavedSearches> {...savedSearchesEditor.props}></StateEditor>
    </>
  );
}
