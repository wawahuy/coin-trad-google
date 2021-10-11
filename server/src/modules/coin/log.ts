import { WorkerStatus, WorkerType } from '../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';

export default async function coinLog(req: Request, res: Response) {
  const id = req.body.id;
  const d = req.body.d;
  const model = await ModelWorker.findOne({ _id: new Types.ObjectId(id), type: WorkerType.CoinManager });
  if (model) {
    let data: UpdateQuery<IWorkerDocument> = {
      $set: {
        log: d,
        sync_date: moment().toDate()
      },
    };
    await ModelWorker.updateOne({ _id: new Types.ObjectId(id), type: WorkerType.CoinManager }, data);
    model.log = undefined;
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