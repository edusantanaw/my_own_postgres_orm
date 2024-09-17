import { Client } from "pg";
import { IOrm, IWhere, IWhereOptions } from "../@types/orm";
import { Entity } from "../entity";
import { QueryException } from "./exceptions/QueryException";

import "reflect-metadata";
import { EntityItem, IFieldTypes } from "../database/types";
import { dateToIsoString } from "../utils/dateToIso";
import { WhereBuilder } from "./builders/where";

type ITableFields<T> = {
  field: string;
  value: string extends keyof T ? T[keyof T & string] : any;
  type: IFieldTypes;
};

export class Repository<T extends Entity> implements IOrm<T> {
  private whereBuilder: WhereBuilder<T>;
  constructor(
    private readonly entity: EntityItem,
    private readonly pg: Client
  ) {
    this.whereBuilder = new WhereBuilder();
  }
  async findAll(args?: {
    where: IWhere<T>;
    limit?: number;
    skip?: number;
  }): Promise<T[]> {
    let queryBase = `SELECT * FROM ${this.entity.tableName}`;
    if (args?.where) queryBase += "\n" + this.whereBuilder.builder(args?.where);
    const data = await this.pg.query(queryBase);
    return data.rows as T[];
  }

  async create(data: T): Promise<any> {
    const tablesFields = this.getTableField(data);
    const query = `INSERT INTO ${this.entity.tableName}(${tablesFields
      .map((e) => e.field)
      .join(",")}) VALUES (${tablesFields
      .map((e) => this.formatType(e))
      .join(",")});`;
    const response = await this.pg.query(query);
    return response?.rowCount! > 0;
  }

  async update(data: T, where?: IWhere<T>): Promise<T> {
    const tablesFields = this.getTableField(data);
    let query = `UPDATE ${this.entity.tableName} SET ${tablesFields
      .map((e) => `${e.field}=${this.formatType(e)}`)
      .join(",")}`;
    if (where) {
      const whereQuery = this.whereBuilder.builder(where);
      query += "\n" + whereQuery;
    }
    await this.pg.query(query);
    return data;
  }

  async delete(args: IWhere<T>): Promise<void> {
    let query = `DELETE FROM ${
      this.entity.tableName
    } ${this.whereBuilder.builder(args)}`;
    await this.pg.query(query);
  }

  async findOne(where?: IWhere<T>): Promise<T | null> {
    let query = `SELECT * FROM ${this.entity.tableName}`;
    if (where) query += ` ${this.whereBuilder.builder(where)}`;
    query += " LIMIT 1";
    const result = await this.pg.query(query);
    if (result.rowCount === 0) return null;
    return result.rows[0];
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

  private getTableField(data: T) {
    const tablesFields = this.entity.fields.map((e) => {
      const fieldValue = Reflect.get(data, e.name);
      return {
        field: e.name,
        value: fieldValue,
        type: e.fieldType,
      };
    });
    return tablesFields;
  }

  private formatType(e: ITableFields<T>) {
    if (typeof e.value === "string") return `'${e.value}'`;
    if (e.type === "Date")
      return `'${dateToIsoString((e.value as Date) ?? new Date())}'`;
    return e.value;
  }
}
