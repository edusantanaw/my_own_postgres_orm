import "reflect-metadata";
import { Entity } from "../entity";
import { assert } from "console";

const FIELD_METADATA_KEY = Symbol("field");

export function Field(metadata: string) {
  return function (target: any, propertyKey: string) {
    const fieldType = Reflect.getMetadata("design:type", target, propertyKey);
    Reflect.defineMetadata(
      FIELD_METADATA_KEY,
      {
        name: metadata,
        fieldType: fieldType.name,
      },
      target,
      propertyKey
    );
  };
}

export function getFieldMetadatas(target: Entity) {
  const metadatas = [];
  for (const propertyKey of Object.getOwnPropertyNames(target)) {
    const metadata = Reflect.getMetadata(
      FIELD_METADATA_KEY,
      target,
      propertyKey
    );
    if (metadata) metadatas.push({ propertyKey, metadata });
  }
  return metadatas;
}

export function getFieldMetadataValue(target: Entity, metadata: string) {
  const value = Reflect.getMetadata(metadata, target);
  return value;
}
