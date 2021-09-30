import EventEmitter from "events";
import WebSocket from "ws";
import WsCommand, { EWsCommandBase } from "./command";

export default class WsClient<CommandType> extends EventEmitter {

  constructor(protected socket: WebSocket) {
    super();
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onclose = this.onClose.bind(this);
    this.socket.onerror = this.onError.bind(this);
  }

  getSocket() {
    return this.socket;
  }
  
  send(command: WsCommand<CommandType>) {
    this.socket.send(JSON.stringify(command));
  }

  close() {
    this.socket.close();
  }

  private onClose() {
    this.emit(EWsCommandBase.CLOSE);
  }

  private onError(e: WebSocket.ErrorEvent) {
    this.emit(EWsCommandBase.CLOSE, e);
  }

  private onMessage(data: WebSocket.MessageEvent) {
    const strData = data.data?.toString('utf-8');
    if (strData) {
      try {
        const command = <WsCommand<CommandType>>JSON.parse(strData);
        const type = <string><unknown>command.c;
        this.emit(type, command.d);
      } catch (e) {
      }
    }
  }
}
