import { Client } from "pg";
import { IOrm, IWhere } from "../@types/orm";
import { QueryException } from "./exceptions/QueryException";
import { Entity } from "../entity";
import "reflect-metadata";
import { getEntityMetadata } from "../decorator/Entities";

export class Repository implements IOrm<Entity> {
  constructor(private readonly entity: Entity, private readonly pg: Client) {}
  async findAll(args?: {
    where: IWhere<Entity>;
    limit?: number;
    skip?: number;
  }): Promise<Entity[]> {
    console.log(this.entity)
    const tableName = getEntityMetadata(this.entity);
    console.log(tableName)
    const queryBase = `SELECT * FROM ${tableName}`;
    const data = await this.pg.query(queryBase);
    return [];
  }

  create(data: Entity): Promise<Entity> {
    throw new Error("Method not implemented.");
  }
  update(data: Entity): Promise<Entity> {
    throw new Error("Method not implemented.");
  }
  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findOne(): Promise<Entity> {
    throw new Error("Method not implemented.");
  }

  async query(sql: string): Promise<unknown> {
    try {
      const queryResult = await this.pg.query(sql);
      return queryResult.rows;
    } catch (error) {
      const message = error as string;
      throw new QueryException(message);
    }
  }
}
