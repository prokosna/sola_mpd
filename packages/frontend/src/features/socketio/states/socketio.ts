import { useAtomValue } from "jotai";
import { atomWithDefault, unwrap } from "jotai/utils";
import { Socket, io } from "socket.io-client";

const socketAtom = atomWithDefault((_get) => {
  return new Promise<Socket>((resolve, reject) => {
    console.info("Connecting socket.io...");
    const socket = io(window.location.host, { path: "/io/" });

    socket.on("connect", function () {
      console.info("Socket.io is connected");
      resolve(socket);
    });

    socket.on("exception", function (err) {
      console.error(err);
      reject(err);
    });

    socket.on("disconnect", function () {
      console.info("Socket.io is disconnected");
    });
  });
});

const unwrappedSocketAtom = unwrap(socketAtom, (prev) => prev || undefined);

export { socketAtom };

export function useSocketState() {
  return useAtomValue(unwrappedSocketAtom);
}
