import path from 'path';

export function getBinPath(...dirs: string[]) {
  return path.join(__dirname, '../bin', ...dirs);
}

export function getDirUserData() {
  return path.join(__dirname, '../browser_tmp');
}