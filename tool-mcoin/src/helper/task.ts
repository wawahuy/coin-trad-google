export type funcCall = (...args: any[]) => Promise<TaskStatus>;

export enum TaskStatus {
  True,
  False,
  Idle
}

export function callEvery(time: number, callback: (...args: any[]) => Promise<boolean>) {
  let t = new Date().getTime() - time;

  return async function (...args: any[]) {
    let tC = new Date().getTime();
    let result = TaskStatus.Idle;
    if (tC - t >= time) {
      if(await callback(...args)) {
        result = TaskStatus.True;
      } else {
        result = TaskStatus.False;
      }
      t = tC;
    }
    return result;
  }
}

export function callOnce(callback: (...args: any[]) => Promise<boolean>) {
  let call = true;
  return async function (...args: any[]) {
    if (call) {
      call = false;
      if (await callback(...args)) {
        return TaskStatus.True;
      } else {
        return TaskStatus.False;
      }
    } else {
      return TaskStatus.Idle;
    }
  }
}

export function callOnceTime(time: number, callback: (...args: any[]) => Promise<boolean>) {
  let call = true;
  let t = new Date().getTime();
  return async function (...args: any[]) {
    if (call) {
      let tC = new Date().getTime();
      if (tC - t < time) {
        return TaskStatus.Idle;
      }
      call = false;
      if (await callback(...args)) {
        return TaskStatus.True;
      } else {
        return TaskStatus.False;
      }
    } else {
      return TaskStatus.Idle;
    }
  }
}
