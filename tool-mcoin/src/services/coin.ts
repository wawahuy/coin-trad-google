import { ReadStream } from 'fs';
import FormData from 'form-data';
import { WorkerSyncRequest } from '../models/worker';
import axiosClient from "./axios";

export async function getOne() {
  return axiosClient.get("coin/get");
}

export async function establish(id: string, parent: string) {
  return axiosClient.post("coin/establish", { id, parent });
}

export async function sync(id: string, d: WorkerSyncRequest) {
  return axiosClient.post("coin/sync", { id, ...d });
}

export async function close(id: string, parent: string, login_position: number) {
  return axiosClient.post("coin/close", { id, parent, login_position });
}

export async function checkpoint(id: string) {
  return axiosClient.post("coin/checkpoint", { id });
}

export async function disabled(id: string) {
  return axiosClient.post("coin/disabled", { id });
}

export async function getScript(id: string) {
  return axiosClient.get("coin/script/" + id);
}

export async function downloadProfile(id: string) {
  return axiosClient.get("coin/profile/" + id, { responseType: 'stream' });
}

export async function uploadProfile(id: string, file: ReadStream) {
  const form = new FormData();
  form.append("file", file);
  return axiosClient.post("coin/profile/" + id, form, { 
    headers: form.getHeaders()
  });
}

