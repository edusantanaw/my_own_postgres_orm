import "reflect-metadata";

const ENTITY_METADATA_KEY = Symbol("entity");

type data = {
  name: string;
};

export function Entity({ name }: data) {
  return function (target: Function) {
    Reflect.defineMetadata(ENTITY_METADATA_KEY, name, target);
  };
}

export function isEntity() {
  return function (target: Function) {
    Reflect.get(target, "db_name");
    Reflect.defineMetadata(ENTITY_METADATA_KEY, true, target);
  };
}


export function getEntityMetadata(target: any) {
  const metadata = Reflect.getMetadata(ENTITY_METADATA_KEY, target);
  return metadata
}