import express, { Router } from "express";
import commonUpAccount from "../modules/common/new_account";
import workerScriptUpAccount from "../modules/common/script_up_acc";
import commonWorkerLog from "../modules/common/worker_log";

const routerCommon = Router();
routerCommon.post('/new-account', commonUpAccount);
routerCommon.post('/worker-log', commonWorkerLog);
routerCommon.get('/script-up-acc', workerScriptUpAccount);
export default routerCommon;