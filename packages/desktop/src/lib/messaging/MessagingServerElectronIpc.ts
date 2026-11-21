import type { IpcMain } from "electron";
import type {
	MessagingHandler,
	MessagingPeer,
	MessagingServer,
} from "#backend/lib/messaging/MessagingServer.js";

type NavigationDetails = { isMainFrame: boolean; isSameDocument: boolean };

type WebContentsLike = {
	readonly id: number;
	isDestroyed(): boolean;
	send(channel: string, payload: Uint8Array): void;
	on(
		event: "did-start-navigation",
		listener: (details: NavigationDetails) => void,
	): unknown;
	on(event: "render-process-gone" | "destroyed", listener: () => void): unknown;
};

type DocumentState = {
	webContents: WebContentsLike;
	generation: number;
	peer: MessagingPeer | undefined;
};

export class MessagingServerElectronIpc implements MessagingServer {
	private readonly states = new Map<number, DocumentState>();
	private readonly disconnectListeners: Array<
		(peer: MessagingPeer) => Promise<void> | void
	> = [];

	constructor(private readonly ipcMain: IpcMain) {}

	handle(channel: string, handler: MessagingHandler): void {
		this.ipcMain.handle(channel, async (event, payload: Uint8Array) => {
			const peer = this.peerFor(event.sender as WebContentsLike);
			try {
				return (await handler(payload, peer)) ?? new Uint8Array(0);
			} catch (err) {
				console.error(`Handler for ${channel} failed:`, err);
				throw err;
			}
		});
	}

	onDisconnect(listener: (peer: MessagingPeer) => Promise<void> | void): void {
		this.disconnectListeners.push(listener);
	}

	broadcast(
		channel: string,
		payload: Uint8Array,
		options?: { except?: string },
	): void {
		for (const state of this.states.values()) {
			if (state.peer === undefined || state.peer.id === options?.except) {
				continue;
			}
			state.peer.send(channel, payload);
		}
	}

	private peerFor(webContents: WebContentsLike): MessagingPeer {
		let state = this.states.get(webContents.id);
		if (state === undefined) {
			state = { webContents, generation: 0, peer: undefined };
			this.states.set(webContents.id, state);
			this.attachListeners(state);
		}
		if (state.peer === undefined) {
			state.generation += 1;
			state.peer = this.createPeer(state);
		}
		return state.peer;
	}

	private createPeer(state: DocumentState): MessagingPeer {
		const { webContents } = state;
		const peer: MessagingPeer = {
			id: `${webContents.id}:${state.generation}`,
			send: (channel, payload) => {
				if (state.peer === peer && !webContents.isDestroyed()) {
					webContents.send(channel, payload);
				}
			},
		};
		return peer;
	}

	private attachListeners(state: DocumentState): void {
		const { webContents } = state;
		webContents.on("did-start-navigation", (details) => {
			if (details.isMainFrame && !details.isSameDocument) {
				this.endPeer(state);
			}
		});
		webContents.on("render-process-gone", () => {
			this.endPeer(state);
		});
		webContents.on("destroyed", () => {
			this.endPeer(state);
			this.states.delete(webContents.id);
		});
	}

	private endPeer(state: DocumentState): void {
		const peer = state.peer;
		if (peer === undefined) {
			return;
		}
		state.peer = undefined;
		for (const listener of this.disconnectListeners) {
			void (async () => {
				try {
					await listener(peer);
				} catch (err) {
					console.error("Disconnect listener failed:", err);
				}
			})();
		}
	}
}
