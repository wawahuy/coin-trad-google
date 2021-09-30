import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import fs from 'fs';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';
import { getResourcePath } from '../../helpers/dir';

export default async function workerScript(req: Request, res: Response) {
  const path = getResourcePath("coin.sh");
  if (fs.existsSync(path)) {
    res.send(fs.readFileSync(path));
  } else {
    res.status(400).send('Not Found');
  }
}