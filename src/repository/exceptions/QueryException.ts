import { DefaultError } from "../../exceptions/Default";

export class QueryException extends DefaultError {
  constructor(message: string) {
    super(message);
    this.name = "QueryException";
  }
}
