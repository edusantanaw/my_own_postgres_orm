import "reflect-metadata";
import Database from "./database";

import { randomUUID } from "crypto";
import { Entity as EntityDecorator } from "./decorator/Entities";
import { Field, PrimaryKeyField } from "./decorator/FieldDecorator";

// create entity
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

@EntityDecorator({ name: "test" })
class MySecundaryEntity {
  @PrimaryKeyField()
  @Field("id")
  id!: string;
  @Field("name")
  name!: string;
}

// create a new database
const database = new Database({
  entities: [MyEntity, MySecundaryEntity], // register entities
  credentials: {
    database: "my_database",
    host: "localhost",
    password: "eduardo123",
    port: 5432,
    user: "postgres",
  },
  sync: true, // create all tables if aren't created yet
});

(async () => {
  // initialize connection with database
  await database
    .connect()
    .then(async () => {
      // get a repository with all avaliables methods
      const respository = database.getRepository<MyEntity>(MyEntity);
      await respository.create({
        id: randomUUID(),
        name: "Eduardo",
        email: "eduardo@email.com",
        year: 2002,
        deleted: false,
        createdAt: new Date(),
      });
    })
    .catch((err) => {
      console.log(err);
    });
})();
