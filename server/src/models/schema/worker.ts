import moment from 'moment';
import Mongoose, { Document, Model, Schema } from 'mongoose';
import { WorkerStatus, WorkerType } from '../worker';

/***
 * Declare Schema
 */
 export interface IWorker {
  email?: string;
  password?: string;
  profile_data?: string;
  thread?: number;
  type?: WorkerType;
  status?: WorkerStatus;
  worker_max?: number;
  quota?: number;
  quota_max?: number;
  quota_reset?: Date | null;
  cpu?: number;
  cpu_max?: number;
  ram?: number;
  ram_max?: number;
  sync_date?: Date | null;
  login_position?: number;
  log?: string;
}

export interface IWorkerDocument extends Document, IWorker {
}

export interface IWorkerModal extends Model<IWorkerDocument> {
  test(): void;
  getFullUrl(): string;
}

const WorkerSchema = new Schema<IWorkerDocument, IWorkerModal>(
  {
    email: { type: Schema.Types.String, index: true },
    password: { type: Schema.Types.String },
    profile_data: { type: Schema.Types.String },
    thread: { type: Schema.Types.Number, default: 1 },
    type: { type: Schema.Types.Number, index: true },
    status: { type: Schema.Types.Number, default: WorkerStatus.Idle, index: true },
    worker_max: { type: Schema.Types.Number, default: 5 },
    quota: { type: Schema.Types.Number, default: 0 },
    quota_max: { type: Schema.Types.Number, default: 0 },
    quota_reset: { type: Schema.Types.Date, index: true },
    cpu: { type: Schema.Types.Number, default: 0 },
    cpu_max: { type: Schema.Types.Number, default: 0 },
    ram: { type: Schema.Types.Number, default: 0 },
    ram_max: { type: Schema.Types.Number, default: 0 },
    sync_date: { type: Schema.Types.Date, index: true },
    login_position: { type: Schema.Types.Number, index: true, default: 0 },
    log: { type: Schema.Types.String }
  },
  { timestamps: true }
);

const ModelWorker = Mongoose.model<IWorkerDocument, IWorkerModal>(
  'worker',
  WorkerSchema
);

export default ModelWorker;
