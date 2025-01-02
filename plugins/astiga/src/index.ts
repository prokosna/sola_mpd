import http from "node:http";

import { expressConnectMiddleware } from "@connectrpc/connect-express";
import express from "express";

import { routes } from "./routers.js";

const app = express();

app.use(
	expressConnectMiddleware({
		routes,
	}),
);

const port = process.env.PORT || 3001;
http.createServer(app).listen(port);
console.info(`Running on ${port}`);
