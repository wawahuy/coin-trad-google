import express, { Router } from "express";
import path from "path";
import coinEstablish from "../modules/coin/establish";
import coinSync from "../modules/coin/sync";

const routerCoins = Router();
routerCoins.post('/establish', coinEstablish);
routerCoins.post('/sync', coinSync);
export default routerCoins;