import { context } from './context';
import path from 'path';
import fs from 'fs';
import * as coinService from '../services/coin';
import * as workerService from '../services/worker';
import Session from './session';
import { log, logContext } from '../helper/func';
import { callEvery, TaskStatus } from '../helper/task';
import { SessionStatus } from '../models/session';
import { getDirUserData } from "../helper/dir";
import rimraf from 'rimraf';

function contextWaitingNonBlocking() {
  let isRunning = false;
  let step = 1;
  let result: any;
  return async function <Z, X, C>(
    initFunc: () => Promise<Z>,
    procFunc: (next: Z) => Promise<X>,
    doneFunc: (next: X) => Promise<C>
  ) {
    if (isRunning) {
      return;
    }

    if (step == 1) {
      result = await initFunc();
      step++;
      log('[non-blocking] init func');
    } else if (step == 2) {
      isRunning = true;
      step++;
      log('[non-blocking] proc func');
      (async () => {
        result = await procFunc(result);
        isRunning = false;
        log('[non-blocking] proc func done');
      })();
    } else if (step == 3) {
      result = await doneFunc(result);
      step = 1;
      isRunning = false;
      log('[non-blocking] done func');
    }
  }
}

const newSessionNonblockingContext = contextWaitingNonBlocking();

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

    await newSessionNonblockingContext(
      // init func - block
      async () => {
        const workerNext = await workerService.getOne().catch(e => null);
        const workerNextData = <any>workerNext?.data;
        return workerNextData;
      }, 

      // proc func - non
      async (workerNextData: any) => {
        if (workerNextData?.status) {
          const workerID = workerNextData.data;
          log('session init', workerID);
    
          const session = await Session.build(workerID);
          return session;
        } else {
          log('session get failed');
        }
        return null;
      },

      // done func - block
      async (session: false | Session | null) => {
        if (session) {
          const result = await session.asyncInit();
          if (result == SessionStatus.Next) {
            log('session connected', session.id);
            context.sessions.push(session);
          } else if (result == SessionStatus.Cancel) {
            log('session checkpoint', session.id);
            await workerService.checkpoint(session.id);
            await session.asyncClose(false);
          } else {
            log('session create failed');
            await session.asyncClose(false);
          }
        }
      }
    );
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

  context.id = fs.readFileSync(p).toString('utf-8')?.trim();
  log('[Coin] open ', context.id);
  if (!context.id) {
    log('[Coin] no id');
    return;
  }

  const funcSyncLog = callEvery(60000, async function () {
    try {
      if (!context.id) {
        return false;
      }
      await coinService.log(context.id.toString(), JSON.stringify(logContext));
    } catch (e) {
    }
    return true;
  })

  const funcTakeNewSession = callEvery(10000, takeNewSession);
  const sleep = 1000;
  const running = async function () {
    const t = new Date().getTime();

    /**
     * New tick
     * 
     */
    await funcTakeNewSession();
    await funcSyncLog();

    // run session
    let countRunning = 0;
    let sessionsRunning: Session[] = [];
    const sessionsRemove: Session[] = [];
    const sessions = context.sessions;
    const threads = context?.mainDetail?.thread || 1;
    for (let i = 0; i < sessions.length; i++) {
      countRunning++;
      sessionsRunning.push(sessions[i]);
      if (countRunning >= threads || i == sessions.length - 1) {
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