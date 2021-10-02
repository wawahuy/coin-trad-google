
import moment from "moment";
import { By, Key, until, WebDriver } from "selenium-webdriver";
import { appConfigs } from "../config/app";
import { sleep } from "../helper/func";
import { callEvery } from "../helper/task";
import * as workerService from '../services/worker';

const urlLogin = "https://shell.cloud.google.com/";
const locateShellTextarea = By.className('xterm-helper-textarea');
const locateShellXterm = By.css('.xterm-screen .xterm-rows');
const locateReconnect = By.css('status-message button');

async function sendCommand(driver: WebDriver, command: string) {
  await driver.wait(until.elementsLocated(locateShellTextarea), 20000);
  let elementShellTextarea = await driver.findElement(locateShellTextarea);
  elementShellTextarea.sendKeys(command, Key.ENTER);
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

export default async function taskGoogleShell(driver: WebDriver, idSession: string) {
  /**
   * QUOTA
   * 
   */
  let checkQuota = callEvery(30000, async function () {
    // open option
    const locateOption = By.css('cloudshell-action-controls more-button button');
    await driver.wait(until.elementsLocated(locateOption), 5000);
    const elementOption = await driver.findElement(locateOption);
    elementOption.click();
    
    // click quota
    const locateQuota = By.css('#cdk-overlay-1 button');
    await driver.wait(until.elementsLocated(locateQuota), 5000);
    const elementButton = await driver.findElements(locateQuota);
    for (let i = 0; i < elementButton.length; i++) {
      const e = elementButton[i];
      if ((await e.getText()).match(/data_usage/im)) {
        e.click();
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
    elementClose.click();

    workerService.sync(idSession, { 
      quota: quotaCurrent,
      quota_max: quotaMax,
      quota_reset: date.toDate()
    });

    return true;
  });

  /**
   * Sync
   * 
   */
  let checkSync = callEvery(10000, async function () {
    workerService.sync(idSession, {});
    return true;
  });

  try {
    await driver.get(urlLogin);
    let result;
    let i = 2;
    while (true) {
      try {
        await checkQuota();
        await checkSync();
      } catch (e) {
      }

      // check create container
      if (await readyNewCommand(driver)) {
        await sendCommand(driver, 'clear');
        await sleep(500);
        await sendCommand(driver, 'docker ps');
        await sleep(1000);
        result = await getStdOutResult(driver);
        if (result && result.match(/container id/im)) {
          await sendCommand(driver, 'rm -rf de.sh || true');
          await sendCommand(driver, `wget -O de.sh ${appConfigs.BASE_SHELL_URL}worker/script/${idSession}?token=${appConfigs.SYSTEM_TOKEN} && sh de.sh`);
        }
      }

      // check reconnect
      let el = await driver.findElements(locateReconnect);
      if (el.length > 1) {
        console.log('disconnect');
        break;
      }
      await sleep(5000);
    }
  } catch (e) {
    console.log(e);
  }
}