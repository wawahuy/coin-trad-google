import { IWorker } from './../models/worker';
import Session from './session';

export const context: {
  id?: string;
  mainDetail?: IWorker;
  sessions: Session[];
} = {
  sessions: []
};