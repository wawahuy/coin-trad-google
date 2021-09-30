import express, { Router } from "express";
import path from "path";

const routerGlobals = Router();
routerGlobals.use('/resource', express.static(path.join(__dirname, '../../resource')));

export default routerGlobals;
