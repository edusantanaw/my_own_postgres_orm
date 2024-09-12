import { Client } from "pg";
import { EntityItem } from ".";
import { Entity } from "../entity";

type Fields = {
  [value: string]: string;
};

const fields: Fields = {
  Date: "Date",
  String: "TEXT",
  Boolean: "bool",
  Number: "real",
};

export async function createTable(pgInstance: Client, entity: EntityItem) {
  try {
    let query = `CREATE TABLE $[name] ($[fields]);`;
    query = query.replace("$[name]", entity.tableName);
    let fieldsBuilder = "";
    const fieldsArr = entity.fields;
    const fieldsCount = fieldsArr.length - 1;
    for (let i = 0; i <= fieldsCount; i++) {
      let type = fields[fieldsArr[i].fieldType];
      fieldsBuilder += `${fieldsArr[i].name} ${type} ${
        fieldsArr[i].pk ? "PRIMARY KEY" : ""
      } ${i === fieldsCount ? "" : ","}`;
    }
    query = query.replace("$[fields]", fieldsBuilder);
    pgInstance.query(query);
  } catch (error) {
  }
}

