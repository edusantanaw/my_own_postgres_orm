import "reflect-metadata";

const ENTITY_METADATA_KEY = Symbol("entity");

type data = {
  name: string;
};

export function Entity({ name }: data) {
  return function (target: Function) {
    Reflect.defineProperty(target, "db_name", {
      value: name,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Reflect.defineMetadata(ENTITY_METADATA_KEY, true, target);
  };
}
