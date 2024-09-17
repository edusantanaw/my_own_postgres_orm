import { IWhere, IWhereOptions } from "../../@types/orm";
import { Entity } from "../../entity";
import { dateToIsoString } from "../../utils/dateToIso";


export class WhereBuilder<T extends Entity> {
  public builder(data: IWhere<T>) {
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
      if (init === "(") continue;
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

  private gtOrLt(type: "gt" | "lt", field: string, value: number | Date) {
    let sign = type === "gt" ? ">" : "<";
    return `${field} ${sign} ${
      typeof value === "number" ? value : `'${dateToIsoString(value)}'`
    }`;
  }
}
