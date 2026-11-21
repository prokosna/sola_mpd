import type { CallToolResult } from "@modelcontextprotocol/server";

export type CapturedTool = {
	name: string;
	config: {
		title?: string;
		description?: string;
		inputSchema?: unknown;
	};
	cb: (args: unknown) => Promise<CallToolResult>;
};

export type FakeMcpServer = {
	registerTool: (
		name: string,
		config: CapturedTool["config"],
		cb: CapturedTool["cb"],
	) => void;
	tools: Map<string, CapturedTool>;
	call: (name: string, args?: unknown) => Promise<CallToolResult>;
};

export function createFakeMcpServer(): FakeMcpServer {
	const tools = new Map<string, CapturedTool>();
	return {
		registerTool: (name, config, cb) => {
			tools.set(name, { name, config, cb });
		},
		tools,
		call: async (name, args) => {
			const tool = tools.get(name);
			if (tool === undefined) {
				throw new Error(`tool not registered: ${name}`);
			}
			return tool.cb(args ?? {});
		},
	};
}

export function parseToolJson<T = unknown>(result: CallToolResult): T {
	const text = result.content?.[0];
	if (text === undefined || text.type !== "text") {
		throw new Error("expected text content");
	}
	return JSON.parse(text.text) as T;
}
