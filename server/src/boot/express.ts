import express from "express";
import busyBoy from "connect-busboy";
import routerGlobals from "../routes";

const app = express();

// config decode
app.use(express.json());
app.use(express.urlencoded());
app.use(busyBoy());

// init routers global
app.use(routerGlobals);

export default app;
