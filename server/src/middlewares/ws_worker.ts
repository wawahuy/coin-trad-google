import express, { Request, Response, NextFunction } from 'express';
import url from 'url';
import { appConfigs } from '../config/app';

export const wsWorkerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const u = url.parse(req.url);
  const p = new RegExp('token=' + appConfigs.SYSTEM_TOKEN, "im");
  if (u.query?.match(p)) {
    return next();
  }
  res.destroy();
}
