export abstract class AppError extends Error {
  abstract readonly status: number;
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
  }
}