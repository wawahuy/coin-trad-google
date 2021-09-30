import express, { Request, Response, NextFunction } from 'express';
import url from 'url';
import { appConfigs } from '../config/app';

export const wsWorkerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const u = url.parse(req.url);
  if (u.query === 'token=' + appConfigs.SYSTEM_TOKEN) {
    return next();
  }
  res.destroy();
}
