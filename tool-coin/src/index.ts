import chrome from "selenium-webdriver/chrome";
import { getBinPath, getDirUserData } from "./helper/dir";
import main from "./main";

// http://chromedriver.storage.googleapis.com/index.html
// set service
let isWin = process.platform === "win32";
let pathDrive = getBinPath(isWin ? 'window': 'linux', 'chromedriver' + (isWin ? '.exe' : ''));
let service = new chrome.ServiceBuilder(pathDrive).build();
chrome.setDefaultService(service);

main();

(async function init() {
  
  // let option = new chrome.Options();
  // option.addArguments("--user-data-dir=" + getDirUserData());
  // if (!isWin) {
  //   option.addArguments('disable-dev-shm-usage');
  // }

  // let driver = await new Builder()
  //       .setChromeOptions(option)
  //       .forBrowser("chrome")
  //       .build();

  // try {
  //   if (await taskIsLogin(driver)) {
  //     await taskGoogleShell(driver);      
  //   } else {
  //     // await taskLogin(driver, "train123yuh", "adadad1999");
  //   }
  // } finally {
  //   setTimeout(async function () {
  //     await driver.quit();
  //   }, 5000);
  // }
})();
