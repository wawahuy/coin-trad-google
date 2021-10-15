
import moment from "moment";
import { By, Key, until, WebDriver, WebElement } from "selenium-webdriver";
import { appConfigs } from "../config/app";
import { log, logContext, sleep } from "../helper/func";
import { callEvery, callOnce, callOnceTime, TaskStatus } from "../helper/task";
import Session from "../main/session";
import * as workerService from '../services/worker';
import * as commonService from '../services/common';
import { getDirUserData } from "../helper/dir";
import fs from 'fs';
import { WorkerType } from "../models/worker";
import { WorkerLogType } from "../models/worker_log";

const urlLogin = "https://shell.cloud.google.com/";
const locateShellTextarea = By.className('xterm-helper-textarea');
const locateShellXterm = By.css('.xterm-screen .xterm-rows');
const locateReconnect = By.css('status-message button');

async function sendKeySplash(driver: WebDriver) {
  const js = `
  (() => {
    let e = document.querySelectorAll("textarea.xterm-helper-textarea");
    e = e[e.length - 1];
    e.dispatchEvent(new KeyboardEvent("keydown", {
        key: "/",
        keyCode: 191, // example values.
        code: "Slash", // put everything you need in this object.
        shiftKey: false, // you don't need to include values
        ctrlKey: false,  // if you aren't going to use them.
        metaKey: false   // these are here for example's sake.
    }));
  })();
  `;
  await driver.executeScript(js).catch(e => console.log(e));
}

async function customSendCommand(driver: WebDriver, e: WebElement, command: string) {
  for (let i = 0; i < command.length; i++){
    const c = command.charAt(i);
    if (c == '/') {
      await sendKeySplash(driver);
      await sleep(200);
    } else {
      await e.sendKeys(c);
    }
    await sleep(50);
  }
  await e.sendKeys(Key.ENTER);
}

async function sendCommand(driver: WebDriver, command: string) {
  await driver.wait(until.elementsLocated(locateShellTextarea), 20000);
  let elementShellTextarea = await driver.findElement(locateShellTextarea);
  await customSendCommand(driver, elementShellTextarea, command);
}

async function getStdOutResult(driver: WebDriver) {
  await driver.wait(until.elementsLocated(locateShellXterm), 20000);
  let elementShellXterm = await driver.findElement(locateShellXterm);
  let rows = await elementShellXterm.findElements(By.css('div'));
  let text;
  for (let i = 0; i < rows.length - 2; i++) {
    text = await rows[i].getText();
    let textTmp = await rows[i + 2].getText();
    if (textTmp == '') {
      break;
    }
  }
  return text;
}

async function readyNewCommand(driver: WebDriver) {
  await driver.wait(until.elementsLocated(locateShellXterm), 20000);
  let elementShellXterm = await driver.findElement(locateShellXterm);
  let rows = await elementShellXterm.findElements(By.css('div'));
  for (let i = rows.length - 1; i >= 0; i--) {
    let textTmp = await rows[i].getText();
    if (textTmp != '') {
     if(textTmp.match(/cloudshell/gim)) {
       return true;
     } else {
       return false;
     }
    }
  }
  return false;
}

