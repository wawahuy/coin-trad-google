import WebSocket from 'ws';
import ClientManager from '../client_manager';
import WsProxyClient from './client';
import { ECommandType } from './command';

/**
 * Server
 * 
 */
const wsProxy = new WebSocket.Server({ noServer: true });

/**
 * Manager
 * 
 */
export const wsProxyManager = new ClientManager<ECommandType, WsProxyClient>();

/**
 * Connection
 * 
 */
wsProxy.on('connection', (ws: WebSocket) => {
  const client = new WsProxyClient(ws);
  wsProxyManager.connection(client);
});

export default wsProxy;