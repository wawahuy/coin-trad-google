import express, { Router } from "express";
import workerCheckpoint from "../modules/worker/checkpoint";
import workerClose from "../modules/worker/close";
import workerEstablish from "../modules/worker/establish";
import workerProfileDownload from "../modules/worker/profile_download";
import workerProfileUpload from "../modules/worker/profile_upload";
import workerScript from "../modules/worker/script";
import workerSync from "../modules/worker/sync";

const routerWorker = Router();
routerWorker.post('/establish', workerEstablish);
routerWorker.post('/sync', workerSync);
routerWorker.post('/close', workerClose);
routerWorker.post('/checkpoint', workerCheckpoint);
routerWorker.post('/profile/:id', workerProfileUpload);
routerWorker.get('/profile/:id', workerProfileDownload);
routerWorker.get('/script', workerScript);
export default routerWorker;