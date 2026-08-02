import express, { type Request, type Response, Router } from "express";

import { mcpMessageHandlerStreamableHttp } from "./transports/McpMessageHandlerStreamableHttp.js";

const mcpRouter: ReturnType<typeof Router> = Router();

// The body is parsed here and handed to the handler so it never re-reads the
// already-drained Node stream. Method handling (405 for the 2025-era session
// verbs GET/DELETE, which stateless serving has no use for) belongs to the
// handler itself, so every method is routed to it.
mcpRouter.use(express.json({ limit: "16mb" }));

mcpRouter.all("/", async (req: Request, res: Response) => {
	await mcpMessageHandlerStreamableHttp.handleRequest(req, res, req.body);
});

export default mcpRouter;
