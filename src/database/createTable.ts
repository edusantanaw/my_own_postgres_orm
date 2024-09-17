import { Client } from "pg";
import { EntityItem, IField } from "./types";
import fs, { PathOrFileDescriptor } from "node:fs";

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
    let query = `CREATE TABLE ${entity.tableName} ($[fields])`;
    const fieldsBuilder = getFieldsStr(entity.fields);
    query = query.replace("$[fields]", fieldsBuilder);
    await createMigration(`${query};\n\n`, entity.tableName);
    const tableExist = await tableAlreadyExists(pgInstance, entity.tableName);
    if (tableExist) return;
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

async function createMigration(sql: string, entityName: string) {
  const regex = /CREATE\s+TABLE\s+(\w+)/gi;
  let dirPath: PathOrFileDescriptor = "migration";
  await new Promise((resolve) => {
    const exists = fs.existsSync(dirPath);
    if (!exists) fs.mkdirSync(dirPath);
    resolve(null);
  });
  await new Promise((resolve) => {
    let path = `${dirPath}/migration.sql`;
    const file = fs.readFileSync(path).toString();
    const entities = [...file.matchAll(regex)].map((match) => match[1]);
    if (entities.includes(entityName)) return;
    fs.appendFileSync(`${dirPath}/migration.sql`, sql);
    resolve(null);
  });
}

