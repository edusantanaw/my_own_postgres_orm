import "reflect-metadata";
import Database from "./database";

import {
  Entity as EntityDecorator
} from "./decorator/Entities";
import { Field, PrimaryKeyField } from "./decorator/FieldDecorator";

@EntityDecorator({ name: "entitie" })
class MyEntity {
  @PrimaryKeyField()
  @Field("id")
  id!: string;
  @Field("name")
  name!: string;
  @Field("email")
  email!: string;
  @Field("deleted")
  deleted!: boolean;
  @Field("createdAt")
  createdAt!: Date;
  @Field("year")
  year!: number;
}

const database = new Database({
  entities: [MyEntity],
  credentials: {
    database: "my_database",
    host: "localhost",
    password: "eduardo123",
    port: 5432,
    user: "postgres",
  },
  sync: false,
});

(async () => {
  await database
    .connect()
    .then(async () => {
      const respository = database.getRepository(MyEntity);
      const users = await respository.query(`Select * from employees`);
      const users2 = await respository.findAll({
        where: {
          name: {
            have: "name",
          },
          deleted: {
            equals: false,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
    });
})();
