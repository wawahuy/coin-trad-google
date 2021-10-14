import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';
import ModelHistoryConnect from '../../models/schema/history_connect';
import { HistoryConnectType } from '../../models/history_connect';

export default async function coinClose(req: Request, res: Response) {
  const id = req.body.id;
  const model = await ModelWorker.findOne({ 
    _id: new Types.ObjectId(id),
    parent: new Types.ObjectId(req.body.parent),
    type: WorkerType.CoinManager
  });
  if (model) {
    // add log
    await ModelHistoryConnect.insertMany([
      {
        from: model.parent,
        child: model._id,
        type: HistoryConnectType.Close,
        type_worker: WorkerType.CoinManager
      }
    ]);

    let data: UpdateQuery<IWorkerDocument> = {
      $set: {
        status: WorkerStatus.Idle
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