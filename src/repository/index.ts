import { Client } from "pg";
import { IOrm, IWhere, IWhereOptions } from "../@types/orm";
import { Entity } from "../entity";
import { QueryException } from "./exceptions/QueryException";

import "reflect-metadata";
import { EntityItem } from "../database/types";
import { dateToIsoString } from "../utils/dateToIso";

export class Repository<T extends Entity> implements IOrm<T> {
  constructor(
    private readonly entity: EntityItem,
    private readonly pg: Client
  ) {}
  async findAll(args?: {
    where: IWhere<T>;
    limit?: number;
    skip?: number;
  }): Promise<T[]> {
    console.log(args);
    let queryBase = `SELECT * FROM ${this.entity.tableName}`;
    if (args?.where) queryBase += "\n" + this.whereBuilder(args?.where);
    console.log(queryBase);
    const data = await this.pg.query(queryBase);
    return data.rows as T[];
  }

  async create(data: T): Promise<any> {
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
          return `'${dateToIsoString((e.value as Date) ?? new Date())}'`;
        return e.value;
      })
      .join(",")});`;
    const response = await this.pg.query(query);
    return response?.rowCount! > 0;
  }

  update(data: T): Promise<T> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  findOne(): Promise<T> {
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

  private whereBuilder(data: IWhere<T>) {
    let base = `WHERE `;
    let initialLen = base.length;
    for (const item in data) {
      const itemValue = data[item] as IWhereOptions<any>;
      if (base[base.length - 1] === ")") base += " AND ";
      let init = "(";
      if (itemValue?.equals !== undefined)
        init += this.equals(item, itemValue.equals);
      if (itemValue?.gt) init += this.gtOrLt("gt", item, itemValue.gt);
      if (itemValue?.lt) init += this.gtOrLt("lt", item, itemValue.lt);
      if (itemValue?.have) init += this.have(item, itemValue.have);
      console.log(init);
      if (init === "(") continue;
      console.log(1);
      init += ")";
      base += init;
    }
    if (base.length === initialLen) return "";
    return base;
  }

  private have(field: string, value: string) {
    return `${field} LIKE '%${value}%'`;
  }

  private equals<T>(field: string, value: T) {
    if (typeof value === "string") return `${field} = '${value}'`;
    if (value instanceof Date) return `${field} = '${dateToIsoString(value)}'`;
    return `${field} = ${value}`;
  }

  private gtOrLt(type: "gt" | "lt", field: string, value: number) {
    let sign = type === "gt" ? ">" : "<";
    return `${field} ${sign} ${value}`;
  }
}
