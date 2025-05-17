import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { CoffeesModule } from './coffees/coffees.module';
import { CoffeeRatingModule } from './coffee-rating/coffee-rating.module';
import { validate } from './config/env.validation';
import { CommonModule } from './common/common.module';
import { AlarmsModule } from './alarms/application/alarms.module';

@Module({
  imports: [
    // this will delay the instantiation after all modules are loaded
    // so after the config module
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: +(process.env.DATABASE_PORT as string),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        // synchronize: true,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      // ignoreEnvFile: true, for production
    }),
    CoffeesModule,
    CoffeeRatingModule,
    CommonModule,
    AlarmsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
