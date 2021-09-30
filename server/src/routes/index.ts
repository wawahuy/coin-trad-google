import express, { Router } from "express";
import path from "path";
import { wsWorkerMiddleware } from "../middlewares/ws_worker";
import routerCoins from "./coin";
import routerWorker from "./worker";

const routerGlobals = Router();
routerGlobals.use('/resource', express.static(path.join(__dirname, '../../resource')));
routerGlobals.use('/coin', wsWorkerMiddleware, routerCoins);
routerGlobals.use('/worker', wsWorkerMiddleware, routerWorker);

export default routerGlobals;
