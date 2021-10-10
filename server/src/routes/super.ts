import express, { Router } from "express";
import superSync from "../modules/super/sync";

const routerSuper = Router();
routerSuper.post('/sync', superSync);
export default routerSuper;