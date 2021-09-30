import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';

export default async function workerClose(req: Request, res: Response) {
  const id = req.body.id;
  const model = await ModelWorker.findOne({ _id: new Types.ObjectId(id), type: WorkerType.Worker });
  if (model) {
    let data: UpdateQuery<IWorkerDocument> = {
      $set: {
        status: WorkerStatus.Idle
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