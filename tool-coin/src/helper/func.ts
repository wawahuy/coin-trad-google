import moment from 'moment';
export async function sleep(s: number) {
  return new Promise(res => setTimeout(res, s));
}

export function log(...args: any) {
  console.log('[' + moment().format('DD-MM-YYYY HH:mm:ss') + ']', ...args);
}