import { HistoryConnectType } from './../history_connect';
import moment from 'moment';
import Mongoose, { Document, Model, ObjectId, Schema } from 'mongoose';
import { WorkerStatus, WorkerType } from '../worker';
import { WorkerLogType } from '../worker_log';

/***
 * Declare Schema
 */
export interface IWorkerLog {
  worker_id?: any;
  worker_type?: WorkerType;
  log_type?: WorkerLogType
  filename?: string
}

export interface IWorkerLogDocument extends Document, IWorkerLog {
}

export interface IWorkerLogModal extends Model<IWorkerLogDocument> {
  test(): void;
}

const WorkerLogSchema = new Schema<IWorkerLogDocument, IWorkerLogModal>(
  {
    worker_id: { type: Schema.Types.ObjectId, index: true },
    worker_type: { type: Schema.Types.Number, index: true },
    log_type: { type: Schema.Types.Number, index: true },
    filename: { type: Schema.Types.String },
  },
  { timestamps: true }
);

const ModelWorkerLog = Mongoose.model<IWorkerLogDocument, IWorkerLogModal>(
  'worker_log',
  WorkerLogSchema
);

export default ModelWorkerLog;
