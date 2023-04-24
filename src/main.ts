import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as process from "process";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const PORT = process.env.PORT || 3001
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Тестовое приложение')
        .setDescription('Документация REST API')
        .setVersion('1.0.0')
        .addTag('YourAscension')
        .build();
    //Создаём документацию указываем приложение и конфиг
    const document = SwaggerModule.createDocument(app, config)
    //Эндпоинт по которому можем найти документацию
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(PORT, () => console.log(`Server has been started on PORT = ${PORT}`));
}

bootstrap();
