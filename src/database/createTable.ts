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

export async function createTable(pgInstance: Client, entitys: EntityItem[]) {
  const queries: string[] = [];
  for (const entity of entitys) {
    try {
      let query = `CREATE TABLE ${entity.tableName} ($[fields])`;
      const fieldsBuilder = getFieldsStr(entity.fields);
      query = query.replace("$[fields]", fieldsBuilder);
      queries.push(`${query};`);
      const tableExist = await tableAlreadyExists(pgInstance, entity.tableName);
      if (tableExist) continue;
      pgInstance.query(query);
    } catch (error) {
      console.log(error);
    }
  }
  await createMigration(queries, entitys);
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
    fieldsBuilder += `${fieldsArr[i].name} ${type}${
      fieldsArr[i].pk ? " PRIMARY KEY" : ""
    }${i === fieldsCount ? "" : ", "}`;
  }
  return fieldsBuilder;
}

async function createMigration(queries: string[], entities: EntityItem[]) {
  let dirPath: PathOrFileDescriptor = "migration";
  await createDir(dirPath);
  let path = `${dirPath}/migration.sql`;
  const file = await getCurrentMigration(path);
  if (!file) await createFile(queries, path);
}

async function createFile(queries: string[], path: string) {
  return new Promise((resolve) => {
    let sql = queries.join("\n\n");
    fs.writeFile(path, sql, () => resolve(null));
  });
}

async function getCurrentMigration(path: string) {
  const exists = fs.existsSync(path);
  if (exists)
    return new Promise((resolve) => {
      const file = fs.readFileSync(path);
      resolve(file.toString());
    }) as Promise<string>;
  return null;
}

async function createDir(dir: string) {
  await new Promise((resolve) => {
    const exists = fs.existsSync(dir);
    if (!exists) fs.mkdirSync(dir);
    resolve(null);
  });
}
