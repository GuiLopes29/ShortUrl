import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
    flags: 'a',
  });

  app.use(morgan('combined', { stream: logStream }));

  await app.listen(3000);
}
bootstrap();
