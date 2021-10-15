import { ReadStream } from 'fs';
import FormData from 'form-data';
import axiosClient from "./axios";
import { WorkerLogType } from '../models/worker_log';
import { WorkerType } from '../models/worker';

export async function workerLog(file: ReadStream, worker_id: string, worker_type: WorkerType, log_type: WorkerLogType) {
  const form = new FormData();
  form.append("file", file);
  form.append("worker_id", worker_id);
  form.append("worker_type", worker_type);
  form.append("log_type", log_type);
  return axiosClient.post("common/worker-log", form, { 
    headers: form.getHeaders()
  });
}

