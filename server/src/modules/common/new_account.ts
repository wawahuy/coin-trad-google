import { WorkerStatus, WorkerType } from './../../models/worker';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import ModelWorker, { IWorkerDocument } from '../../models/schema/worker';
import moment from 'moment';
import { appConfigs } from '../../config/app';
import fs from 'fs';
import { getResourcePath } from '../../helpers/dir';

export default async function commonUpAccount(req: Request, res: Response) {
  const formData = new Map();
  const fileTemp = getResourcePath("profile", '_' + uuidv4());

  req.pipe(req.busboy);
  
  req.busboy.on('field', function(fName, val) {
    formData.set(fName, val);
  });

  req.busboy.on('file', function (fieldName, file, filename) {
    const stream = fs.createWriteStream(fileTemp);
    file.pipe(stream);
    stream.on('error', function () {
      req.busboy.end();
      res.json({
        status: false
      });
    })
  });
  
  req.busboy.on('error', function () {
    fs.rmSync(fileTemp);
    res.json({
      status: false
    })
  });

  req.busboy.on("finish", async function() {
    await ModelWorker.updateOne(
      { email: formData.get('user') },
      { 
        email: formData.get('user'),
        password: formData.get('pass'),
        type: formData.get('type')
      },
      { upsert: true}
    );

    const m = await ModelWorker.findOne({ email: formData.get('user') });
    if (!m) {
      fs.rmSync(fileTemp);
      res.json({ status: false });
      return;
    }

    const fileReal = getResourcePath("profile", m._id.toString() + ".zip");
    fs.renameSync(fileTemp, fileReal);
    res.json({
      status: true
    });
  });
}