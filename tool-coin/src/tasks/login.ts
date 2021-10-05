import { By, Key, until, WebDriver } from "selenium-webdriver";
import { sleep } from "../helper/func";

const urlLogin = "https://accounts.google.com/signin/v2/identifier";


export default async function taskLogin(driver: WebDriver, username: string, password: string) {
  await driver.get(urlLogin);
  await sleep(1000);

  // email
  let locateEmail = By.id('identifierId');
  await driver.wait(until.elementsLocated(locateEmail), 20000);
  let elementEmail = await driver.findElement(locateEmail);
  elementEmail.sendKeys(username, Key.ENTER);
  await sleep(1000);

  // password
  let locatePassword = By.css('input[name="password"]');
  await driver.wait(until.elementsLocated(locatePassword), 20000);
  let elementPassword = await driver.findElement(locatePassword);
  elementPassword.sendKeys(password, Key.ENTER);
}