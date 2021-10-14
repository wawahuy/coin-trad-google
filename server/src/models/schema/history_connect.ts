import { HistoryConnectType } from './../history_connect';
import moment from 'moment';
import Mongoose, { Document, Model, ObjectId, Schema } from 'mongoose';
import { WorkerStatus, WorkerType } from '../worker';

/***
 * Declare Schema
 */
export interface IHistoryConnect {
  from: ObjectId;
  child: ObjectId;
  type: HistoryConnectType;
  type_worker: WorkerType;
  login_position: number;
}

export interface IHistoryConnectDocument extends Document, IHistoryConnect {
}

export interface IHistoryConnectModal extends Model<IHistoryConnectDocument> {
  test(): void;
}

const HistoryConnectSchema = new Schema<IHistoryConnectDocument, IHistoryConnectModal>(
  {
    from: { type: Schema.Types.ObjectId, index: true },
    child: { type: Schema.Types.ObjectId, index: true },
    type: { type: Schema.Types.Number, index: true },
    type_worker: { type: Schema.Types.Number, index: true },
    login_position: { type: Schema.Types.Number, index: true, default: 0 },
  },
  { timestamps: true }
);

const ModelHistoryConnect = Mongoose.model<IHistoryConnectDocument, IHistoryConnectModal>(
  'history_connect',
  HistoryConnectSchema
);

export default ModelHistoryConnect;
