import { WorkerStatus, WorkerType } from '../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import ModelWorker, { IWorker, IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import fs from 'fs';
import { appConfigs } from '../../config/app';
import { getResourcePath } from '../../helpers/dir';

export default async function coinProfileUpload(req: Request, res: Response) {
  const id = req.params.id;
  const model = await ModelWorker.findOne({ _id: new Types.ObjectId(id), type: WorkerType.CoinManager });
  if (model) {
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldName, file, filename) {
      // clone
      const folderRe = getResourcePath("profile", "re");
      const pathRe = getResourcePath("profile", "re", id + ".zip");
      const path = getResourcePath("profile", id + ".zip");
      if (!fs.existsSync(folderRe)) {
        fs.mkdirSync(folderRe)
      }
      if (fs.existsSync(path)) {
        fs.copyFileSync(path, pathRe);
      }

      // upload
      const stream = fs.createWriteStream(path);
      file.pipe(stream);
      stream
        .on('close', function () {    
          res.json({
            status: true
          })
        })
        .on('error', function () {
          res.json({
            status: false
          })
        })
    }).on('error', function () {
      res.json({
        status: false
      })
    });
  }
}