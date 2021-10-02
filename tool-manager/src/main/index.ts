import { context } from './context';
import path from 'path';
import fs from 'fs';
import * as coinService from '../services/coin';
import * as workerService from '../services/worker';
import Session from './session';

export default async function main() {
  // read id
  const p = path.join(__dirname, '../../.configid');
  if (!fs.existsSync(p)) {
    console.log('ID not found');
    return;
  }

  context.id = fs.readFileSync(p).toString('utf-8');

  const running = async function () {
    console.log('recheck...');
    if (!context.id) {
      console.log('No coin id');
      return;
    }

    try {
      const d = await coinService.sync(context.id, {});
      const data = <any>d.data;
      if (data.status) {
        context.mainDetail = data.data;
      }
    } catch (e) {
    }
    
    const workerCurrent = context.sessions.length;
    const workerMax = context.mainDetail?.worker_max || 0;
    console.log('worker active: ', workerCurrent, '/', workerMax);

    if (workerCurrent < workerMax) {
      console.log('create new session...');
      const workerNext = await workerService.getOne().catch(e => null);
      const workerNextData = <any>workerNext?.data;
      if (workerNextData?.status) {
        const workerID = workerNextData.data;
        console.log('new worker get', workerID);

        const session = await Session.build(workerID);
        if (session) {
          console.log('worker connected', workerID);
          context.sessions.push(session);
        }
      } else {
        console.log('failed get session');
      }
    }


    setTimeout(running, 10000);
  }

  running();
}