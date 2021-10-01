export function callEvery(time: number, callback: (...args: any[]) => Promise<boolean>) {
  let t = new Date().getTime() - time;

  return async function (...args: any[]) {
    let tC = new Date().getTime();
    let result;
    if (tC - t >= time) {
      result = await callback(...args);
      t = tC;
    }
    return result;
  }
}