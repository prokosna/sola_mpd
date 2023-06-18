import { VStack } from "@chakra-ui/react";
import { Allotment } from "allotment";
import React from "react";

import SavedSearchList from "./SavedSearchList";
import SearchEditor from "./SearchEditor";

export default function SearchSidePane() {
  return (
    <>
      <VStack h="full" spacing={0}>
        <Allotment vertical={true}>
          <Allotment.Pane minSize={20}>
            <SearchEditor></SearchEditor>
          </Allotment.Pane>
          <Allotment.Pane minSize={20}>
            <SavedSearchList></SavedSearchList>
          </Allotment.Pane>
        </Allotment>
      </VStack>
    </>
  );
}
