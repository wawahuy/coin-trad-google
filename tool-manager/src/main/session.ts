import { WebDriver } from "selenium-webdriver";
import * as workerService from '../services/worker';

export default class Session {
  driver!: WebDriver;

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
    const establish = await workerService.establish(this.userId).catch(e => null);
    const establishData = <any>establish?.data;
    if (!establishData?.status) {
      return false;
    }

    await this.downloadDataProfile();
    return true;
  }

  private async downloadDataProfile() {
  }

  private async uploadDataProfile() {
  }

  private async mainLoop() {

  }
}