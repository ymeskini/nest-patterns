import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('tiny'));
  app.useGlobalPipes(
    new ValidationPipe({
      // remove all non listed properties in dtos
      whitelist: true,
      forbidNonWhitelisted: true,
      // from objects to Class instances
      transform: true,
    }),
  );
  await app.listen(PORT);
}

bootstrap()
  .then(() => console.log(`Server is running at http://localhost:${PORT}`))
  .catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
  });
