import { WorkerSyncRequest } from '../models/worker';
import axiosClient from "./axios";

export async function establish(id: string) {
  return axiosClient.post("coin/establish", { id });
}

export async function sync(id: string, d: WorkerSyncRequest) {
  return axiosClient.post("coin/sync", { id, ...d });
}

export async function log(id: string, d: string) {
  return axiosClient.post("coin/log", { id, d });
}