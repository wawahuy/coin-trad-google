import { WorkerStatus, WorkerType } from '../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import ModelWorker, { IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';
import fs from 'fs';
import { getResourcePath } from '../../helpers/dir';
import ModelWorkerLog from '../../models/schema/worker_log';

export default async function commonWorkerLog(req: Request, res: Response) {
  const formData = new Map();
  const fileName = uuidv4() + ".png";
  const filePath = getResourcePath("image", fileName);

  if (!fs.existsSync(getResourcePath("image"))) {
    fs.mkdirSync(getResourcePath("image"));
  }

  req.pipe(req.busboy);
  
  req.busboy.on('field', function(fName, val) {
    formData.set(fName, val);
  });

  req.busboy.on('file', function (fieldName, file, filename) {
    const stream = fs.createWriteStream(filePath);
    file.pipe(stream);
    stream.on('error', function (e) {
      req.busboy.end();
      res.json({
        status: false
      });
    })
  });
  
  req.busboy.on('error', function () {
    fs.rmSync(filePath);
    res.json({
      status: false
    })
  });

  req.busboy.on("finish", async function() {
    await ModelWorkerLog.insertMany([
      {
        worker_id: new Types.ObjectId(formData.get('worker_id')),
        worker_type: formData.get('worker_type'),
        log_type: formData.get('log_type'),
        filename: fileName
      }
    ])

    res.json({
      status: true
    });
  });
}