import "reflect-metadata";
import Database from "./database";

import { randomUUID } from "crypto";
import { Entity as EntityDecorator } from "./decorator/Entities";
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
  sync: true,
});

(async () => {
  await database
    .connect()
    .then(async () => {
      const respository = database.getRepository<MyEntity>(MyEntity);
      // const users = await respository.query(`Select * from employees`);
      const entity = new MyEntity();
      entity.id = randomUUID();
      entity.name = "Update";
      entity.email = "eduardo@email.com";
      entity.year = 2000;
      entity.deleted = false;
      await respository.create(entity);
      const myEntity = await respository.findAll({
        where: {
          id: {
            equals: entity.id,
          },
        },
      });
      console.log(myEntity);
      entity.name = "Updated";
      await respository.update(entity, {
        id: {
          equals: entity.id,
        },
      });
      const myEntity2 = await respository.findAll({
        where: {
          id: {
            equals: entity.id,
          },
        },
      });
      console.log(myEntity2);
    })
    .catch((err) => {
      console.log(err);
    });
})();
