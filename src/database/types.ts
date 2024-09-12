import { Entity } from "../entity";

export type ICredentials = {
  host: string;
  user: string;
  password: string;
  port: number;
  database: string;
};

export type IFieldTypes =
  | "Date"
  | "String"
  | "Boolean"
  | "Int"
  | "Float"
  | "Double";

export type IField = {
  name: string;
  fieldType: IFieldTypes;
  pk: boolean;
};

export type EntityItem = {
  id: string;
  entity: typeof Entity;
  tableName: string;
  fields: IField[];
};
