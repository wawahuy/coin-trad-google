import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';

export default async function coinSync(req: Request, res: Response) {
  const id = req.body.id?.trim();
  const quota = req.body.quota;
  const quota_max = req.body.quota_max;
  const quota_reset = req.body.quota_reset;
  const cpu = req.body.cpu;
  const ram = req.body.ram;
  const ram_max = req.body.ram_max;
  const model = await ModelWorker.findOne({ _id: new Types.ObjectId(id), type: WorkerType.CoinManager });
  if (model) {
    let dataNew: IWorker = {};
    if (quota && quota_max && quota_reset) {
      dataNew.quota = quota;
      dataNew.quota_max = quota_max;
      dataNew.quota_reset = moment(quota_reset).toDate();
    }

    if (cpu && ram_max && ram) {
      dataNew.cpu = Number(cpu);
      dataNew.ram_max = Number(ram_max);
      dataNew.ram = Number(ram);
    }
    
    let data: UpdateQuery<IWorkerDocument> = {
      $set: {
        ...dataNew,
        sync_date: moment().toDate()
      },
    };
    await ModelWorker.updateOne({ _id: new Types.ObjectId(id), type: WorkerType.CoinManager }, data);
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