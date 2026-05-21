import { type Message, toJson } from "@bufbuild/protobuf";
import type { GenMessage } from "@bufbuild/protobuf/codegenv2";
import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { parseSettingsStateJson } from "../functions/parseSettingsStateJson";

export type SettingsStatesEditorProps<T extends Message> = {
	schema: GenMessage<T>;
	state: T;
	onSave: (state: T) => Promise<void>;
	isOpen: boolean;
	onClose: () => void;
};

export function SettingsStatesEditor<T extends Message>(
	props: SettingsStatesEditorProps<T>,
) {
	const { schema, state, onSave, isOpen, onClose } = props;

	const baseJsonText = JSON.stringify(toJson(schema, state), null, 2);
	const [stateJsonText, setStateJsonText] = useState(baseJsonText);
	const [errorMessage, setErrorMessage] = useState("");
	const newStateRef = useRef<T | undefined>(undefined);

	useEffect(() => {
		setStateJsonText(baseJsonText);
	}, [baseJsonText]);

	const handleInput = useCallback(
		(value: string) => {
			setStateJsonText(value);
			const result = parseSettingsStateJson(schema, value);
			if (result.ok) {
				newStateRef.current = result.state;
				setErrorMessage("");
			} else {
				setErrorMessage(result.errorMessage);
			}
		},
		[schema],
	);

	const close = () => {
		setErrorMessage("");
		onClose();
	};

	return (
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
						disabled={newStateRef.current === undefined || errorMessage !== ""}
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
	);
}
