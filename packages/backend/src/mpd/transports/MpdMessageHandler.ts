export type MpdTransportConnection = {
	join: (room: string) => void;
	leave: (room: string) => void;
	emit: (event: string, payload: unknown) => void;
};

export interface MpdMessageHandler {
	subscribeEvents: (
		id: string,
		msg: Uint8Array,
		connection: MpdTransportConnection,
	) => Promise<void>;
	unsubscribeEvents: (
		id: string,
		msg: Uint8Array,
		connection: MpdTransportConnection,
	) => Promise<void>;
	command: (msg: Uint8Array) => Promise<Uint8Array>;
	commandBulk: (msg: Uint8Array) => Promise<void>;
	disconnect: (id: string, connection: MpdTransportConnection) => Promise<void>;
}
