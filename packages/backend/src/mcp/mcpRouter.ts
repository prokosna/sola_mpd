import express, { type Request, type Response, Router } from "express";

import { mcpMessageHandlerStreamableHttp } from "./transports/McpMessageHandlerStreamableHttp.js";

const mcpRouter: ReturnType<typeof Router> = Router();

// Streamable HTTP transport expects a JSON-RPC body on POST and may issue
// GET (server-initiated SSE) or DELETE (session shutdown). We only run in
// stateless mode here, so GET and DELETE are rejected explicitly.
mcpRouter.use(express.json({ limit: "16mb" }));

mcpRouter.post("/", async (req: Request, res: Response) => {
	await mcpMessageHandlerStreamableHttp.handleRequest(req, res, req.body);
});

mcpRouter.get("/", (_req: Request, res: Response) => {
	res
		.status(405)
		.setHeader("Allow", "POST")
		.send("Streamable HTTP is configured in stateless mode. Use POST /mcp.");
});

mcpRouter.delete("/", (_req: Request, res: Response) => {
	res
		.status(405)
		.setHeader("Allow", "POST")
		.send("Streamable HTTP is configured in stateless mode. Use POST /mcp.");
});

export default mcpRouter;
