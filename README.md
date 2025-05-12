Generate migration with TypeORM


cf. documentation https://typeorm.io/migrations#migrations

Create migration file
```shell
npx typeorm migration:create src/migrations/:name
```

Run migration in dev
```shell
npx typeorm-ts-node-commonjs migration:run --dataSource typeorm-cli.config.ts
```

Revert migration
```shell
npx typeorm-ts-node-commonjs migration:revert --dataSource typeorm-cli.config.ts
```

Or sync schema with the following command after changing the entities
Before doing this make sure to add all entities to `typeorm-cli.config.ts` in entities array
```shell
npx typeorm-ts-node-commonjs migration:generate src/migrations/SchemaSync -d typeorm-cli.config.ts
```

After generating migrations file, you need to add the class migration to `typeorm-cli.config.ts` in migrations array


# Dependency Injection in NestJS
First, declare a class as `@Injectable()` this mark the class as a provider
Second, we inject the class in the constructor of the class we want to use it
```typescript
constructor(private readonly myService: MyService) {}
```

Third, we need to add the class to the module providers array, so nest knows how to resolve the dependency
```typescript
@Module({
  imports: [],
  controllers: [MyController],
  providers: [MyService],
})
```

The controller first checks if there are some injected dependencies in the constructor.
Once the controller finds one, it will perform a lookup on the coffee service token which return the instance of the service.
It'll create an instance and cache it for the next time. or return the cached instance if it already exists.
This happens on the start of the application.
