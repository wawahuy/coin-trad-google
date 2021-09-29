export async function sleep(s: number) {
  return new Promise(res => setTimeout(res, s));
}