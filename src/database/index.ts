import * as pg from "pg";
import { Entity } from "../entity";
import { EntityNotFound } from "../exceptions/EntityNotFound";
import { Repository } from "../repository";
import { randomUUID } from "crypto";
import {
  getFieldMetadatas,
  getFieldMetadataValue,
} from "../decorator/FieldDecorator";
import { getEntityMetadata } from "../decorator/Entities";

type ICredentials = {
  host: string;
  user: string;
  password: string;
  port: number;
  database: string;
};

type IData = {
  entities: Entity[];
  credentials: ICredentials;
  sync?: boolean;
};

type IFieldTypes = "Date" | "String" | "Boolean" | "Int" | "Float" | "Double";

export type IField = {
  name: string;
  type: IFieldTypes;
};

type IListEntityItem = {
  id: string;
  entity: Entity;
  tableName: string;
  fields: IField[];
};

export default class Database {
  private static client: pg.Client;
  private driver: typeof pg;
  private entities: IListEntityItem[] = [];
  private credentials: ICredentials;
  constructor(data: IData) {
    this.driver = pg;
    this.credentials = data.credentials;
    this.connect();
    this.entities = data.entities.map((e) => {
      const tableName = getEntityMetadata(e);
      const metadatas = getFieldMetadatas(e).map(
        (metadata) => metadata.metadata
      );
      console.log(metadatas);
      return {
        id: randomUUID(),
        tableName: tableName,
        entity: e,
        fields: metadatas,
      };
    });
  }

  public async connect() {
    try {
      if (Database.client) return Database;
      const client = new pg.Client({
        database: this.credentials.database,
        user: this.credentials.user,
        password: this.credentials.password,
        port: this.credentials.port,
        host: this.credentials.host,
        keepAlive: true,
      });
      await client.connect();
      Database.client = client;
    } catch (error) {
      process.exit(1);
    }
  }

  public getRepository<T extends Entity>(entity: T) {
    const findEntity = this.entities.find((e) => {
      const [currentMTD, entityMTD] = [
        getEntityMetadata(e.entity),
        getEntityMetadata(entity),
      ];
      return currentMTD === entityMTD;
    });
    if (!findEntity) throw new EntityNotFound();
    return new Repository(findEntity.entity, Database.client);
  }

  private async createTables() {
    this.entities.forEach((e) => {});
  }
}
