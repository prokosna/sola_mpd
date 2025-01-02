import {
	Button,
	ButtonGroup,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	ModalHeader,
} from "@chakra-ui/react";
import type { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { useRef } from "react";

import { useHandlePluginConnected } from "../hooks/useHandlePluginConnected";

export type PluginAddModalConnectProps = {
	setPluginToAdd: (plugin: Plugin | undefined) => void;
};

/**
 * Plugin connection form.
 *
 * Handles endpoint input and connection.
 *
 * @param props.setPluginToAdd Plugin setter
 * @returns Connection form
 */
export function PluginAddModalConnect(props: PluginAddModalConnectProps) {
	const { setPluginToAdd } = props;

	const endpointRef = useRef<HTMLInputElement>(null);
	const { errorMessage, handlePluginConnected } = useHandlePluginConnected(
		endpointRef,
		setPluginToAdd,
	);

	return (
		<>
			<ModalHeader>Register Plugin</ModalHeader>
			<ModalCloseButton />
			<ModalBody>
				<FormControl isInvalid={errorMessage !== ""}>
					<FormLabel>Endpoint</FormLabel>
					<Input type="text" placeholder="localhost:3001" ref={endpointRef} />
					{errorMessage !== "" ? (
						<FormErrorMessage>{errorMessage}</FormErrorMessage>
					) : null}
				</FormControl>
			</ModalBody>
			<ModalFooter>
				<ButtonGroup spacing="2">
					<Button variant="outline" onClick={handlePluginConnected}>
						Connect
					</Button>
				</ButtonGroup>
			</ModalFooter>
		</>
	);
}
