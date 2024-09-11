export class DefaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DefaultError";
  }
}
