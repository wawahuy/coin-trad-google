import moment from 'moment';
export async function sleep(s: number) {
  return new Promise(res => setTimeout(res, s));
}

export const logContext: string[] = [];

export function log(...args: any[]) {
  const t = '[' + moment().format('DD-MM-YYYY HH:mm:ss') + ']';
  console.log(t , ...args);

  // save log
  const argsText = args?.map(it => it?.toString());
  logContext.push([t, argsText].join(' '));
  if (logContext.length > 20) {
    logContext.splice(0, 1);
  }
}