import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { API_VIEW_STATE_BLOBS } from "@sola_mpd/shared/src/const/api.js";
import express, { type ErrorRequestHandler } from "express";
import { Server as SocketIOServer } from "socket.io";
import configsRouter from "./configs/configsRouter.js";
import mcpRouter from "./mcp/mcpRouter.js";
import mpdRouter from "./mpd/mpdRouter.js";
import { SocketIoManager } from "./SocketIoManager.js";
import { sweepViewStateBlobsUseCase } from "./view_state_blobs/application/viewStateBlobUseCases.js";
import viewStateBlobsRouter from "./view_state_blobs/viewStateBlobsRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// APIs
app.use("/api/configs", configsRouter);
app.use("/api/mpd", mpdRouter);
app.use(API_VIEW_STATE_BLOBS, viewStateBlobsRouter);
app.use("/mcp", mcpRouter);

// One-time startup sweep of view state blobs unused for longer than the
// retention window. Never fatal: a failure here shouldn't block startup.
try {
	sweepViewStateBlobsUseCase();
} catch (err) {
	console.error("Failed to sweep view state blobs on startup:", err);
}
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	console.error(err);
	res.status(500);
	res.type("text/plain");
	res.send(err.message || "Internal Server Error");
};
app.use(errorHandler);

// Socket.io
const io = new SocketIOServer(server, {
	path: "/io/",
	maxHttpBufferSize: 1.024e9,
});
SocketIoManager.initialize(io);

// Serve SPA
app.use(express.static(path.join(__dirname, "public")));
app.get("*splat", (_req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.info(`Listening on http://localhost:${PORT}`);
});
