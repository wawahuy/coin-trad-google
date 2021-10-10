export interface WorkerSyncRequest {
  quota?: number;
  quota_max?: number;
  quota_reset?: Date;
  cpu?: number;
  ram_max?: number;
  ram?: number;
}

export enum WorkerType {
  CoinManager = 1,
  SuperManager = 2,
  Worker = 3
}

export enum WorkerStatus {
  Idle = 1,
  Running = 2,
  Checkpoint = 3
}

export interface IWorker {
  email?: string;
  password?: string;
  profile_data?: string;
  thread?: number;
  type?: WorkerType;
  status?: WorkerStatus;
  worker_max?: number;
  quota?: number;
  quota_max?: number;
  quota_reset?: Date | null;
  cpu?: number;
  cpu_max?: number;
  ram?: number;
  ram_max?: number;
  sync_date?: Date | null;
  login_position?: number;
}