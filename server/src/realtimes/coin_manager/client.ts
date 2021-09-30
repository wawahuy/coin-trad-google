import WebSocket from "ws";
import WsClient from "../client";
import { ECommandType } from "./command";

export default class WsProxyClient extends WsClient<ECommandType> {
  constructor(ws: WebSocket) {
    super(ws);
    // this.on(EWsCommandBase.CLOSE, this.onCloseWs);
  }
}
