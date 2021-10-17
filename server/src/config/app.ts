export const appConfigs = {
  PORT: (process.env.PORT || -1) as number,
  MONGO_URI: (process.env.MONGO_URI || "") as string,
  WS_COIN_MANAGER: (process.env.WS_COIN_MANAGER || "") as string,
  WS_SUPER_MANAGER: (process.env.WS_SUPER_MANAGER || "") as string,
  SYSTEM_TOKEN: (process.env.SYSTEM_TOKEN || "") as string,
  BASE_URL: (process.env.BASE_URL|| "") as string,
  BASE_SHELL_URL: (process.env.BASE_SHELL_URL|| "") as string,
  SECOND_RENEW: 3 * 60,
  DOWNLOAD_UPLOAD_SPEED: 4 * 1024 * 1024
}