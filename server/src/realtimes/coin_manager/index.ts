import WebSocket from 'ws';
import ClientManager from '../client_manager';
import WsCoinClient from './client';
import { ECommandType } from './command';

/**
 * Server
 * 
 */
const wsCoin = new WebSocket.Server({ noServer: true });

/**
 * Manager
 * 
 */
export const wsCoinManager = new ClientManager<ECommandType, WsCoinClient>();

/**
 * Connection
 * 
 */
wsCoin.on('connection', (ws: WebSocket) => {
  const client = new WsCoinClient(ws);
  wsCoinManager.connection(client);
});

export default wsCoin;