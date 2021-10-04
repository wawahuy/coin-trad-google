import chrome from 'selenium-webdriver/chrome';
import { Builder, WebDriver } from "selenium-webdriver";
import fs from 'fs';
import unzipper from 'unzipper';
import path from 'path';
import archiver from 'archiver';
import rimraf from 'rimraf';
import { context } from './context';
import { IWorker } from './../models/worker';
import { getDirUserData } from "../helper/dir";
import * as workerService from '../services/worker';
import taskIsLogin from '../tasks/is_login';
import taskGoogleShell from '../tasks/google_shell';
import { log } from '../helper/func';
import { SessionStatus } from '../models/session';

export default class Session {
  readonly postfixProfile = 'google-chrome';
  driver!: WebDriver;
  data!: IWorker;
  pathProfile!: string;

  public get id() {
    return this.userId;
  }

  private constructor(
    private userId: string
  ) {
  }

  static async build(userId: string) {
    const session = new Session(userId);
    if (await session.init()) {
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
      option.addArguments('headless');
      option.addArguments('disable-gpu');
      option.addArguments('disable-notifications');
      option.addArguments('disable-popup-blocking');
      option.addArguments('disable-infobars');
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
      rimraf.sync(this.pathProfile);
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
      log('download profile failed', this.id);
      return false;
    }

    return true;
  }

  private async zipProfile() {
    return new Promise((resolve, reject) => {
      let output = fs.createWriteStream(path.join(this.pathProfile, 'new'));
      let archive = archiver('zip');

      output.on('close', () => {
        log('zip success', this.id);
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

  /**
   * Call when init
   * @returns true - allows call sync loop
   */
  public async asyncInit() {
    try {
      if (await taskIsLogin(this.driver)) {
        return SessionStatus.Next;
      } else {
        return SessionStatus.Cancel;
      }
    } catch (e) {
      return SessionStatus.Error;
    }
  }

  /**
   * Call when tick loop
   * @returns true - allows next tick
   */
  public async asyncLoop() {
    try {
      await this.driver.getTitle();
      return SessionStatus.Next;
    } catch {
      return SessionStatus.Error;
    }
    // return await taskGoogleShell(this.driver, this.userId);
  }

  /**
   * Call close session
   */
  public async asyncClose() {
    try {
      await this.driver.quit()
    } catch (e) {
    }
    const isWin = process.platform === "win32";
    if (isWin) {
      await workerService.close(this.userId).catch(e => null);
      if (await this.uploadDataProfile().catch(e => null)) {
        log('upload new data', this.userId);
      }
    }
  }
}