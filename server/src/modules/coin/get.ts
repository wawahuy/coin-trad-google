import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';

export default async function coinGet(req: Request, res: Response) {
  const filter: FilterQuery<IWorkerDocument> = {
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

  const model = await ModelWorker.aggregate([
    {
      $match: filter
    },
    {
      $sort: {
        status: -1
      }
    },
    {
      $sort: {
        login_position: 1
      }
    },
    {
      $limit: 1
    }
  ]);

  if (model && model.length) {
    res.json({
      status: true,
      data: model[0]._id
    });
  } else {
    res.json({
      status: false
    });
  }
}