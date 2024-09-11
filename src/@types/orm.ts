import { Type } from "typescript";

export type IWhere<T> = {
  [Property in keyof T]?: {
    have?: T[Property];
    gt?: number;
    lt?: number;
    equals?: T[Property];
  };
};

type IFindAllArgs<T> = {
  where: IWhere<T>;
  limit?: number;
  skip?: number;
};

export interface IOrm<T> {
  query(sql: string): Promise<unknown>;
  findAll(args?: IFindAllArgs<T>): Promise<T[]>;
  create(data: T): Promise<T>;
  update(data: T): Promise<T>;
  delete(): Promise<void>;
  findOne(): Promise<T>;
}
