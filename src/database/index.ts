import { randomUUID } from "crypto";
import * as pg from "pg";
import { getEntityMetadata } from "../decorator/Entities";
import {
  getFieldMetadatas,
  isPrimaryKeyField,
} from "../decorator/FieldDecorator";
import { Entity } from "../entity";
import { EntityNotFound } from "../exceptions/EntityNotFound";
import { EntityValidation } from "../exceptions/EntityValidation";
import { Repository } from "../repository";
import { createTable } from "./createTable";
import { EntityItem, ICredentials } from "./types";

type IData = {
  entities: (typeof Entity)[];
  credentials: ICredentials;
  sync?: boolean;
};

export default class Database {
  private static client: pg.Client;
  private entities: EntityItem[] = [];
  private credentials: ICredentials;
  constructor(data: IData) {
    this.credentials = data.credentials;
    data.entities.forEach((e) => this.addEntity(e));
    this.connect().then(async () => {
      if (data.sync) await createTable(Database.client, this.entities);
    });
  }

  public async connect() {
    try {
      if (Database.client) return Database.client;
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
      console.log(error);
      process.exit(1);
    }
  }

  public getRepository<T extends Entity>(entity: Function) {
    const findEntity = this.entities.find((e) => {
      const [currentMTD, entityMTD] = [
        getEntityMetadata(e.entity),
        getEntityMetadata(entity),
      ];
      return currentMTD === entityMTD;
    });
    if (!findEntity) throw new EntityNotFound();
    return new Repository<T>(findEntity, Database.client);
  }

  public async closeConnection() {
    await Database.client.end().then(() => console.log(`DB closed!`));
  }

  private addEntity(e: typeof Entity) {
    let haveId: boolean = false;
    const instance = new e();
    const tableName = getEntityMetadata(e).name;
    const metadatas = getFieldMetadatas(instance).map((metadata) => {
      const isPrimaryKey = isPrimaryKeyField(instance, metadata.propertyKey);
      if (isPrimaryKey) haveId = true;
      return { ...metadata.metadata, pk: isPrimaryKey };
    });
    if (!haveId) throw new EntityValidation("Entity must have a primary key");
    this.entities.push({
      id: randomUUID(),
      tableName: tableName,
      entity: e,
      fields: metadatas,
    });
  }
}
