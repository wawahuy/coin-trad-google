
import { By, Key, until, WebDriver } from "selenium-webdriver";
import { sleep } from "../helper/func";

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
  if (rows.length > 0) {
    return await rows[rows.length - 2].getText();
  }
  return "";
}

export default async function taskGoogleShell(driver: WebDriver) {
  try {
    await driver.get(urlLogin);
    let result;
    let i = 2;
    while (i-- > 0) {
      // check create container
      await sendCommand(driver, 'docker ps');
      result = await getStdOutResult(driver);
      if (result && result.match(/container id/im)) {
        await sendCommand(driver, 'docker run -it -d ubuntu');
      }
      await sleep(3000);

      // check reconnect
      let el = await driver.findElements(locateReconnect);
      if (el.length > 1) {
        console.log('disconnect');
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
}