export const appConfigs = {
  PORT: (process.env.PORT || -1) as number,
  MONGO_URI: (process.env.MONGO_URI || "") as string,
  WS_COIN_MANAGER: (process.env.WS_COIN_MANAGER || "") as string,
  WS_SUPER_MANAGER: (process.env.WS_SUPER_MANAGER || "") as string,
  SYSTEM_TOKEN: (process.env.SYSTEM_TOKEN || "") as string
}