import { ReadStream } from 'fs';
import FormData from 'form-data';
import { WorkerSyncRequest } from '../models/worker';
import axiosClient from "./axios";

export async function getOne() {
  return axiosClient.get("worker/get");
}

export async function establish(id: string) {
  return axiosClient.post("worker/establish", { id });
}

export async function sync(id: string, d: WorkerSyncRequest) {
  return axiosClient.post("worker/sync", { id, ...d });
}

export async function close(id: string) {
  return axiosClient.post("worker/close", { id });
}

export async function checkpoint(id: string) {
  return axiosClient.post("worker/checkpoint", { id });
}

export async function disabled(id: string) {
  return axiosClient.post("worker/disabled", { id });
}

export async function getScript(id: string) {
  return axiosClient.get("worker/script/" + id);
}

export async function downloadProfile(id: string) {
  return axiosClient.get("worker/profile/" + id, { responseType: 'stream' });
}

export async function uploadProfile(id: string, file: ReadStream) {
  const form = new FormData();
  form.append("file", file);
  return axiosClient.post("worker/profile/" + id, form, { 
    headers: form.getHeaders()
  });
}

