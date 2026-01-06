export class MMKV {
  set() {}
  getString() {
    return undefined;
  }
  getNumber() {
    return undefined;
  }
  getBoolean() {
    return undefined;
  }
  remove() {}
  clearAll() {}
}

export function createMMKV() {
  return new MMKV();
}
