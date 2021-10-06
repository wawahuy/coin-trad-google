import { Request, Response } from 'express';
import fs from 'fs';
import { appConfigs } from '../../config/app';
import { getResourcePath } from '../../helpers/dir';

export default async function workerScriptUpAccount(req: Request, res: Response) {
  const path = getResourcePath("up-acc.sh");
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path).toString('utf-8');
    content = content.replace(/!!__URL__!!/gim, appConfigs.BASE_SHELL_URL);
    res.send(content);
  } else {
    res.status(400).send('Not Found');
  }
}