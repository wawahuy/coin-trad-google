import moment from "moment";
import chrome from "selenium-webdriver/chrome";
import { getBinPath, getDirUserData } from "./helper/dir";

import * as stream from 'stream';
import StreamZip from 'node-stream-zip';
import { promisify } from 'util';
import { checkpoint, close, downloadProfile, establish, getOne, getScript, sync, uploadProfile } from "./services/worker";
import { createReadStream, createWriteStream } from "fs";
import path from "path";
import main from "./main";

// http://chromedriver.storage.googleapis.com/index.html
// set service
let isWin = process.platform === "win32";
let pathDrive = getBinPath(isWin ? 'window': 'linux', 'chromedriver' + (isWin ? '.exe' : ''));
let service = new chrome.ServiceBuilder(pathDrive).build();
chrome.setDefaultService(service);

main();

(async function init() {
  // getOne().then(c => console.log(c?.data));
  // establish('61555fb26cc812fc20ec2a5f').then(c => console.log(c.data));
  // sync('61555fb26cc812fc20ec2a5f', { quota: 1, quota_max: 50, quota_reset: moment().toDate() }).then(c => console.log(c.data));
  // close('61555fb26cc812fc20ec2a5f').then(c => console.log(c.data));
  // checkpoint('61555fb26cc812fc20ec2a5f').then(c => console.log(c.data));
  // uploadProfile("61555fb26cc812fc20ec2a5f", createReadStream(path.join(__dirname, '61555fb26cc812fc20ec2a5f.zip'))).then(c => {
  //   console.log(c.data);
  // });

  // const finished = promisify(stream.finished);
  // const writer = createWriteStream(p);
  // const p = path.join(__dirname, 'test');
  // downloadProfile('61555fb26cc812fc20ec2a5f').then(async function (response) {
  //   (<any>response.data).pipe(writer);
  //   return finished(writer); //this is a Promise
  // }).then(c => {
  //   const zip = new StreamZip({
  //     file: p
  //   });
  //   zip.on('ready', function () {
  //     console.log('All entries read: ' + zip.entriesCount);
  //   });

  //   zip.on('entry', function (entry) {
  //     var pathname = path.resolve('./temp', entry.name);
  //     if (/\.\./.test(path.relative('./temp', pathname))) {
  //         console.warn("[zip warn]: ignoring maliciously crafted paths in zip file:", entry.name);
  //         return;
  //     }
    
  //     if ('/' === entry.name[entry.name.length - 1]) {
  //       console.log('[DIR]', entry.name);
  //       return;
  //     }
    
  //     console.log('[FILE]', entry.name);
  //     zip.stream(entry.name, function (err, stream) {
  //       if (err || !stream) { console.error('Error:', err.toString()); return; }
    
  //       stream.on('error', function (err) { console.log('[ERROR]', err); return; });
    
  //       // example: print contents to screen
  //       //stream.pipe(process.stdout);
    
  //       // example: save contents to file
  //       fs.mkdir(
  //         path.dirname(pathname),
  //         { recursive: true },
  //         function (err) {
  //           stream.pipe(fs.createWriteStream(pathname));
  //         }
  //       );
  //     });
  //   });
    
  // });
  
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
