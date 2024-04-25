import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: function (origin, callback) {
      let isAllowed = ['http://localhost:3000', 'http://localhost:5173'].includes(origin);
      callback(null, isAllowed);
    },
    methods: '*',
    allowedHeaders: '*',
  });
  
  await app.listen(3000);
}
bootstrap();
