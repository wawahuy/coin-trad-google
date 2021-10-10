import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import fs from 'fs';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';
import { getResourcePath } from '../../helpers/dir';

export default async function workerScript(req: Request, res: Response) {
  // const id = req.params.id;
  // const path = getResourcePath("coin.sh");
  // if (fs.existsSync(path)) {
  //   let content = fs.readFileSync(path).toString('utf-8');
  //   content = content.replace(/!!__URL__!!/gim, appConfigs.BASE_SHELL_URL);
  //   content = content.replace(/!!__ID__!!/gim, id);
  //   res.send(content);
  // } else {
  //   res.status(400).send('Not Found');
  // }
}