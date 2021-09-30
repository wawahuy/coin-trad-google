import path from 'path';

export function getResourcePath(...p: string[]) {
  return path.join(__dirname, '../../resource', ...p);
}