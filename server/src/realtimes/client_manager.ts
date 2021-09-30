import AVLTree from "avl";
import EventEmitter from "events";
import WsClient from "./client";
import WsCommand, { EWsCommandBase } from "./command";

export default class ClientManager<
  CommandType,
  T extends WsClient<CommandType>
> extends EventEmitter {
  private nextId: number = 0;
  private size: number = 0;
  private clients: { [key: number]: T } = {};
  private clientGroups: {
    [key: string]: AVLTree<number, unknown>;
  } = {};

  constructor() {
    super();
  }

  getClients() {
    return this.clients;
  }

  getSize() {
    return this.size;
  }

  getGroupsClient(idClient: number): string[] {
    const groups: string[] = [];
    Object.keys(this.clientGroups).map((group) => {
      if (this.clientGroups[group].find(idClient)) {
        groups.push(group);
      }
    });
    return groups;
  }

  leaveAllGroups(idClient: number) {
    const groups = this.getGroupsClient(idClient);
    groups.map(group => {
      this.clientGroups[group].remove(idClient);
    });
  }

  connection(client: T) {
    const id = this.nextId++;
    client.on(EWsCommandBase.CLOSE, this.onClientClose(id));
    client.on(EWsCommandBase.ERROR, this.onClientError(id));
    client.on(EWsCommandBase.JOIN_GROUP, this.onJoinGroup(id));
    client.on(EWsCommandBase.LEAVE_GROUP, this.onLeaveGroup(id));
    this.size++;
    this.clients[id] = client;
  }

  broadcast(command: WsCommand<CommandType>) {
    for (let clientId in this.clients) {
      this.clients[clientId].send(command);
    }
  }

  broadcastGroup(group: string, command: WsCommand<CommandType>) {
    const clientIds = this.clientGroups[group];
    clientIds?.forEach((node) => {
      if (node.key) {
        this.clients[node.key].send(command);
      }
    });
  }

  private onClientClose = (id: number) => {
    return () => {
      this.leaveAllGroups(id);
      this.clients[id].removeAllListeners();
      this.size--;
      delete this.clients[id];
    };
  };

  private onClientError = (id: number) => {
    return () => {
      this.clients[id].close();
    };
  };

  private onJoinGroup = (id: number) => {
    return (name: string) => {
      if (!this.clientGroups[name]) {
        this.clientGroups[name] = new AVLTree();
      }
      this.clientGroups[name].insert(id);
    };
  };

  private onLeaveGroup = (id: number) => {
    return (name: string) => {
      this.clientGroups[name]?.remove(id);
    };
  };
}
