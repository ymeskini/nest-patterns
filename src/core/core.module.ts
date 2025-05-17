import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationBootstrapOptions } from '../common/interfaces/application-bootstrap-options.interface';

@Module({})
export class CoreModule {
  static forRoot(options: ApplicationBootstrapOptions) {
    const imports =
      options.driver === 'orm'
        ? [
            // We are going to hardcode the connection options for simplicity
            // but you can use a configuration file or environment variables
            TypeOrmModule.forRoot({
              type: 'postgres',
              host: process.env.DATABASE_HOST,
              port: +(process.env.DATABASE_PORT as string),
              username: process.env.DATABASE_USER,
              password: process.env.DATABASE_PASSWORD,
              database: process.env.DATABASE_NAME,
              autoLoadEntities: true,
            }),
          ]
        : [];

    return {
      module: CoreModule,
      imports,
    };
  }
}
