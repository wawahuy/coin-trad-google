import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';

export default async function workerSync(req: Request, res: Response) {
  const id = req.body.id;
  const quota = req.body.quota;
  const quota_max = req.body.quota_max;
  const quota_reset = req.body.quota_reset;
  const model = await ModelWorker.findOne({ _id: new Types.ObjectId(id), type: WorkerType.Worker });
  if (model) {
    let dataNew: IWorker = {};
    if (quota && quota_max && quota_reset) {
      dataNew.quota = quota;
      dataNew.quota_max = quota_max;
      dataNew.quota_reset = moment(quota_reset).toDate();
    }
    
    let data: UpdateQuery<IWorkerDocument> = {
      $set: {
        ...dataNew,
        sync_date: moment().toDate()
      },
    };
    await ModelWorker.updateOne({ _id: new Types.ObjectId(id), type: WorkerType.Worker }, data);
    res.json({
      status: true,
      data: model
    });
  } else {
    res.json({
      status: false
    });
  }
}