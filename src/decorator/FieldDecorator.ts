import "reflect-metadata";

const ENTITY_METADATA_KEY = Symbol("field");

type data = {
  name: string;
};

export function Field({ name }: data) {
  console.log(name);
  return function (target: Function) {
    Reflect.defineMetadata(ENTITY_METADATA_KEY, true, target);
  };
}
