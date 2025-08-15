import type { Message } from "@bufbuild/protobuf";
import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Props for state editor modal.
 *
 * @template T State type extending Protobuf Message
 * @property state Current state
 * @property onSave Save callback
 * @property isOpen Modal visibility
 * @property onClose Close callback
 * @property fromJson JSON parser
 */
export type SettingsStatesEditorProps<T> = {
	state: T;
	onSave: (state: T) => Promise<void>;
	isOpen: boolean;
	onClose: () => void;
	fromJson: (json: string) => T;
};

/**
 * JSON editor modal for application state.
 *
 * @template T State type extending Protobuf Message
 */
export function SettingsStatesEditor<T extends Message>(
	props: SettingsStatesEditorProps<T>,
) {
	const { state, onSave, isOpen, onClose, fromJson } = props;

	const baseJsonText = JSON.stringify(state.toJson(), null, 2);
	const [stateJsonText, setStateJsonText] = useState(baseJsonText);
	const [errorMessage, setErrorMessage] = useState("");
	const newStateRef = useRef<T | undefined>(undefined);

	useEffect(() => {
		setStateJsonText(baseJsonText);
	}, [baseJsonText]);

	const handleInput = useCallback(
		(value: string) => {
			setStateJsonText(value);
			try {
				JSON.parse(value);
			} catch (_) {
				setErrorMessage("Invalid JSON string");
				return;
			}
			setErrorMessage("");
			try {
				const newState = fromJson(JSON.parse(value));
				newStateRef.current = newState;
			} catch (e) {
				if (e instanceof Error) {
					setErrorMessage(e.message);
				} else {
					setErrorMessage("Failed to parse the text as a state.");
				}
			}
		},
		[fromJson],
	);

	const close = () => {
		setErrorMessage("");
		onClose();
	};

	return (
		<>
			<Modal opened={isOpen} onClose={close} title="Edit JSON file">
				<Stack>
					<Text c="red">
						{"Don't edit unless you understand what you are doing."}
					</Text>
					<Textarea
						autosize
						value={stateJsonText}
						onChange={(e) => handleInput(e.target.value)}
					/>
					{errorMessage !== "" && <Text c="red">{errorMessage}</Text>}
					<Group justify="flex-end">
						<Button
							disabled={
								newStateRef.current === undefined || errorMessage !== ""
							}
							onClick={() => {
								if (newStateRef.current === undefined) return;
								onSave(newStateRef.current);
								close();
							}}
						>
							Save
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
