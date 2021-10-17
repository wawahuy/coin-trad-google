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