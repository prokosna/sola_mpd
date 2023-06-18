import { useDisclosure } from "@chakra-ui/react";
import { useState } from "react";

import { Plugin } from "@/models/plugin/plugin";
import { Song } from "@/models/song";

export function usePluginExecutionModalProps() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [plugin, setPlugin] = useState<Plugin>();
  const [songs, setSongs] = useState<Song[]>([]);

  return {
    props: {
      plugin,
      songs,
      isOpen,
      onClose,
    },
    onOpen,
    setPlugin,
    setSongs,
  };
}
