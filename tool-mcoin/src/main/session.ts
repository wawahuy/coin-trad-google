import { callEvery, funcCall, TaskStatus } from './../helper/task';
import chrome from 'selenium-webdriver/chrome';
import { Builder, WebDriver } from "selenium-webdriver";
import fs from 'fs';
import unzipper from 'unzipper';
import path from 'path';
import archiver from 'archiver';
import rimraf from 'rimraf';
import { IWorker } from './../models/worker';
import { getDirUserData } from "../helper/dir";
import * as coinService from '../services/coin';
import taskIsLogin from '../tasks/is_login';
import taskGoogleShell from '../tasks/google_shell';
import { log, sleep } from '../helper/func';
import { SessionStatus } from '../models/session';
import { context } from './context';

export default class Session {
  readonly postfixProfile = 'google-chrome';
  readonly timeAutoClose = 6 * 60 * 60 * 1000;
  driver!: WebDriver;
  data!: IWorker;
  pathProfile!: string;
  funcTaskGoogleShell!: funcCall;
  timeStart!: number;
  disabled: boolean = false;

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

  disable() {
    this.disabled = true;
  }

  private async init() {
    this.pathProfile = getDirUserData(this.userId);

    const establish = await coinService.establish(this.userId, context.id || "").catch(e => null);
    const establishData = <any>establish?.data;
    if (!establishData?.status) {
      return false;
    }

    if (!await this.downloadDataProfile()) {
      return false;
    }

    this.data = establishData.data;

    const option = new chrome.Options();
    const profile = path.join(this.pathProfile, this.postfixProfile);
    const isWin = process.platform === "win32";
    option.addArguments('--user-data-dir=' + profile);
    option.addArguments('disable-notifications');
    option.addArguments('disable-popup-blocking');
    option.addArguments('disable-infobars');
    if (!isWin) {
      option.addArguments('disable-dev-shm-usage');
      option.addArguments('headless');
      option.addArguments('disable-gpu');
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
      let tr = 3;
      while (tr-- > 0) {
        try {
          rimraf.sync(this.pathProfile);
          tr = -1;
        } catch (e) {
          log('No remove profile');
          sleep(100);
        }
      }

      if (fs.existsSync(this.pathProfile)) {
        return false;
      }
    }
    fs.mkdirSync(this.pathProfile, { recursive: true });

    // make download
    try {
      const p = this.pathProfile;
      await coinService.downloadProfile(this.userId).then(async function (response) {
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
    const upload = await coinService.uploadProfile(this.userId, fs.createReadStream(p)).catch(r => null);
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
        this.funcTaskGoogleShell = callEvery(10000, taskGoogleShell(this.driver, this.userId, this));
        this.timeStart = new Date().getTime();
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
      // auto close
      // if (new Date().getTime() - this.timeStart > this.timeAutoClose) {
      //   return SessionStatus.Cancel;
      // }

      // task
      const result = await this.funcTaskGoogleShell();
      if (result == TaskStatus.False) {
        return SessionStatus.Cancel;
      }
      return SessionStatus.Next;
    } catch {
      return SessionStatus.Error;
    }
  }

  /**
   * Call close session
   */
  public async asyncClose(save = true) {
    try {
      //await this.driver.get('https://zayuh.me');
      //await this.driver.switchTo().alert().accept();
      await sleep(100);
      await this.driver.close();
      // await this.driver.quit();
    } catch (e) {
      console.log(e);
    }

    if (save && !this.disabled) {
      await coinService.close(this.userId , context.id || "", this.data?.login_position || 0).catch(e => null);
      const isWin = process.platform === "win32";
      if (isWin) {
        if (await this.uploadDataProfile().catch(e => null)) {
          log('upload new data', this.userId);
        }
      }
    }
  }
}