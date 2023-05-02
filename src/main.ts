import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT || 3001;
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('Учебное приложение')
    .setDescription('Документация REST API')
    .setVersion('1.0.0')
    .addTag('YourAscension')
    .addBearerAuth()
    .build();
  //Создаём документацию указываем приложение и конфиг
  const document = SwaggerModule.createDocument(app, config);
  //Эндпоинт по которому можем найти документацию
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(PORT, () =>
    console.log(`Server has been started on PORT = ${PORT}`),
  );
}

bootstrap();
