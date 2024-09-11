import { Entity } from "./entity";
import "reflect-metadata";
import Database from "./database";

import { Entity as EntityDecorator } from "./decorator/Entities";

@EntityDecorator({ name: "entitie" })
class MyEntity extends Entity {
  name!: string;
  email!: string;
  deleted!: boolean;
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
