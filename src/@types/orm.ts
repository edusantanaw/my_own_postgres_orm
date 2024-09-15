export type IWhereOptions<T> = {
  have?: T;
  gt?: number;
  lt?: number;
  equals?: T;
};

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
  update(data: T, where?: IWhere<T>): Promise<T>;
  delete(where?: IWhere<T>): Promise<void>;
  findOne(): Promise<T>;
}
