import express, { Router } from "express";
import commonUpAccount from "../modules/common/new_account";
import workerScriptUpAccount from "../modules/common/script_up_acc";

const routerCommon = Router();
routerCommon.post('/new-account', commonUpAccount);
routerCommon.get('/script-up-acc', workerScriptUpAccount);
export default routerCommon;