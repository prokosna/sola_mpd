import type { Plugin } from "@sola_mpd/shared/src/models/plugin/plugin_pb.js";
import { useAtomValue } from "jotai";
import { type RefObject, useCallback, useState } from "react";

import { connectPlugin } from "../functions/pluginConnectionValidation";
import { pluginServiceAtom } from "../states/atoms/pluginServiceAtom";

export function useHandlePluginConnected(
	endpointRef: RefObject<HTMLInputElement | null>,
	setPluginToAdd: (plugin: Plugin | undefined) => void,
) {
	const pluginService = useAtomValue(pluginServiceAtom);
	const [errorMessage, setErrorMessage] = useState("");

	const handlePluginConnected = useCallback(async () => {
		const endpoint = endpointRef.current?.value;
		const result = await connectPlugin(endpoint, pluginService);

		if (result.success) {
			setErrorMessage("");
			setPluginToAdd(result.plugin);
		} else {
			setErrorMessage(result.errorMessage);
		}
	}, [endpointRef, pluginService, setPluginToAdd]);

	return {
		errorMessage,
		handlePluginConnected,
	};
}
