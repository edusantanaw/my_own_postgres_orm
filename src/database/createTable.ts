import { Client } from "pg";
import { EntityItem, IField } from "./types";

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
    const tableExist = await tableAlreadyExists(pgInstance, entity.tableName);
    if (tableExist) return;
    let query = `CREATE TABLE ${entity.tableName} ($[fields])`;
    const fieldsBuilder = getFieldsStr(entity.fields);
    query = query.replace("$[fields]", fieldsBuilder);
    pgInstance.query(query);
  } catch (error) {
    console.log(error);
  }
}

async function tableAlreadyExists(pgInstance: Client, tableName: string) {
  let query = `SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = '${tableName}'`;
  const response = await pgInstance.query(query);
  return response?.rowCount! > 0;
}

function getFieldsStr(fieldsArr: IField[]) {
  let fieldsBuilder = "";
  const fieldsCount = fieldsArr.length - 1;
  for (let i = 0; i <= fieldsCount; i++) {
    let type = fields[fieldsArr[i].fieldType];
    fieldsBuilder += `${fieldsArr[i].name} ${type} ${
      fieldsArr[i].pk ? "PRIMARY KEY" : ""
    } ${i === fieldsCount ? "" : ","}`;
  }
  return fieldsBuilder;
}