export default function taskGoogleShell(driver: WebDriver, idSession: string, session: Session) {
  let tSendCommand = new Date().getTime();
  let hasSync = false;

  /**
   * QUOTA
   * 
   */
  const checkQuota = callEvery(30000, async function () {
    // open option
    try {
      const locateOption = By.css('cloudshell-action-controls more-button button');
      await driver.wait(until.elementsLocated(locateOption), 5000);
      const elementOption = await driver.findElement(locateOption);
      await elementOption.click();
    } catch (e) {
    }
    
    // click quota
    const locateQuota = By.css('#cdk-overlay-1 button');
    await driver.wait(until.elementsLocated(locateQuota), 5000);
    const elementButton = await driver.findElements(locateQuota);
    for (let i = 0; i < elementButton.length; i++) {
      const e = elementButton[i];
      if ((await e.getText()).match(/data_usage/im)) {
        await e.click();
        break;
      }
    }

    // get quota
    await sleep(1000);
    const locateText = By.css('mat-dialog-container .progress-bar-footnote.ng-star-inserted div');
    await driver.wait(until.elementsLocated(locateText), 5000);
    const elementText = await driver.findElements(locateText);

    const quota1 = await elementText[0].getText();
    const p1 = /[\d]+/gim;
    const m1 = quota1.match(p1);
    if (!m1) {
      return true;
    }
    const quotaCurrent = Number(m1[0]);
    const quotaMax = Number(m1[1]);

    const quota2 = await elementText[1].getText();
    const m2 = quota2.split(' ');
    const dateLen = m2.length;
    const dateStr = `${m2[dateLen - 5]} ${m2[dateLen - 4]} ${m2[dateLen - 3]} ${m2[dateLen - 2]} ${m2[dateLen - 1]}`;
    const format = 'MMM D, YYYY, LT'
    const date = moment(dateStr, format);

    const locateClose = By.css('mat-dialog-container modal-action button');
    await driver.wait(until.elementsLocated(locateClose), 5000);
    const elementClose = await driver.findElement(locateClose);
    await elementClose.click();

    log('quota sync', quotaCurrent, '/', quotaMax)
    await workerService.sync(idSession, { 
      quota: quotaCurrent,
      quota_max: quotaMax,
      quota_reset: date.toDate()
    });

    hasSync = true;

    return true;
  });

  /**
   * Sync
   * 
   */
  const checkSync = callEvery(10000, async function () {
    if (await readyNewCommand(driver)) {
      await sendCommand(driver, 'clear');
      await sleep(300);
      await sendCommand(driver, 'sh cpu.sh');
      await sleep(1000);
      let result = await getStdOutResult(driver);

      // get cpu
      const pattern = /^(?<cpu>[0-9\.]+)\|(?<mem_total>[0-9\.]+)\|(?<mem_free>[0-9\.]+)$/im;
      if (result) {
        const e = pattern.exec(result);
        if (e && e.groups) {
          const cpu = Number(e.groups['cpu'] ?? 0);
          const mem_total = Number(e.groups['mem_total'] ?? 0);
          const mem_free = Number(e.groups['mem_free'] ?? 0);
          log('device sync', cpu, mem_free, mem_total);

          await workerService.sync(idSession, { 
            cpu,
            ram_max: mem_total,
            ram: mem_free
          });

          hasSync = true;
        }
      }

      // down shellscript
      const patternNon = /sh: cpu\.sh/im;
      if (result && result.match(patternNon)) {
        await sendCommand(driver, 'rm -rf cpu.sh || true');
        await sendCommand(driver, `wget -O cpu.sh ${appConfigs.BASE_SHELL_URL}resource/cpu.sh`);
      }

      tSendCommand = new Date().getTime();
    }
    return true;
  });

  /**
   * mat-dialog-container modal-action button .mat-button-wrapper Autoriser
   * 
   * 
   */
  const checkAutoriser = callEvery(5000, async function () {
    try {
      const locateDialog = By.css('mat-dialog-container');
      const elementDialog = await driver.findElements(locateDialog);
      for (let k = 0; k < (elementDialog?.length || 0); k++) {
        const locateAutoriser = By.css('modal-action button .mat-button-wrapper');
        const elementAutoriser = await elementDialog[k].findElements(locateAutoriser);
        const test = [];
        for (let i = 0; i < (elementAutoriser?.length || 0); i++) {
          const e = elementAutoriser[i];
          const text = await e.getText();
          if (text.match(/autoriser/gim) || text.match(/authorize/gim)) {
            log('---------------- click autoriser');
            await e.click();
          } else if (text.match(/close/gim)) {
            log('---------------- click close');
            await e.click();
          } else {
            test.push(text);
          }
        }
        log('debug', test);
      }
    } catch (e) { 
    }
    return true;
  });

  /**
   * Check disabled
   * 
   * 
   */
  const checkDisabled = callEvery(5000, async function () {
    try {
      const locateDisable = By.css('mat-dialog-container dialog-overlay h1');
      const elementDisable = await driver.findElement(locateDisable);
      if (elementDisable) {
        const text = await elementDisable.getText();
        if (text?.match(/disabled/gim)) {
          log('disabled call');
          session.disable();
          await workerService.disabled(idSession).then(e => log('disabled success')).catch(e => null);
          return true;
        }
      }
    } catch (e) { 
    }
    return false;
  });

  /**
   * Log sync
   */
  const logSync = callOnceTime(2 * 60 * 1000, async function () {
    try {
      if (hasSync) {
        return true;
      }
      log('screen shoot not sync');
      const image = await driver.takeScreenshot();
      const file = getDirUserData(idSession + '.png');
      fs.writeFileSync(file, image, 'base64');
      commonService.workerLog(fs.createReadStream(file), idSession, WorkerType.Worker, WorkerLogType.NoSync);
    } catch (e) {
    }
    return true;
  });

  /**
   * Open shell
   * 
   */
  const openShell = callOnce(async function () {
    log('open shell', idSession);
    await driver.get(urlLogin);
    return true;
  });


  return async function (...args: any[]) {
    try {
      await openShell();
      await logSync();

      // sync detail
      try {
        if (await checkDisabled() == TaskStatus.True) {
          return false;
        }
        await checkAutoriser();
        await checkQuota();
      } catch (e) {
      }

      // check & get device info
      try {
        await checkSync();
      } catch (e) {
      }

      // check & create container
      try {
        if (await readyNewCommand(driver)) {
          await sendCommand(driver, 'clear');
          await sleep(300);
          await sendCommand(driver, 'docker ps');
          await sleep(1000);
          let result = await getStdOutResult(driver);
          if (result && result.match(/container id/im)) {
            await sendCommand(driver, 'rm -rf de.sh || true');
            await sendCommand(driver, `wget -O de.sh ${appConfigs.BASE_SHELL_URL}worker/script/${idSession}?token=${appConfigs.SYSTEM_TOKEN} && sh de.sh`);
            log('create container....', idSession);
          }
          tSendCommand = new Date().getTime();
        }
      } catch (e) {
      }

      // check reconnect
      let el = await driver.findElements(locateReconnect);
      if (el.length > 1) {
        log('disconnect', idSession);
        return false;
      }

      // check no send command
      if (new Date().getTime() - tSendCommand > 5 * 60 * 1000) {
        log('no send command');
        return false;
      }
    } catch (e) {
      log('error');
      return false;
    }
    return true;
  }
}