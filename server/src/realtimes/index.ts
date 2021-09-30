import { wsWorkerMiddleware } from './../middlewares/ws_worker';
import http from "http";
import net from "net";
import WebSocket from "ws";
import wsCoinManager from "./coin_manager";
import Url from "url";
import { appConfigs } from "../config/app";

export default function transportWebsocket(
  request: http.IncomingMessage,
  socket: net.Socket,
  upgradeHead: Buffer
) {
  const nextWebsocket = (wss: WebSocket.Server) => {
    return () => {
      wss.handleUpgrade(request, socket, upgradeHead, function done(ws) {
        wss.emit('connection', ws, request);
      });
    };
  }

  if (!request.url) {
    socket.destroy();
    return;
  }

  const url = Url.parse(request.url);
  switch (url.pathname) {
    case appConfigs.WS_COIN_MANAGER:
      return wsWorkerMiddleware(<any>request, <any>socket, nextWebsocket(wsCoinManager));
  }

  socket.destroy();
}
