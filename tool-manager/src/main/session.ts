import { context } from './context';
import chrome from 'selenium-webdriver/chrome';
import { IWorker } from './../models/worker';
import { Builder, WebDriver } from "selenium-webdriver";
import fs, { createReadStream, createWriteStream } from 'fs';
import * as stream from 'stream';
import StreamZip from 'node-stream-zip';
import unzipper from 'unzipper';
import { promisify } from 'util';
import path from 'path';
import archiver from 'archiver';
import { getDirUserData } from "../helper/dir";
import * as workerService from '../services/worker';
import taskIsLogin from '../tasks/is_login';
import taskGoogleShell from '../tasks/google_shell';

export default class Session {
  readonly postfixProfile = 'google-chrome';
  driver!: WebDriver;
  data!: IWorker;
  pathProfile!: string;

  private constructor(
    private userId: string
  ) {
  }

  static async build(userId: string) {
    const session = new Session(userId);
    if (await session.init()) {
      session.mainLoop();
      return session;
    }
    return false;
  }

  private async init() {
    this.pathProfile = getDirUserData(this.userId);

    const establish = await workerService.establish(this.userId).catch(e => null);
    const establishData = <any>establish?.data;
    if (!establishData?.status) {
      return false;
    }

    if (!await this.downloadDataProfile()) {
      return false;
    }
    
    const option = new chrome.Options();
    const profile = path.join(this.pathProfile, this.postfixProfile);
    const isWin = process.platform === "win32";
    option.addArguments("--user-data-dir=" + profile);
    if (!isWin) {
      option.addArguments('disable-dev-shm-usage');
    }

    this.driver = await new Builder()
          .setChromeOptions(option)
          .forBrowser("chrome")
          .build();

    return true;
  }

  private async downloadDataProfile() {
    // make folder
    if (fs.existsSync(this.pathProfile)) {
      fs.rmdirSync(this.pathProfile, { recursive: true });
    }
    fs.mkdirSync(this.pathProfile, { recursive: true });

    // make download
    try {
      const p = this.pathProfile;
      await workerService.downloadProfile(this.userId).then(async function (response) {
        const data = <any>response.data;
        return data.pipe(unzipper.Extract({ path: p })).promise();
      });
    } catch (e) {
      console.log('download profile failed!');
      return false;
    }

    return true;
  }

  private async zipProfile() {
    return new Promise((resolve, reject) => {
      let output = fs.createWriteStream(path.join(this.pathProfile, 'new'));
      let archive = archiver('zip');

      output.on('close', function () {
        console.log('zip success');
        resolve(true);
      });

      archive.on('error', function(e){
        reject(e);
      });

      archive.pipe(output);
      archive.directory(path.join(this.pathProfile, this.postfixProfile), this.postfixProfile);
      archive.finalize();
    });
  }

  private async uploadDataProfile() {
    try {
      await this.zipProfile();
    } catch (e) {
      return false;
    }

    const p = path.join(this.pathProfile, 'new');
    const upload = await workerService.uploadProfile(this.userId, fs.createReadStream(p)).catch(r => null);
    const uploadData = <any>upload?.data;
    return uploadData?.status;
  }

  private async mainLoop() {
    if (await taskIsLogin(this.driver)) {
      const status = await taskGoogleShell(this.driver, this.userId);
      await this.driver.quit();
      await workerService.close(this.userId).catch(e => null);
      if (await this.uploadDataProfile()) {
        console.log('upload new data');
      }
    } else {
      workerService.checkpoint(this.userId);
    }

    context.sessions = context.sessions.filter(s => s != this);
  }
}