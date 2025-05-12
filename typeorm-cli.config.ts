import { DataSource } from 'typeorm';
import { CoffeeRefactor1747054717492 } from './src/migrations/1747054717492-CoffeeRefactor';
import { Coffee } from './src/coffees/entities/coffee.entity';
import { Flavor } from './src/coffees/entities/flavor.entity';
import { SchemaSync1747056725300 } from './src/migrations/1747056725300-SchemaSync';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  entities: [Coffee, Flavor],
  migrations: [CoffeeRefactor1747054717492, SchemaSync1747056725300],
});
