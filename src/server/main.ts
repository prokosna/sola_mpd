// cf. https://nextjs.org/docs/advanced-features/custom-server
import { createServer, IncomingMessage, ServerResponse } from "http";
import { parse } from "url";

import next from "next";
import { Server } from "socket.io";

import { webSocketManager } from "../backend/websocket/WebSocketManager";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpServer = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      if (req.url === undefined) {
        throw new Error("req.url is undefined");
      }
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  },
)
  .once("error", (err: any) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.info(`> Ready on http://${hostname}:${port}`);
  });

const io = new Server(httpServer, {
  maxHttpBufferSize: 5 * 1e8,
});
webSocketManager.initialize(io);

app.prepare().then(() => {
  httpServer;
});
