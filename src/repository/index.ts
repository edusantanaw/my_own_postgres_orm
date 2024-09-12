import { Client } from "pg";
import { IOrm, IWhere } from "../@types/orm";
import { QueryException } from "./exceptions/QueryException";
import { Entity } from "../entity";
import { getEntityMetadata } from "../decorator/Entities";

import "reflect-metadata";
import { EntityItem } from "../database/types";

export class Repository implements IOrm<Entity> {
  constructor(
    private readonly entity: EntityItem,
    private readonly pg: Client
  ) {}
  async findAll(args?: {
    where: IWhere<Entity>;
    limit?: number;
    skip?: number;
  }): Promise<Entity[]> {
    const queryBase = `SELECT * FROM ${this.entity.tableName}`;
    const data = await this.pg.query(queryBase);
    return data.rows;
  }

  async create(data: Entity): Promise<Entity> {
    const tablesFields = this.entity.fields.map((e) => {
      const fieldValue = Reflect.get(data, e.name);
      return {
        field: e.name,
        value: fieldValue,
        type: e.fieldType,
      };
    });
    const query = `INSERT INTO ${this.entity.tableName}(${tablesFields
      .map((e) => e.field)
      .join(",")}) VALUES (${tablesFields
      .map((e) => {
        if (typeof e.value === "string") return `'${e.value}'`;
        if (e.type === "Date")
          return `'${(e.value ?? new Date()).toISOString().split("T")[0]}'`;
        return e.value;
      })
      .join(",")});`;
    const response = await this.pg.query(query);
    return response?.rowCount! > 0;
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

  private whereBuilder(data: IWhere<Entity>) {
    let base = `WHERE`;
    for (const item in data) {
      console.log(base);
    }
    return base;
  }
}
