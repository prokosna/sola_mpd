import type { IpcBridge } from "../ipc/IpcBridge";

import type { MessagingClient } from "./MessagingClient";

export class MessagingClientElectronIpc implements MessagingClient {
	constructor(private bridge: IpcBridge) {}

	isReady = async (): Promise<boolean> => {
		return true;
	};

	fetch = async <R>(
		event: string,
		payload: Uint8Array,
		fromBinary: (data: Uint8Array) => R,
	): Promise<R> => {
		const resp = await this.bridge.invoke(event, payload);
		return fromBinary(new Uint8Array(resp));
	};

	emit = async (event: string, payload: Uint8Array): Promise<Uint8Array> => {
		const resp = await this.bridge.invoke(event, payload);
		return new Uint8Array(resp);
	};

	on = async (
		event: string,
		callback: (message: Uint8Array) => void,
	): Promise<void> => {
		this.bridge.on(event, (data: Uint8Array) => {
			callback(new Uint8Array(data));
		});
	};

	off = async (event: string): Promise<void> => {
		this.bridge.off(event);
	};
}
