
export default class UnsupportedException {
  constructor(message) {
      const error = new Error(message);
      return error;
  }
}
