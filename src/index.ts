import { Entity } from "./entity";
import "reflect-metadata";
import Database from "./database";

import { Entity as EntityDecorator } from "./decorator/Entities";
import { Field } from "./decorator/FieldDecorator";

@EntityDecorator({ name: "entitie" })
class MyEntity {
  @Field("name")
  name!: string;
  @Field("email")
  email!: string;
  deleted!: boolean;
}

const database = new Database({
  entities: [new MyEntity()],
  credentials: {
    database: "my_database",
    host: "localhost",
    password: "eduardo123",
    port: 5432,
    user: "postgres",
  },
});

(async () => {
  await database
    .connect()
    .then(async () => {
      const respository = database.getRepository(MyEntity.prototype);
      const users = await respository.query(`Select * from employees`);
      // const users2 = await respository.findAll({
      //   where: {
      //     name: {
      //       have: "name",
      //     },
      //     deleted: {
      //       equals: false,
      //     },
      //   },
      // });
    })
    .catch((err) => {
      console.log(err);
    });
})();
