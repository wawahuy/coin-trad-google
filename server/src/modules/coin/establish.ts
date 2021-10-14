import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';
import ModelHistoryConnect from '../../models/schema/history_connect';
import { HistoryConnectType } from '../../models/history_connect';

export default async function coinEstablish(req: Request, res: Response) {
  const id = req.body.id;
  const filter: FilterQuery<IWorkerDocument> = {
    _id: new Types.ObjectId(id),
    type: WorkerType.CoinManager,
    $and: [
      {
        status: {
          $ne: WorkerStatus.Checkpoint as number
        }
      },
      {
        status: {
          $ne: WorkerStatus.Disabled as number
        }
      },
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

  const parent = await ModelWorker.findOne({
    _id: new Types.ObjectId(req.body.parent)
  }); 
  const model = await ModelWorker.findOne(filter);
  if (model && parent) {
    // get max position login
    const modelPosition = await ModelWorker.aggregate([
      {
        $group: {
          _id: "$type",
          max: {
            $max: "$login_position"
          }
        }
      },
      {
        $match: {
          _id: WorkerType.CoinManager
        }
      }
    ]);
    const position = modelPosition?.[0]?.max || 1;

    // add log
    await ModelHistoryConnect.insertMany([
      {
        from: parent._id,
        child: model._id,
        type: HistoryConnectType.Establish,
        type_worker: WorkerType.CoinManager,
        login_position: position + 1
      }
    ]);

    // update
    let data: UpdateQuery<IWorkerDocument> = {
      $set: {
        parent: parent._id,
        sync_date: moment().toDate(),
        status: WorkerStatus.Running,
        login_position: position + 1
      }
    };
    await ModelWorker.updateOne({ _id: new Types.ObjectId(id) }, data);
    model.log = undefined;
    model.login_position = position + 1;
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