import * as pg from "pg";
import { Entity } from "../entity";
import { EntityNotFound } from "../exceptions/EntityNotFound";
import { Repository } from "../repository";

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

export default class Database {
  private static client: pg.Client;
  private driver: typeof pg;
  private entities: Entity[] = [];
  private credentials: ICredentials;
  constructor(data: IData) {
    this.driver = pg;
    this.credentials = data.credentials;
    this.connect();
    this.entities = data.entities;
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
      console.log(error);
      process.exit(1);
    }
  }

  public getRepository<T extends Entity>(entity: T) {
    const findEntity = this.entities.find(
      (e) => e.constructor.prototype === entity.constructor.prototype
    );
    if (!findEntity) throw new EntityNotFound();
    return new Repository(findEntity, Database.client);
  }

  private async createTables() {
    this.entities.forEach((e) => {});
  }
}
