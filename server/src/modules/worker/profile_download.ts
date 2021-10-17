import { WorkerStatus, WorkerType } from '../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import fs from 'fs';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';
import { getResourcePath } from '../../helpers/dir';
import { limitGlobalSpeed } from '../../helpers/limit';


export default async function workerProfileDownload(req: Request, res: Response) {
  const id = req.params.id;
  const model = await ModelWorker.findOne({ _id: new Types.ObjectId(id), type: WorkerType.Worker });
  if (model) {
    const path = getResourcePath("profile", id + ".zip");
    if (fs.existsSync(path)) {
      fs.createReadStream(path).pipe(limitGlobalSpeed()).pipe(res);
      return;
    }
  }
  res.status(404).send('Not Found');
}