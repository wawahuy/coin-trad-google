import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';

export default async function workerEstablish(req: Request, res: Response) {
  const id = req.body.id;
  const filter: FilterQuery<IWorkerDocument> = {
    _id: new Types.ObjectId(id),
    type: WorkerType.Worker,
    $and: [
      {
        $or: [
          {
            status: WorkerStatus.Idle as number
          },
          {
            status: WorkerStatus.Running as number,
            sync_date: {
              $lt: moment().subtract(appConfigs.SECOND_RENEW, 'seconds').toDate()
            }
          }
        ]
      },
      {
        $or: [
          { 
            quota: 0,
            quota_max: 0
          },
          {
            $expr: {
              $lt: ["$quota", "$quota_max"]
            }
          },
          {
            quota_reset: {
              $lt: moment().toDate()
            }
          }
        ]
      }
    ]
  };

  const model = await ModelWorker.findOne(filter);
  if (model) {
    let data: UpdateQuery<IWorkerDocument> = {
      $set: {
        sync_date: moment().toDate(),
        status: WorkerStatus.Running
      },
      $inc: {
        login_position: 1
      }
    };
    await ModelWorker.updateOne({ _id: new Types.ObjectId(id) }, data);
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