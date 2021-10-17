import { appConfigs } from './../config/app';
import StreamThrottle from 'stream-throttle';

export const throttleGroup = new StreamThrottle.ThrottleGroup({ rate: appConfigs.DOWNLOAD_UPLOAD_SPEED });

export function limitGlobalSpeed() {
  return throttleGroup.throttle({ rate: appConfigs.DOWNLOAD_UPLOAD_SPEED });
}