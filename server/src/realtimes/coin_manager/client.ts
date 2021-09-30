import { Mongoose, ObjectId, Schema, SchemaTypes, Types } from "mongoose";
import WebSocket from "ws";
import moment from "moment";
import ModelWorker from "../../models/schema/worker";
import { WorkerType } from "../../models/worker";
import WsClient from "../client";
import { ECommandType } from "./command";
import { ResEstablishCoin, ResSyncCoin } from "./model";

export default class WsCoinClient extends WsClient<ECommandType> {
  private sessionId!: Types.ObjectId;

  constructor(ws: WebSocket) {
    super(ws);
    this.on(ECommandType.EstablishMCoin, this.onEstablishMCoin);
    this.on(ECommandType.SyncMCoin, this.onAccuracy(this.onSyncMCoin));
  }

  onEstablishMCoin = async (d: ResEstablishCoin) => {
    const id = d.id;
    let result;
    try {
      const _id = new Types.ObjectId(id);
      const model = await ModelWorker.findOne({ _id, type: WorkerType.CoinManager });
      if (model) {
        this.sessionId = _id;
        result = {
          status: true,
          data: model
        };
      } else {
        result = { status: false };
      }
    } catch (e) {
      result = { status: false };
    }
    this.send({
      c: ECommandType.EstablishMCoin,
      d: result
    })
  }

  onAccuracy = (cb: (...args: any[]) => any) => {
    return (...args: any[]) => {
      if (this.sessionId) {
        cb(...args);
      }
    }
  }

  onSyncMCoin = async (d: ResSyncCoin) => {
    let data: { [key: string]: any } = {};
    if (Number(d.quota)) {
      data.quota = Number(d.quota);
    }
    if (Number(d.quota_max)) {
      data.quota_max = Number(d.quota_max);
    }
    data.sync_date = moment();
    await ModelWorker.updateOne({ _id: this.sessionId }, { $set: data });

    // response
    const model = await ModelWorker.findOne({ _id: this.sessionId });
    this.send({
      c: ECommandType.SyncMCoin,
      d: model
    });
  }
}
