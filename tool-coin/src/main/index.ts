import { context } from './context';
import path from 'path';
import fs from 'fs';
import * as coinService from '../services/coin';
import * as workerService from '../services/worker';
import Session from './session';
import { log } from '../helper/func';
import { callEvery } from '../helper/task';
import { SessionStatus } from '../models/session';
import { getDirUserData } from "../helper/dir";
import rimraf from 'rimraf';

async function takeNewSession() {
  // sync detail
  try {
    if (context.id) {
      const d = await coinService.sync(context.id, {});
      const data = <any>d.data;
      if (data.status) {
        context.mainDetail = data.data;
      }
    }
  } catch (e) {
  }

  // check new session
  const workerCurrent = context.sessions.length;
  const workerMax = context.mainDetail?.worker_max || 0;
  log('worker active: ', workerCurrent, '/', workerMax);

  if (workerCurrent < workerMax) {
    log('session get...');
    const workerNext = await workerService.getOne().catch(e => null);
    const workerNextData = <any>workerNext?.data;
    if (workerNextData?.status) {
      const workerID = workerNextData.data;
      log('session init', workerID);

      const session = await Session.build(workerID);
      if (session) {
        const result = await session.asyncInit();
        if (result == SessionStatus.Next) {
          log('session connected', workerID);
          context.sessions.push(session);
        } else if (result == SessionStatus.Cancel) {
          log('session checkpoint', workerID);
          workerService.checkpoint(workerID);
        } else {
          log('session create failed');
          await session.asyncClose(false);
        }
      }

    } else {
      log('session get failed');
    }
  }

  return true;
}

export default async function main() {
  const ud = getDirUserData('');
  if (fs.existsSync(ud)) {
    try {
      log('Remove', ud);
      rimraf.sync(ud);
    } catch (e) {
      log('No remove profile');
    }
  }

  const p = path.join(__dirname, '../../.configid');
  if (!fs.existsSync(p)) {
    console.log('ID not found');
    return;
  }

  context.id = fs.readFileSync(p).toString('utf-8');
  log('[Coin] open ', context.id);
  if (!context.id) {
    log('[Coin] no id');
    return;
  }

  const funcTakeNewSession = callEvery(10000, takeNewSession);
  const sleep = 1000;
  const running = async function () {
    const t = new Date().getTime();

    /**
     * New tick
     * 
     */
    await funcTakeNewSession();

    // run session
    let countRunning = 0;
    let sessionsRunning: Session[] = [];
    const sessionsRemove: Session[] = [];
    const sessions = context.sessions;
    const threads = context?.mainDetail?.thread || 1;
    for (let i = 0; i < sessions.length; i++) {
      countRunning++;
      sessionsRunning.push(sessions[i]);
      if (countRunning >= threads || i == sessions.length) {
        await Promise.all(sessionsRunning.map(async function (session) {
          const result = await session.asyncLoop();
          if (result != SessionStatus.Next) {
            sessionsRemove.push(session);
          }
        }));
        countRunning = 0;
        sessionsRunning = [];
      }
    }

    // remove session
    for (let i = 0; i < sessionsRemove.length; i++) {
      const session = sessionsRemove[i];
      await sessionsRemove[i].asyncClose();
      context.sessions = context.sessions.filter(s => s != session);
      log('session close', session.id);
    }

    /**
     * Compute DT time
     * 
     */
    const dt = new Date().getTime() - t;
    setTimeout(running, Math.max(sleep - dt, 100));
  }
  running();
}