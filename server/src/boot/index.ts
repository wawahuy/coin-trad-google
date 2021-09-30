import http from 'http';
import expressApp from './express';
import initMongo from './mongo';
import transportWebsocket from '../realtimes';
import { appConfigs } from '../config/app';

const server = http.createServer(expressApp);

server.on('error', (e: Error) => {
  console.log(e.stack?.toString());
});

server.on('listening', () => {
  console.log("Express listen - port: " + appConfigs.PORT)
});

server.on('upgrade', transportWebsocket);

server.listen(appConfigs.PORT, "0.0.0.0");

initMongo();
