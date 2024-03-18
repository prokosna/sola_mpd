import http from "http";

import { expressConnectMiddleware } from "@connectrpc/connect-express";
import express from "express";

import { routes } from "./routers.js";

const app = express();

app.use(
  expressConnectMiddleware({
    routes,
  }),
);

http.createServer(app).listen(3001);
