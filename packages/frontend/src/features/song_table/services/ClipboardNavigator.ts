import type { Clipboard } from "./Clipboard";

export class ClipboardNavigator implements Clipboard {
	writeText = async (text: string): Promise<void> => {
		// navigator.clipboard is missing outside a secure context, which is the
		// case when the Docker build is opened over plain HTTP from another host.
		if (window.isSecureContext && navigator.clipboard !== undefined) {
			await navigator.clipboard.writeText(text);
			return;
		}
		this.writeTextWithExecCommand(text);
	};

	private writeTextWithExecCommand(text: string): void {
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		try {
			if (!document.execCommand("copy")) {
				throw new Error("Copying to the clipboard was rejected.");
			}
		} finally {
			document.body.removeChild(textarea);
		}
	}
}
