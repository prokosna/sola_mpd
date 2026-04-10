export function isInputElementActive(activeElement: Element | null): boolean {
	if (activeElement === null) return false;
	return (
		activeElement.tagName === "INPUT" ||
		activeElement.tagName === "TEXTAREA" ||
		(activeElement as HTMLElement).isContentEditable
	);
}

export function isKeyCombinationPressed(
	keysPressed: Set<string>,
	requiredKeys: string[],
): boolean {
	return requiredKeys.every((key) => keysPressed.has(key));
}
