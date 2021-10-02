import path from 'path';
import fs from 'fs';

export function getBinPath(...dirs: string[]) {
  return path.join(__dirname, '../../bin', ...dirs);
}

export function getDirUserData(id: string) {
  const p = path.join(__dirname, '../../resource', id);
  return p;
}