export enum EWsCommandBase {
  JOIN_GROUP = 'db1',
  LEAVE_GROUP = 'db2',
  CLOSE = 'db3',
  ERROR = 'db4'
}

export default interface WsCommand<T> {
  c: T | EWsCommandBase,
  d?: any
}