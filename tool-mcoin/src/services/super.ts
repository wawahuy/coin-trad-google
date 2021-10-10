import { WorkerSyncRequest } from '../models/worker';
import axiosClient from "./axios";

export async function establish(id: string) {
  return axiosClient.post("super/establish", { id });
}

export async function sync(id: string, d: WorkerSyncRequest) {
  return axiosClient.post("super/sync", { id, ...d });
}