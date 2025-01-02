import {
	Plugin,
	PluginRegisterRequest,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { type RefObject, useCallback, useState } from "react";

import { usePluginService } from "../states/pluginServiceState";
import { validateIpAndPort } from "../utils/validationUtils";

/**
 * Handle plugin connection.
 *
 * @param endpointRef Input element ref
 * @param setPluginToAdd Plugin setter
 * @returns Error and connect handler
 */
export function useHandlePluginConnected(
	endpointRef: RefObject<HTMLInputElement>,
	setPluginToAdd: (plugin: Plugin | undefined) => void,
) {
	const pluginService = usePluginService();
	const [errorMessage, setErrorMessage] = useState("");

	const handlePluginConnected = useCallback(async () => {
		const endpoint = endpointRef.current?.value;
		if (endpoint === undefined) {
			setErrorMessage("Endpoint is required.");
			return;
		}
		if (!validateIpAndPort(endpoint)) {
			setErrorMessage("Endpoint must be in the format: [IP]:[PORT]");
			return;
		}

		setErrorMessage("");

		const [host, port] = endpoint.split(":");
		const req = new PluginRegisterRequest({ host, port: Number(port) });

		try {
			const resp = await pluginService.register(req);
			if (resp.info === undefined) {
				setErrorMessage(
					"Plugin implementation is incorrect: info is undefined.",
				);
				return;
			}
			setErrorMessage("");

			setPluginToAdd(
				new Plugin({
					host,
					port: Number(port),
					info: resp.info,
					isAvailable: true,
				}),
			);
		} catch (e) {
			if (e instanceof Error) {
				setErrorMessage(e.message);
			} else {
				setErrorMessage(String(e));
			}
			return;
		}
	}, [endpointRef, pluginService, setPluginToAdd]);

	return {
		errorMessage,
		handlePluginConnected,
	};
}
