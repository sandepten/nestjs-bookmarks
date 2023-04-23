import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // This will enable validation globally for all endpoints
  // whitelist will strip out any properties that are not defined in the DTO
  // transform will automatically transform the incoming data to the type of the DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(8000);
}
bootstrap();
