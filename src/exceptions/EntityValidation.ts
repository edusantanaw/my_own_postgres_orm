import { DefaultError } from "./Default";

export class EntityValidation extends DefaultError {
  constructor(message: string) {
    super(message);
    this.name = "EntityValidation";
  }
}
