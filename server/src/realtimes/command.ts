export enum EWsCommandBase {
  JOIN_GROUP = 'join_group',
  LEAVE_GROUP = 'leave_group',
  CLOSE = 'close',
  ERROR = 'error'
}

export default interface WsCommand<T> {
  c: T | EWsCommandBase,
  d?: any
}