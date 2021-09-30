import express from "express";
import routerGlobals from "../routes";

const app = express();

// config decode
app.use(express.json());
app.use(express.urlencoded());

// init routers global
app.use(routerGlobals);

export default app;
