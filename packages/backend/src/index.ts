import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import express, { type ErrorRequestHandler } from "express";
import { Server as SocketIOServer } from "socket.io";

import { SocketIoManager } from "./SocketIoManager.js";
import configsRouter from "./configs/configsRouter.js";
import mpdRouter from "./mpd/mpdRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// APIs
app.use("/api/configs", configsRouter);
app.use("/api/mpd", mpdRouter);
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
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
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.info(`Server running on port ${PORT}`);
});
