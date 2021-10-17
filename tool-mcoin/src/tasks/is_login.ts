import { By, Key, until, WebDriver } from "selenium-webdriver";
import { sleep } from "../helper/func";

const urlLogin = "https://myaccount.google.com/";


export default async function taskIsLogin(driver: WebDriver) {
  await driver.get(urlLogin);
  await sleep(1000);

  if ((await driver.getCurrentUrl()).match(/myaccount\.google\.com/gim)) {
    try {
      const locationAvatar = By.css('header div div button figure img');
      await driver.wait(until.elementsLocated(locationAvatar), 5000);
      return true;
    } catch (e) {
    }
  }

  return false;
}