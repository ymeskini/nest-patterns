import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('tiny'));
  app.useGlobalPipes(
    new ValidationPipe({
      // remove all non listed properties in dtos
      whitelist: true,
      // 400 error if non listed properties are sent
      forbidNonWhitelisted: true,
      // from objects to Class instances
      transform: true,
      transformOptions: {
        // enable implicit conversion of primitive types
        // cf. common/dto/pagination-query.dto.ts
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new WrapResponseInterceptor());
  await app.listen(PORT);
}

bootstrap()
  .then(() => console.log(`Server is running at http://localhost:${PORT}`))
  .catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
  });
