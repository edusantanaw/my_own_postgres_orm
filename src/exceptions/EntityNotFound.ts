import { DefaultError } from "./Default";

export class EntityNotFound extends DefaultError {
  constructor() {
    super("Entity not found!");
    this.name = "EntityNotFound";
  }
}
