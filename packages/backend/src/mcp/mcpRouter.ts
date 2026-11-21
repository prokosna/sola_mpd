import express, { type Request, type Response, Router } from "express";

import type { McpMessageHandler } from "./transports/McpMessageHandler.js";

export function createMcpRouter(
	handler: McpMessageHandler,
): ReturnType<typeof Router> {
	const router: ReturnType<typeof Router> = Router();

	// The body is parsed here and handed to the handler so it never re-reads the
	// already-drained Node stream. Method handling (405 for the 2025-era session
	// verbs GET/DELETE, which stateless serving has no use for) belongs to the
	// handler itself, so every method is routed to it.
	router.use(express.json({ limit: "16mb" }));

	router.all("/", async (req: Request, res: Response) => {
		await handler.handleRequest(req, res, req.body);
	});

	return router;
}
