import { WebDriver } from "selenium-webdriver";

export default class Session {
  driver!: WebDriver;

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
    return true;
  }

  private async downloadDataProfile() {
  }

  private async uploadDataProfile() {
  }
}