# Учебный проект Nest JS

1. [Создание проекта](#создание-проекта)
2. [Подключение к БД (создание модуля для БД)](#подключение-к-бд-создание-модуля-для-бд)
3. [Модуль User](#модуль-user)
   1) [Создание модуля User](#создание-модуля-user)
   2) [Создание модели User](#создание-модели-user)
   3) [Создание контроллера User](#создание-контроллера-user)
   4) [Создание сервиса User](#создание-сервиса-user)
4. [Swagger](#swagger)
   1) [Установка Swagger](#установка-swagger)
   2) [Документация контроллера User](#документация-контроллера-user)
   3) [Документация модели User и dto](#документация-модели-user-и-dto)
   4) [Возможность использования авторизации в документации](#возможность-использования-авторизации-в-документации)
5. [Создание модуля Roles](#создание-модуля-roles)
   1) [Создание модели Roles](#создание-модели-roles)
   2) [Создание связи моделей (Roles (1) → (∞) User)](#создание-связи-моделей-roles-1---user)
   3) [Создание сервиса для Roles](#создание-сервиса-для-roles)
   4) [Создание контроллера для Roles](#создание-контроллера-для-roles)
   5) [Взаимодействие сервисов Roles и User](#взаимодействие-сервисов-roles-и-user)
6. [Создание модуля Auth](#создание-модуля-auth)
   1) [Создания контроллера Auth](#создание-контроллера-auth)
   2) [Создание сервиса Auth](#создание-сервиса-auth)
      1) [Получаем доступ к сервису User из сервиса Auth](#получаем-доступ-к-сервису-user-из-сервиса-auth)
      2) [JWT, авторизация, регистрация, генерирование токена](#jwt-авторизация-регистрация-генерирование-токена)
   3) [Создание Guard для ограничения доступа неавторизованным пользователям](#создание-guard-для-ограничения-доступа-неавторизированным-пользователям)
   4) [Roles Guard для ограничения доступа по ролям. Создание собственного декоратора](#roles-guard-для-ограничения-доступа-по-ролям-создание-собственного-декоратора)
   5) [Раздача ролей и банов](#раздача-ролей-и-банов)
7. [Валидация. Pipes и class-validator](#валидация-pipes-и-class-validator)
8. [Чем отличается pipe от middleware в NestJS](#чем-отличается-pipe-от-middleware-в-nestjs)
9. [Создание модулей Posts и Files](#создание-модулей-posts-и-files)
   1) [Модуль Posts](#модуль-posts)
   2) [Модуль Files](#модуль-files)
   3) [Serve static](#serve-static)
10. [Начало](#начало)
11. [e2e тесты для контроллера User (Post, Get, Delete)](#e2e-тесты-для-контроллера-user-post-get-delete)
    1) [Функция describe, подключения и иницализация модуля App](#функция-describe-подключения-и-иницализация-модуля-app)
    2) [Объяснение логики создания тестов на примере теста на создание пользователя](#объяснение-логики-создания-тестов-на-примере-теста-на-создание-пользователя)
    3) [Тесты с проверкой результатов при успехе](#тесты-с-проверкой-результатов-при-успехе)
    4) [Тест с проверкой результата при ошибке](#тест-с-проверкой-результата-при-ошибке)
    5) [Тесты с авторизацией](#тесты-с-авторизацией)
<hr>

## Создание проекта
1.  Создаём проект с помощью __NEST CLI__ `nest new .` или `nest new *название проекта*`;
2. Устанавливаем __Sequelize__ и __oracledb__ (библиотека для нужной БД)<br>`npm install --save @nestjs/sequelize sequelize sequelize-typescript oracledb`<br>`npm install --save-dev @types/sequelize`
3. Устанавливаем библиотеки: __@nestjs/config__ - для работы с конфигами и __cross-env__ - для указания переменных в наименовании скрипта `npm install @nestjs/config cross-env.` Создаём файлы `.env.development` и `.env.production`.
    ```
   //📁.env.development
   PORT=4001
   DB_DATABASE="XE"
   DB_HOST="localhost"
   DB_USERNAME="yourascension"
   DB_PASSWORD="123456"
   DB_PORT=1521
   SECRET_KEY="moonshine"
    ```
4. Переходим в `package.json` и указываем переменные в скриптах: `"start": "cross-env NODE_ENV=production nest start"` и `"start:dev": "cross-env NODE_ENV=development nest start --watch"` для того, чтобы во время разработки использовался файл `.env.development`, а для продакшена `.env.production`.
5. Создаём файл `config.root.ts` с настройками конфига.
    ```TypeScript
   //TypeScript
   //📁src/common/config.root.ts
   import {ConfigModule} from "@nestjs/config";
   import * as process from "process";
   
   export const configModule =  ConfigModule.forRoot({envFilePath: `.env.${process.env.NODE_ENV}`,
   isGlobal: true})
   ```
<hr/>

## Подключение к БД (создание модуля для БД)
1. С помощью __Nest CLI__ создадим модуль для БД. `nest generate module database`;
2. Также импортируем модуль __Sequelize__ для настройки подключения к БД:
    ```TypeScript
   //TypeScript
   //📁src/database/database.module.ts
   import { Module } from '@nestjs/common';
   import {configModule} from "../common/config.root";
   import {SequelizeModule} from "@nestjs/sequelize";
   
   @Module({
        imports: [
        configModule,
        SequelizeModule.forRoot({
            dialect: 'oracle',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            autoLoadModels: true,
            synchronize: true,
            models: []
        })],
   })
   export class DatabaseModule {}
   ```
3. Для того чтобы можно было работать с БД в других модулях, в модуль `app.module.ts` импортируем `database.module.ts`
    ```TypeScript
   //TypeScript
   //📁src/app.module.ts
    import { Module } from '@nestjs/common';
    import { DatabaseModule } from './database/database.module';
    
    @Module({
        imports: [DatabaseModule],
        controllers: [],
        providers: [],
    })
    export class AppModule {}
   ```
   >💡 Т.к. модуль для работы с конфигом был импортирован в `database.module.ts`, то его функционал также доступен в `app.module.ts`:
    ```TypeScript
   //TypeScript
   //📁src/main.ts
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import * as process from "process";

    async function bootstrap() {
        const PORT = process.env.PORT || 3001
        const app = await NestFactory.create(AppModule);
        await app.listen(PORT, ()=>console.log(`Server has been started on PORT = ${PORT}`));
    }
    bootstrap();
    ```
<hr/>

## Модуль User
### Создание модуля User
1. С помощью __Nest CLI__ создаём модуль `nest generate module user`. Он пока что пуст.
    ```TypeScript
   //TypeScript
   //📁src/user/user.module.ts
    import { Module } from '@nestjs/common';
    
    @Module({
        imports: [],
        controllers: [],
        providers: []
    })
    export class UserModule {}
   ```
   >💡 При создании модуля с помощью __NEST CLI__ он автоматически импортируется в главный модуль `app.module.ts`.
    ```TypeScript
    //TypeScript
   //📁src/app.module.ts

    import { Module } from '@nestjs/common';
    import { DatabaseModule } from './database/database.module';
    import { UserModule } from './user/user.module';
    
    @Module({
        imports: [DatabaseModule, UserModule],
        controllers: [],
        providers: [],
    })
    export class AppModule {}
   ```
### Создание модели User
1. Создадим модель юзера для БД в файле `user.model.ts`
    ```TypeScript
    //TypeScript
   //📁src/user/user.model.ts
    import {Table, Column, Model, PrimaryKey, DataType} from 'sequelize-typescript';
    
    //Создаём интерфейс, в котором указываем какие свойства будем указывать вручную при создании юзера
    interface UserCreationAttribute {
        email: string;
        password: string
    }
    
    @Table({tableName: 'users-nest', timestamps: false})
    export class User extends Model<User, UserCreationAttribute> {
   
        @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
        id: number;
    
        @Column({type: DataType.STRING, unique: true, allowNull: false})
        email: string;
    
        @Column({type: DataType.STRING, allowNull: false})
        password: string;
    
        @Column({type: DataType.BOOLEAN, defaultValue: false, allowNull: false})
        banned: boolean;
    }
   ```
2. После создания модели её необходимо указать в импортах в модуле `user.module.ts`
    ```TypeScript
    //TypeScript
   //📁src/user/user.module.ts
    import { Module } from '@nestjs/common';
    import {SequelizeModule} from "@nestjs/sequelize";
    import {User} from "./user.model";
    
    @Module({
        imports: [SequelizeModule.forFeature([User])],
        controllers: [],
        providers: []
    })
    export class UserModule {}
   ```
3. Также необходимо импортировать `user.module.ts` в `database.module.ts` и в настройках БД указать созданную модель:
    ```TypeScript
    //TypeScript
   //📁src/database/database.module.ts
    import { Module } from '@nestjs/common';
    import {configModule} from "../common/config.root";
    import {SequelizeModule} from "@nestjs/sequelize";
    import {User} from "../user/user.model";
    import {UserModule} from "../user/user.module";
    
    @Module({
        imports: [
        configModule,
        SequelizeModule.forRoot({
            dialect: 'oracle',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            autoLoadModels: true,
            synchronize: true,
            models: [User]
        }),
        UserModule],
    })
    export class DatabaseModule {}
   ```
### Создание контроллера User
1. С помощью __Nest CLI__ создадим контроллер `nest generate controller user`. (Он автоматически добавится в контроллеры `user.module.ts`):
    ```TypeScript
    //TypeScript
   //📁src/user/user.controller.ts
    import {Controller, Get} from '@nestjs/common';
    
    @Controller('users')
    export class UserController {
    
        @Get()
         getTest(){
            return 'Test controller getTest()'
        }
    }
   ```
2. Если запустить сервер, то увидим что контроллер работает.
### Создание сервиса User
1. С помощью __Nest CLI__ создадим сервис `nest generate service user`. (Он автоматически добавится в сервисы `user.module.ts`);
2. С помощью `@InjectModel` в конструкторе добавим модель `User` и объявим её как `useRepository`. После чего напишем метод `getAllUsers`, который будет просто возвращать всех юзеров:
    ```TypeScript
    //TypeScript
   //📁src/user/user.service.ts
    import { Injectable } from '@nestjs/common';
    import {InjectModel} from "@nestjs/sequelize";
    import {User} from "./user.model";
    
    @Injectable()
    export class UserService {
    constructor(@InjectModel(User) private userRepository: typeof User) {}
    
        async getAllUsers(){
            const users = this.userRepository.findAll();
            return users;
        }
    }
   ```
3. Т.к. сервис уже добавлен в `user.module.ts`:
    ```TypeScript
    //TypeScript
   //📁src/user/user.module.ts
    import { Module } from '@nestjs/common';
    import {SequelizeModule} from "@nestjs/sequelize";
    import {User} from "./user.model";
    import { UserController } from './user.controller';
    import { UserService } from './user.service';
    
    @Module({
        imports: [SequelizeModule.forFeature([User])],
        controllers: [UserController],
        providers: [UserService]
    })
    export class UserModule {}
   ```
4. То мы можем использовать его в контроллере. Импортируем и укажем его в конструкторе класса, после чего вызываем у него метод `getAllUsers`:
    ```TypeScript
    //TypeScript
   //📁src/user/user.controller.ts
    import {Controller, Get} from '@nestjs/common';
    import {UserService} from "./user.service";
    
    @Controller('users')
    export class UserController {
    constructor(private readonly userService: UserService) {}
    
        @Get()
        getAllUsers() {
            return this.userService.getAllUsers()
        }
    }
   ```
5. Теперь если мы запустим сервер и перейдём по эндпоинту `localhost:4001/users`, то увидим список всех юзеров (данные были созданы заранее).
6. Вернёмся к `user.service.ts` чтобы создать метод для создания юзеров. Метод называется `createUser`, в качестве аргументов он принимает dto:
    ```TypeScript
    //TypeScript
   //📁src/user/user.service.ts
    import {Injectable} from "@nestjs/common";
    import {User} from "./user.model";
    import {InjectModel} from "@nestjs/sequelize";
    import {CreateUserDto} from "./dto/create-user.dto";
    
    
    @Injectable()
    export class UserService {
    constructor(@InjectModel(User) private  userRepository: typeof User) {}
    
        async createUser(dto: CreateUserDto){
            const user = await this.userRepository.create(dto)
            return user;
        }
    
        async getAllUsers(){
            const users = await this.userRepository.findAll();
            return users;
        }
    }
   ```
   >💡 __dto__  (__Data-Transfer-Object__) - преобразование данных к необходимому виду.<br> В папке user создадим папку __dto__, а в ней файл `user-create.dto.ts` (преобразование данных юзера для создания):
    ```TypeScript
    //TypeScript
   //📁src/user/dto/create-user.dto.ts
    export class CreateUserDto {
        readonly email: string;
        readonly password: string;
    }
   ```
7. Снова возвращаемся в контроллер и создаём метод `create` с декоратором `@POST` для создания юзера. Метод в качестве аргументов принимает декоратор `@Body` и `userDto`:
    ```TypeScript
    //TypeScript
    //📁src/user/user.controller.ts
    import {Body, Controller, Get, Post} from '@nestjs/common';
    import {UserService} from "./user.service";
    import {CreateUserDto} from "./dto/create-user.dto";
    
    @Controller('users')
    export class UserController {
    constructor(private readonly userService: UserService) {}
    
        @Post()
        createUser(@Body() userDto: CreateUserDto){
            return this.userService.createUser(userDto)
        }
        @Get()
        getAllUsers() {
            return this.userService.getAllUsers()
        }
    }   
   ```
8. Теперь если запустим сервер и отправим POST запрос, то сможем создать юзера.
<hr/>

## Swagger
### Установка Swagger
1. Установим __Swagger__ и интерфейс для отображения документации `npm install @nestjs/swagger swagger-ui-express`;
2. В файле `main.ts` создадим конфиг и сделаем сетап для документации:
    ```TypeScript
    //TypeScript
   //📁src/main.ts
   import {NestFactory} from '@nestjs/core';
   import {AppModule} from './app.module';
   import * as process from "process";
   import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
   
   async function bootstrap() {
   const PORT = process.env.PORT || 3001
   const app = await NestFactory.create(AppModule);
   
       const config = new DocumentBuilder()
           .setTitle('Учебное приложение')
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
   ```
3. Перейдя по эндпоинту `api/docs` увидим документацию.
### Документация контроллера User
1. Декораторы для описания контроллера:
   1. `@ApiTags('Пользователи')` - название контроллера;
   2. `@ApiOperation({summary: 'Создание пользователя'})` -  название эндпоинта;
   3. `@ApiResponse(), @ApiResponse({status: 200, type: User})` - описание ответа;
    ```TypeScript
    //TypeScript
   //📁src/user/user.controller.ts
   import {Body, Controller, Get, Post} from '@nestjs/common';
   import {UserService} from "./user.service";
   import {CreateUserDto} from "./dto/create-user.dto";
   import {ApiTags, ApiOperation, ApiResponse} from "@nestjs/swagger";
   import {User} from "./user.model";
   
   @ApiTags('Пользователи')
   @Controller('users')
   export class UserController {
   constructor(private readonly userService: UserService) {}
   
       @ApiOperation({summary: 'Создание пользователя'})
       @ApiResponse({status: 200, type: User})
       @Post()
       createUser(@Body() userDto: CreateUserDto){
           return this.userService.createUser(userDto)
       }
   
       @ApiOperation({summary: 'Получить список пользователей'})
       @ApiResponse({status: 200, type: [User]})
       @Get()
       getAllUsers() {
           return this.userService.getAllUsers()
       }
   }
   ```
   >⚠️ Чтобы увидеть ответ от сервера, необходимо также задокументировать модели.
### Документация модели User и dto
1. С помощью декоратора `@ApiProperty` можно задокументировать столбцы модели. Указываем пример значения и его описание в качестве аргументов:
    ```TypeScript
    //TypeScript
   //📁src/user/user.model.ts
       @Table({tableName: 'users-nest', timestamps: false})
        export class User extends Model<User, UserCreationAttribute> {
            @ApiProperty({example: '1', description: 'ID пользователя'})
            @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
            id: number;
   
            @ApiProperty({example: 'placeholder@gmail.com', description: 'Почтовый адрес'})
            @Column({type: DataType.STRING, unique: true, allowNull: false})
            email: string;
   
            @ApiProperty({example: 'qwerty123', description: 'Пароль'})
            @Column({type: DataType.STRING, allowNull: false})
            password: string;
   
            @ApiProperty({example: 'true', description: 'Забанен ли'})
            @Column({type: DataType.BOOLEAN, defaultValue: false, allowNull: false})
            banned: boolean;
   }
   ```
2. Также задокументируем `create-user.dto.ts`:
    ```TypeScript
    //TypeScript
   //📁src/user/dto/create-user.dto.ts
   import {ApiProperty} from "@nestjs/swagger";
   
   export class CreateUserDto {
        @ApiProperty({example: 'placeholder@gmail.com', description: 'Почтовый адрес'})
        readonly email: string;
   
        @ApiProperty({example: 'qwerty123', description: 'Пароль'})
        readonly password: string;
   }
   ```
### Возможность использования авторизации в документации
1. При создании экземпляра необходимо вызвать метод `addBeareAuth`, и в сетапе указать `{swaggerOptions : {persistAuthorization: true}}`
    ```TypeScript
   //TypeScript
   //📁src/main.ts
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
           .addBearerAuth()
           .build();
       //Создаём документацию указываем приложение и конфиг
       const document = SwaggerModule.createDocument(app, config)
       //Эндпоинт по которому можем найти документацию
       SwaggerModule.setup('api/docs', app, document, {swaggerOptions : {persistAuthorization: true}});
   
       await app.listen(PORT, () => console.log(`Server has been started on PORT = ${PORT}`));
   }
   
   bootstrap();
   ```
2. У эндпоинтов у которых используется `@UseGuards` для проверки авторизации необходимо добавить декоратор `@ApiBearerAuth`, чтобы была возможность работать с ним в документации:
    ```TypeScript
   //TypeScript
   //📁src/user/user.controller.ts
   import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
   import {UserService} from "./user.service";
   import {CreateUserDto} from "./dto/create-user.dto";
   import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
   import {User} from "./user.model";
   import {JwtAuthGuard} from "../auth/jwt-auth.guard";
   
   @ApiTags('Пользователи')
   @Controller('users')
   export class UserController {
   constructor(private readonly userService: UserService) {}
   
       @ApiOperation({summary: 'Создание пользователя'})
       @ApiResponse({status: 200, type: User})
       @Post()
       createUser(@Body() userDto: CreateUserDto){
           return this.userService.createUser(userDto)
       }
   
       @ApiOperation({summary: 'Получить список пользователей'})
       @ApiResponse({status: 200, type: [User]})
       //
       @ApiBearerAuth()
       @UseGuards(JwtAuthGuard)
       @Get()
       getAllUsers() {
           return this.userService.getAllUsers()
       }
   }
   ```
<hr/>

## Создание модуля Roles
Создадим модуль, контроллер, сервис с помощью __Nest CLI__. `nest g resource roles`. 
### Создание модели Roles
1. Создадим модель для ролей `roles.model.ts`:
    ```TypeScript
       //TypeScript
      //📁src/roles/roles.model.ts
   import {Table, Column, Model, DataType} from 'sequelize-typescript';
   import {ApiProperty} from "@nestjs/swagger";
   
   //Создаём интерфейс, в котором указываем какие свойства будем указывать вручную при создании роли
   interface RoleCreationAttribute {
   role: string
   }
   
   @Table({tableName: 'roles-nest', timestamps: false})
   export class Roles extends Model<Roles, RoleCreationAttribute> {
        @ApiProperty({example: '1', description: 'ID роли'})
        @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
        id: number;
   
        @ApiProperty({example: 'Администратор', description: 'Название роли'})
        @Column({type: DataType.STRING, unique: true, allowNull: false})
        role: string;
   }
   ```
2. Теперь необходимо модель подключить к модулю БД в `database.module.ts`:
    ```TypeScript
    //TypeScript
   //📁src/database/database.module.ts
   import {Module} from '@nestjs/common';
   import {configModule} from "../common/config.root";
   import {SequelizeModule} from "@nestjs/sequelize";
   import {User} from "../user/user.model";
   import {UserModule} from "../user/user.module";
   import {Roles} from "../roles/roles.model";
   
   @Module({
        imports: [
        configModule,
        SequelizeModule.forRoot({
            dialect: 'oracle',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            autoLoadModels: true,
            synchronize: true,
            models: [User, Roles]
        }),
        UserModule
    ],
   })
   export class DatabaseModule {
   }
   ```
3. А также подключить модель к модулю `roles.module.ts`:
    ```TypeScript
    //TypeScript
   //📁src//roles/roles.module.ts
   import { Module } from '@nestjs/common';
   import { RolesController } from './roles.controller';
   import { RolesService } from './roles.service';
   import {SequelizeModule} from "@nestjs/sequelize";
   import {Roles} from "./roles.model";
   
   @Module({
        imports: [SequelizeModule.forFeature([Roles])],
        controllers: [RolesController],
        providers: [RolesService]
   })
   export class RolesModule {}
   ```
### Создание связи моделей (Roles (1) → (∞) User)
1. У юзера может быть одна роль. Т.е. получается связь: __role (1) → (∞) user__'s. Чтобы создать связь, перейдём к модели `user.model.ts`:
   1. Создадим столбец `roleId` и с помощью декоратора укажем, что он является `ForeignKey` для модели `Roles` с помощью декоратора `@ForeignKey`;
   2. С помощью декоратора `@BelongsTo` создадим связь с моделью `Roles`;
    ```TypeScript
    //TypeScript
   //📁src/user/user.model.ts
   import {Table, Column, Model, PrimaryKey, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
   import {ApiProperty} from "@nestjs/swagger";
   import {Role} from "../roles/roles.model";
   
   interface UserCreationAttribute {
        email: string;
        password: string
   }
   
   @Table({tableName: 'users-nest', timestamps: false})
   export class User extends Model<User, UserCreationAttribute> {
        @ApiProperty({example: '1', description: 'ID пользователя'})
        @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
        id: number;
        @ApiProperty({example: 'placeholder@gmail.com', description: 'Почтовый адрес'})
        @Column({type: DataType.STRING, unique: true, allowNull: false})
        email: string;
        @ApiProperty({example: 'qwerty123', description: 'Пароль'})
        @Column({type: DataType.STRING, allowNull: false})
        password: string;
        @ApiProperty({example: 'true', description: 'Забанен ли'})
        @Column({type: DataType.BOOLEAN, defaultValue: false, allowNull: false})
        banned: boolean;
   
        @ApiProperty({example: '1', description: 'ID роли'})
        @ForeignKey(() => Roles,)
        @Column({type: DataType.INTEGER})
        roleId: number
   
        @BelongsTo(() => Roles, {onDelete: 'cascade'})
        roles: Roles
   }
   ```
2. А в `roles.model.ts` укажем, что роль может иметь множество юзеров с помощью `@HasMany(()=>User)users: User[]`:
    ```TypeScript
    //TypeScript
   //📁src/roles/roles.model.ts
   import {Table, Column, Model, DataType} from 'sequelize-typescript';
   import {ApiProperty} from "@nestjs/swagger";
   import {User} from "../user/user.model";
   
   //Создаём интерфейс, в котором указываем какие свойства будем указывать вручную при создании роли
   interface RoleCreationAttribute {
        role: string
   }
   
   @Table({tableName: 'roles-nest', timestamps: false})
   export class Roles extends Model<Roles, RoleCreationAttribute> {
        @ApiProperty({example: '1', description: 'ID роли'})
        @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
        id: number;
        @ApiProperty({example: 'Администратор', description: 'Название роли'})
        @Column({type: DataType.STRING, unique: true, allowNull: false})
        role: string;
   
        @ApiProperty({description: 'Одна роль имеет множество пользователей'})
        @HasMany(()=>User)
        users: User[]
   }
   ```
### Создание сервиса для Roles
1. В файле `roles.service.ts` заинжектим модель `Role` и создадим два метода: `createRole` и `getRoleByValue`:
    ```TypeScript
    //TypeScript
   //📁src/roles/roles.service.ts
   
   import { Injectable } from '@nestjs/common';
   import {CreateRoleDto} from "./dto/create-role.dto";
   import {InjectModel} from "@nestjs/sequelize";
   import {Roles} from "./roles.model";
   
   @Injectable()
   export class RolesService {
   constructor(@InjectModel(Roles) private roleRepository: typeof Roles) {
   }
   
       async createRole(dto: CreateRoleDto){
           const role = await this.roleRepository.create(dto);
           return role;
       }
   
       async getRoleByValue(value: string) {
           const role = this.roleRepository.findOne({where: {role: value}})
           return role;
       }
   }
   ```
    ```TypeScript
    //TypeScript
   //📁src/roles/dto/create-role.dto.ts
   import {ApiProperty} from "@nestjs/swagger";
   
   export class CreateRoleDto {
        @ApiProperty({example: 'Администратор', description: 'Название роли'})
        readonly role: string;
   }
   ```
### Создание контроллера для Roles
1. Создадим два эндпоинта. В эндпоинте `@Get(’:/value’)` с помощью `URI` параметра достаём значение `value`:
    ```TypeScript
    //TypeScript
   //📁src/roles/roles.controller.ts
   
   import {Body, Controller, Post, Get, Param} from '@nestjs/common';
   import {RolesService} from "./roles.service";
   import {CreateRoleDto} from "./dto/create-role.dto";
   
   @Controller('roles')
   export class RolesController {
   constructor(private rolesService: RolesService) {
   }
   
       @Post()
       create(@Body() dto: CreateRoleDto) {
           return this.rolesService.createRole(dto)
       }
   
       @Get('/:value')
       getByName(@Param('value') value: string){
           return this.rolesService.getRoleByValue(value);
       }
   }   
   ```
### Взаимодействие сервисов Roles и User
1. При создании пользователя необходимо ему присваивать какую-то роль. Чтобы мы имели доступ к сервису `Roles` из сервиса `User` необходимо сделать несколько действий:
   1. В `roles.module.ts` необходимо в `exports` указать `roles.service.ts` (т.е. мы экспортируем сервис):
      ```TypeScript
      //TypeScript
      //📁src/roles/roles.module.ts
      import { Module } from '@nestjs/common';
      import { RolesController } from './roles.controller';
      import { RolesService } from './roles.service';
      import {SequelizeModule} from "@nestjs/sequelize";
      import {Roles} from "./roles.model";

      @Module({
      imports: [SequelizeModule.forFeature([Roles])],
      controllers: [RolesController],
      providers: [RolesService],
      exports: [RolesService]
      })
      export class RolesModule {}
      ```
   2. Теперь необходимо в `user.module.ts` импортировать весь модуль `roles.module.ts`:
      ```TypeScript
      //TypeScript
      //📁src/user/user.module.ts
      import { Module } from '@nestjs/common';
      import {SequelizeModule} from "@nestjs/sequelize";
      import {User} from "./user.model";
      import { UserController } from './user.controller';
      import { UserService } from './user.service';
      import {RolesModule} from "../roles/roles.module";
   
      @Module({
         imports: [SequelizeModule.forFeature([User]), RolesModule],
         controllers: [UserController],
         providers: [UserService]
      })
      export class UserModule {}
      ```
   3. После чего мы можем использовать `RolesService` в `user.service.ts`:
      ```TypeScript
      //TypeScript
      //📁src/user/user.service.ts
      import { Injectable } from '@nestjs/common';
      import {InjectModel} from "@nestjs/sequelize";
      import {User} from "./user.model";
      import {CreateUserDto} from "./dto/create-user.dto";
      import {RolesService} from "../roles/roles.service";

      @Injectable()
      export class UserService {
      constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) {}

      async getAllUsers(){
        const users = this.userRepository.findAll();
        return users;
        }

      async createUser(dto: CreateUserDto){
        const user = await this.userRepository.create(dto)
        return user;
        }
      }
      ```
2. После того как создадим юзера сделает `update` и добавим ему роль:
   ```TypeScript
   //TypeScript
   //📁src/user/user.service.ts
   import { Injectable } from '@nestjs/common';
   import {InjectModel} from "@nestjs/sequelize";
   import {User} from "./user.model";
   import {CreateUserDto} from "./dto/create-user.dto";
   import {RolesService} from "../roles/roles.service";
   
   @Injectable()
   export class UserService {
      constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) {}
   
      async getAllUsers(){
         const users = this.userRepository.findAll();
         return users;
      }
   
      async createUser(dto: CreateUserDto){
         const user = await this.userRepository.create(dto)
   
         //Вытаскиваем роль которая называется USER
         const role = await this.roleService.getRoleByValue('USER');
   
         //Делаем update, обращаемся к связи roles(⚠️не к столбцу roleid) и указываем id
         await user.$set('roles', role.id);
         return user;
      }
   }
   ```
3. Дополним метод `getAllUsers`. Если указать `findAll({include: true;})`, то можем получить джоины для всех связанных таблиц:
   ```TypeScript
   //TypeScript
   //📁src/user/user.service.ts
   import { Injectable } from '@nestjs/common';
   import {InjectModel} from "@nestjs/sequelize";
   import {User} from "./user.model";
   import {CreateUserDto} from "./dto/create-user.dto";
   import {RolesService} from "../roles/roles.service";
   
   @Injectable()
   export class UserService {
   constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) {}
   
       async getAllUsers(){
           const users = this.userRepository.findAll({include: {all: true});
           return users;
       }
   
       async createUser(dto: CreateUserDto){
           const user = await this.userRepository.create(dto)
   
           //Вытаскиваем роль которая называется USER
           const role = await this.roleService.getRoleByValue('USER');
   
           //Делаем update, обращаемся к связи roles(⚠️не к столбцу roleid) и указываем id
           await user.$set('roles', role.id);
           user.roles = role; //⚠️Костыль, чтобы в возвращаем объекте была роль
           return user;
       }
   }
   ```
<hr/>

## Создание модуля Auth
1. Создаём модуль, контроллер и сервис с помощью Nest CLI `nest generate resource auth`.<br> Так же нужно остановить пакет для работы с __JWT__ и __bcryptjs__ для шифрования пароля: `npm install @nestjs/jwt bcryptjs`
### Создание контроллера Auth
1. В конструктор класса контроллера заинжектим `AuthService`, после чего создадим два POST метода:
   1) `login(@Body() userDto: **CreateUserDto**)` - метод для авторизации;
   2) `registration(@Body() userDto: **CreateUserDto**)` - метод для регистрации.
   ```TypeScript
   //TypeScript
   //📁src/auth/auth.controller.ts
   import {Controller, Post, Body} from '@nestjs/common';
   import {ApiTags} from "@nestjs/swagger";
   import {CreateUserDto} from "../user/dto/create-user.dto";
   import {AuthService} from "./auth.service";
   
   @ApiTags('Авторизация')
   @Controller('auth')
   export class AuthController {
        constructor(private authService: AuthService) {
        }
        @Post('/login')
        login(@Body() userDto: CreateUserDto){
        return this.authService.login(userDto);
        }
   
       @Post('/registration')
       registration(@Body() userDto: CreateUserDto){
           return this.authService.registration(userDto);
       }
   }
   ```
### Создание сервиса Auth
#### Получаем доступ к сервису User из сервиса Auth
1. В `auth.service.ts` реализуем методы для **логина** и **регистрации**. Нужно будет работать с данными юзерами, поэтому необходимо получить доступ к `user.service.ts`
   1) В `auth.service.ts` в конструкторе инициализируем переменную `userService`:
    ```TypeScript
   //TypeScript
    //📁src/user/user.service.ts
    import {Injectable} from '@nestjs/common';
    import {CreateUserDto} from "../user/dto/create-user.dto";
    import {UserService} from "../user/user.service";
    
    @Injectable()
    export class AuthService {
        constructor(private userService: UserService) {
        }
    
        async login(userDto: CreateUserDto){
        }
    
        async registration(userDto: CreateUserDto){
        }
    }
    ```
2. Переходим в `auth.module.ts`, в `imports` указываем модуль, в котором находится необходимый метод. (В данном случае `UserService` находится в `UserModule`, поэтому импоритруем его):
    ```TypeScript
   //TypeScript
    //📁src/auth/auth.module.ts
    import { Module } from '@nestjs/common';
    import { AuthService } from './auth.service';
    import { AuthController } from './auth.controller';
    import {UserModule} from "../user/user.module";
    
    @Module({
      providers: [AuthService],
      controllers: [AuthController],
      imports: [UserModule] // <--
    })
    export class AuthModule {}
    ```
3. Теперь переходим к модулю `user.module.ts` и укажем в `exports` сервис, который нужно экспортировать. (В данном случае `UserService`):
    ```TypeScript
   //TypeScript
    //📁src/user/user.module.ts
    
    import { Module } from '@nestjs/common';
    import {SequelizeModule} from "@nestjs/sequelize";
    import {User} from "./user.model";
    import { UserController } from './user.controller';
    import { UserService } from './user.service';
    import {RolesModule} from "../roles/roles.module";
    
    @Module({
        imports: [SequelizeModule.forFeature([User]), RolesModule],
        controllers: [UserController],
        providers: [UserService],
        exports: [UserService] // <--
    })
    export class UserModule {}
    ```
#### JWT, авторизация, регистрация, генерирование токена
1. Для начала необходимо реализовать метод для проверки существования пользователя. Перейдём в `user.service.ts` и реализуем метод `getUserByEmail`:
    ```TypeScript
   //TypeScript
    //📁src/user/user.service.ts
    
    import { Injectable } from '@nestjs/common';
    import {InjectModel} from "@nestjs/sequelize";
    import {User} from "./user.model";
    import {CreateUserDto} from "./dto/create-user.dto";
    import {RolesService} from "../roles/roles.service";
    
    @Injectable()
    export class UserService {
        constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) {}
    
        async getAllUsers(){
            const users = this.userRepository.findAll({include: {all: true}});
            return users;
        }
    
        async createUser(dto: CreateUserDto){
            const user = await this.userRepository.create(dto)
            const role = await this.roleService.getRoleByValue('USER');
            await user.$set('roles', role.id);
            user.roles = role; //⚠️ Костыль, чтобы в возвращаем объекте была роль
            return user;
        }
    
        async getUserByEmail(email: string){
            const user = await this.userRepository.findOne({where: {email: email}, include: {all: true}});
            return user;
        }
    }
    ```
2. В `auth.module.ts` импортируем **`JwtModule.register`**, указываем секретный ключ и срок годности токена:
    ```TypeScript
   //TypeScript
    //📁src/auth/auth.module.ts
    import { Module } from '@nestjs/common';
    import { AuthService } from './auth.service';
    import { AuthController } from './auth.controller';
    import {UserModule} from "../user/user.module";
    import {JwtModule} from "@nestjs/jwt";
    import * as process from "process";
    import {configModule} from "../common/config.root";
    
    @Module({
      providers: [AuthService],
      controllers: [AuthController],
      imports: [
      configModule,
      UserModule,
      JwtModule.register({
        secret: process.env.SECRET_KEY,
        signOptions: {
          expiresIn: '24h'
        }
      })
      ]
    })
    export class AuthModule {}
    ```
3. В `auth.service.ts` реализуем методы `registration`, `generateToken`, `login`, `validateuser`, `verifyToken`:
   1. `registration(userDto: CreateUserDto)` - проверяем есть ли такой юзер, если нет, то хэшируем пароль и создаём его, а также генерируем токен;
   2. `generateToken(user: User)` - генерирует токен;
   3. `login(userDto: CreateUserDto)` - авторизация, после успешной авторизации генерируется токен;
   4. `validateUser(userDto: CreateUserDto)` - проверяет есть ли такой юзер в БД, затем сравнивает пароли;
   5. `verifyToken(authHeader)` - проверка токена из заголовка;

    ```TypeScript
   //TypeScript
    //📁src/auth/auth.service.ts
    
    import {HttpException, HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
    import {CreateUserDto} from "../user/dto/create-user.dto";
    import {UserService} from "../user/user.service";
    import {JwtService} from "@nestjs/jwt";
    import * as bcrypt from 'bcryptjs'
    import {User} from "../user/user.model";
    
    @Injectable()
    export class AuthService {
        constructor(private userService: UserService, private jwtService: JwtService) {
        }
    
        async login(userDto: CreateUserDto){
            const user = await this.validateUser(userDto);
            return this.generateToken(user)
        }
    
        async registration(userDto: CreateUserDto){
            const candidate = await this.userService.getUserByEmail(userDto.email);
            if (candidate){
                throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST)
            }
            const hashPassword =await bcrypt.hash(userDto.password, 5);
            const user = await this.userService.createUser({...userDto, password: hashPassword})
            return this.generateToken(user)
        }
    
        private async generateToken(user: User) {
            const payload = {email: user.email, id: user.id, role: user.roles}
            return {
                token: this.jwtService.sign(payload)
            }
        }
    
        private async validateUser(userDto: CreateUserDto) {
            const user = await this.userService.getUserByEmail(userDto.email)
    
            if (user){
                const passwordEquals = await bcrypt.compare(userDto.password, user.password)
                if (passwordEquals){
                    return user
                }
            }
            throw new UnauthorizedException({message: 'Неправильный email или пароль'})
        }
   	verifyToken(authHeader: string){
	        try {
	            //Вытаскиваем Authorization из header запроса
	            const bearer = authHeader.split(' ')[0]
	            const token = authHeader.split(' ')[1]
	            //Если тип токена не Bearer или токена нет, то ошибка
	            if (bearer !=='Bearer' || !token){
	                throw new UnauthorizedException({message: 'Пользователь не авторизован'})
	            }
	            //Проверяем токен, если токен невалидный, то ошибка, если валидный - данные.
	            return this.jwtService.verify(token);
	        }
	        catch (e) {
	            throw new UnauthorizedException({message: 'Пользователь не авторизован'})
	        }
	    }
    }
    ```
### Создание Guard для ограничения доступа неавторизированным пользователям
Благодаря гвардам можно запрещать доступ к эндпоинтам по какому-либо условию.
1. В папке `auth` создадим гвард `jwt-auth.guard.ts`. Класс должен быть инжектируемым (декоратор `@Injectable`). Также этот класс должен имплементировать интерфейс `CanActivate`. В качестве аргументов эта функция принимает `context`. Суть этой функции в том, что когда она возвращает `false` - доступ **запрещён**, `true` - **разрешён**.
    ```TypeScript
   //TypeScript
    //📁src/auth/jwt-auth.guard.ts
   import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
   import {Observable} from "rxjs";
   import {AuthService} from "./auth.service";
   
   @Injectable()
   export class JwtAuthGuard implements CanActivate {
        constructor(private authService: AuthService) {
        }
        canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
            const request = context.switchToHttp().getRequest()
            const autHeader = request.headers.authorization;
            return this.authService.verifyToken(autHeader)
        }
   }
    ```
2. Из `auth.module.ts` экспортируем `AuthService` (т.к. в Гварде вызывается сервис из этого модуля):
   <br>
   >⚠️Нам необходимо использовать только что созданный `@Guard` в модуле `User`. Т.к. модули `Auth` и `User` используются друг в друге, то получается кольцевая зависимость. Чтобы исправить эту ошибку, необходимо в модуль `Auth` импортировать `User` с помощью `forwardRef`: `forwardRef(()=>UserModule)`
    ```TypeScript
   //TypeScript
    //📁src/auth/auth.module.ts
    
    import {Module} from '@nestjs/common';
    import { AuthService } from './auth.service';
    import { AuthController } from './auth.controller';
    import {UserModule} from "../user/user.module";
    import {JwtModule} from "@nestjs/jwt";
    import * as process from "process";
    import {configModule} from "../common/config.root";
    
    @Module({
      providers: [AuthService],
      controllers: [AuthController],
      imports: [
      configModule,
      //Для решения проблемы с кольцевой зависимостью
      forwardRef(()=>UserModule),
      JwtModule.register({
        secret: process.env.SECRET_KEY,
        signOptions: {
          expiresIn: '24h'
        }
      })
      ],
      //Экспортируем 
      exports: [
          AuthService,
      ]
    })
    export class AuthModule {}
    ```
3. `@Guard` будем использовать в модуле `User`. Как было сказано выше, между модулями образуется кольцевая зависимость, поэтому `AuthModule` необходимо импортировать в модуль `User` с помощью `forwardRef`: `forwardRef(()=>AuthModule)`:
    ```TypeScript
   //TypeScript
    //📁src/user/user.module.ts
    import {forwardRef, Module} from '@nestjs/common';
    import {SequelizeModule} from "@nestjs/sequelize";
    import {User} from "./user.model";
    import { UserController } from './user.controller';
    import { UserService } from './user.service';
    import {RolesModule} from "../roles/roles.module";
    import {AuthModule} from "../auth/auth.module";
    
    @Module({
        imports: [
            SequelizeModule.forFeature([User]),
            RolesModule,
    		//Для решения проблемы кольцевой зависимости
            forwardRef(()=>AuthModule),
        ],
        controllers: [UserController],
        providers: [UserService],
        exports: [UserService]
    })
    export class UserModule {}
    ```
   >💡 Т.е. если необходимо импортировать модули друг в друга, необходимо это делать с помощью функции `forwardRef`.
4. Перейдём к контроллеру `user.controller.ts`, методу `getAllUsers` добавим декоратор `@UseGuards`, который в качестве аргументов, будет принимать созданный `JwtAuthGuard`:
    ```TypeScript
    //TypeScript
    //📁src/user/user.controller.ts
    
    import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
    import {UserService} from "./user.service";
    import {CreateUserDto} from "./dto/create-user.dto";
    import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
    import {User} from "./user.model";
    import {JwtAuthGuard} from "../auth/jwt-auth.guard";
    
    @ApiTags('Пользователи')
    @Controller('users')
    export class UserController {
        constructor(private readonly userService: UserService) {}
    
        @ApiOperation({summary: 'Создание пользователя'})
        @ApiResponse({status: 200, type: User})
        @Post()
        createUser(@Body() userDto: CreateUserDto){
            return this.userService.createUser(userDto)
        }
    
        @ApiOperation({summary: 'Получить список пользователей'})
        @ApiResponse({status: 200, type: [User]})
        //Гвард
        @UseGuards(JwtAuthGuard)
        @Get()
        getAllUsers() {
            return this.userService.getAllUsers()
        }
    }
    ```
5. Теперь для того, чтобы получить доступ к эндпоинту `localhost:4001/users` с методом GET необходимо в `Headers` указывать `Authorization` c токеном.
### Roles Guard для ограничения доступа по ролям. Создание собственного декоратора
1. Создадим декоратор `roles-auth.decorator.ts`. `ROLE_KEY` - константа, по которой мы сможем обращаться к декоратору из Гварда:
    ```TypeScript
    //TypeScript
    //📁src/auth/roles-auth.decorator.ts
    
    import {SetMetadata} from "@nestjs/common";
    
    export const ROLE_KEY = 'role'
    
    //Декоратор в качестве аргумента принимает строку с ролью
    export const Role = (role: string)=> SetMetadata(ROLE_KEY, role)
    ```
2. Создадим гвард `roles-guard.ts`. Импортируем константу `ROLE_KEY`, для того, чтобы вытащить значение из декоратора и использовать его. В конструкторе класса необходимо инициализировать `private reflector: Reflector`. С помощью него и константы можем вытащить значение, которое передадим декоратору в качестве аргументов:
    ```TypeScript
    //TypeScript
    //📁src/auth/roles-guard.ts
    
    import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
    import {Reflector} from "@nestjs/core";
    import {ROLE_KEY} from "./roles-auth.decorator";
    import {UserService} from "../user/user.service";
    import {AuthService} from "./auth.service";
    
    @Injectable()
    export class RolesGuard implements CanActivate {
        constructor(private authService: AuthService, private userService: UserService, private reflector: Reflector) {
        }
    
        async canActivate(context: ExecutionContext): Promise<boolean> {
    		//С помощью ключа и рефлектора достаём значение, которое передадим декоратору в качестве аргументов
            const requiredRole = this.reflector.getAllAndOverride(ROLE_KEY, [context.getHandler(), context.getClass()])
    
            if (!requiredRole) {
                return true;
            }
    
            const request = context.switchToHttp().getRequest();
            //Вытаскиваем Authorization из header запроса
            const authHeader = request.headers.authorization;
    		//Проверяем токен
            const user = this.authService.verifyToken(authHeader)
    		//Проверяем в БД, есть ли у такого юзера требуемая роль
            const accessIsAllowed = await this.userService.verifyUserRole(user.email, requiredRole)
    
            if (!accessIsAllowed) {
                throw new ForbiddenException({message: 'Доступ ограничен'})
            }
            return true;
        }
    }
    ```
3. Для того, чтобы проверить есть ли у юзера такая роль, в в `user.service.ts` добавим метод `verifyUserRole(email: string, neededRole: string)`:
    ```TypeScript
    //TypeScript
    //📁src/user/user.service.ts
    import { Injectable } from '@nestjs/common';
    import {InjectModel} from "@nestjs/sequelize";
    import {User} from "./user.model";
    import {CreateUserDto} from "./dto/create-user.dto";
    import {RolesService} from "../roles/roles.service";
    import {Roles} from "../roles/roles.model";
    
    @Injectable()
    export class UserService {
        constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) {}
    
        async getAllUsers(){
            const users = this.userRepository.findAll({include: {all: true}});
            return users;
        }
    
        async createUser(dto: CreateUserDto){
            const user = await this.userRepository.create(dto)
            const role = await this.roleService.getRoleByValue('USER');
            await user.$set('roles', role.id);
            user.roles = role; //Костыль, чтобы в возвращаем объекте была роль
            return user;
        }
    
        async getUserByEmail(email: string){
            const user = await this.userRepository.findOne({where: {email: email}, include: {all: true}});
            return user;
        }
    
        async verifyUserRole(email: string, neededRole: string){
            return await this.userRepository.findOne({where: {email: email}, include: { model: Roles, required: true, where: {role: neededRole}}})
        }
    }
    ```
4. Перейдём в `user.controller.ts`, и установим написанный гвард и декоратор для метода `getAllUsers`. С помощью `@Role` - укажем для какой роли будет доступен эндпоинт. После чего добавляем наш гвард с помощью `@UseGuards(RolesGuard)`:
    ```TypeScript
    //TypeScript
    //📁src/user/user.controller.ts
    
    import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
    import {UserService} from "./user.service";
    import {CreateUserDto} from "./dto/create-user.dto";
    import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
    import {User} from "./user.model";
    import {JwtAuthGuard} from "../auth/jwt-auth.guard";
    import {Role} from "../auth/roles-auth.decorator";
    import {RolesGuard} from "../auth/roles.guard";
    
    @ApiTags('Пользователи')
    @Controller('users')
    export class UserController {
        constructor(private readonly userService: UserService) {
        }
    
        @ApiOperation({summary: 'Создание пользователя'})
        @ApiResponse({status: 200, type: User})
        @Post()
        createUser(@Body() userDto: CreateUserDto) {
            return this.userService.createUser(userDto)
        }
    
        @ApiOperation({summary: 'Получить список пользователей'})
        @ApiResponse({status: 200, type: [User]})
        @ApiBearerAuth()
        //@UseGuards(JwtAuthGuard)
        @Role('ADMIN')
        @UseGuards(RolesGuard)
        @Get()
        getAllUsers() {
            return this.userService.getAllUsers()
        }
    }
    ```
### Раздача ролей и банов
1. В `user.controller.ts` создадим 2 эндпоинта **POST** запросами: `‘/role’` и ‘`/ban’`:
    ```TypeScript
    //TypeScript
    //📁src/user/user.controller.ts
    
    import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
    import {UserService} from "./user.service";
    import {CreateUserDto} from "./dto/create-user.dto";
    import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
    import {User} from "./user.model";
    import {JwtAuthGuard} from "../auth/jwt-auth.guard";
    import {Role} from "../auth/roles-auth.decorator";
    import {RolesGuard} from "../auth/roles.guard";
    import {AddRoleDto} from "./dto/add-role.dto";
    import {BanUserDto} from "./dto/ban-user.dto";
    
    @ApiTags('Пользователи')
    @Controller('users')
    export class UserController {
        constructor(private readonly userService: UserService) {
        }
    
        @ApiOperation({summary: 'Создание пользователя'})
        @ApiResponse({status: 200, type: User})
        @Post()
        createUser(@Body() userDto: CreateUserDto) {
            return this.userService.createUser(userDto)
        }
    
        @ApiOperation({summary: 'Получить список пользователей'})
        @ApiResponse({status: 200, type: [User]})
        @ApiBearerAuth()
        @UseGuards(JwtAuthGuard)
        @Role('ADMIN')
        @UseGuards(RolesGuard)
        @Get()
        getAllUsers() {
            return this.userService.getAllUsers()
        }
    
        @ApiOperation({summary: 'Выдать роль'})
        @ApiResponse({status: 200})
        @ApiBearerAuth()
        @UseGuards(JwtAuthGuard)
        @Role('ADMIN')
        @UseGuards(RolesGuard)
        @Post('/role')
        addRole(@Body() dto: AddRoleDto) {
            return this.userService.addRole(dto)
        }
        @ApiOperation({summary: 'Забанить пользователя'})
        @ApiResponse({status: 200})
        @ApiBearerAuth()
        @UseGuards(JwtAuthGuard)
        @Role('ADMIN')
        @UseGuards(RolesGuard)
        @Post('/ban')
        ban(@Body() dto: BanUserDto) {
            return this.userService.ban(dto)
        }
    }
    ```
2. Создадим 2 dto:
    ```TypeScript
    //TypeScript
    //📁src/user/dto/add-role.dto.ts
    
    import {ApiProperty} from "@nestjs/swagger";
    
    export class AddRoleDto {
        @ApiProperty({example: 'USER', description: 'Название роли'})
        readonly value: string;
        @ApiProperty({example: 1, description: 'ID пользователя'})
        readonly userId: number;
    }
    ```
    ```TypeScript
    //TypeScript
    //📁src/user/dto/ban-user.dto.ts
    
    import {ApiProperty} from "@nestjs/swagger";
    
    export class BanUserDto {
        @ApiProperty({example: 1, description: 'ID пользователя'})
        readonly userId: number;
    }
    ```
3. В `user.service.ts` создадим методы `addRole(dto: AddRoleDto)` и `ban(dto: BanUserDto)`:
    ```TypeScript
     //TypeScript
    //📁src/user/dto/user.service.ts
    
    import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
    import {InjectModel} from "@nestjs/sequelize";
    import {User} from "./user.model";
    import {CreateUserDto} from "./dto/create-user.dto";
    import {RolesService} from "../roles/roles.service";
    import {Roles} from "../roles/roles.model";
    import {AddRoleDto} from "./dto/add-role.dto";
    import {BanUserDto} from "./dto/ban-user.dto";
    
    @Injectable()
    export class UserService {
        constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) {
        }
    
        async getAllUsers() {
            const users = this.userRepository.findAll({include: {all: true}});
            return users;
        }
    
        async createUser(dto: CreateUserDto) {
            const user = await this.userRepository.create(dto)
            const role = await this.roleService.getRoleByValue('USER');
            await user.$set('roles', role.id);
            user.roles = role; //Костыль, чтобы в возвращаем объекте была роль
            return user;
        }
    
        async getUserByEmail(email: string) {
            const user = await this.userRepository.findOne({where: {email: email}, include: {all: true}});
            return user;
        }
    
        async verifyUserRole(email: string, neededRole: string) {
            return await this.userRepository.findOne({
                where: {email: email},
                include: {model: Roles, required: true, where: {role: neededRole}}
            })
        }
    
        async addRole(dto: AddRoleDto) {
            const user = await this.userRepository.findByPk(dto.userId);
            const role = await this.roleService.getRoleByValue(dto.value);
            if (role && user) {
                console.log(role.id)
                await user.update({roleId: role.id})
                return
            }
            throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND)
    
        }
    
        async ban(dto: BanUserDto) {
            const user = await this.userRepository.findByPk(dto.userId);
            if (user) {
                user.banned = true;
                await user.save();
                return
            }
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND)
        }
    }
    ```
<hr/>

## Валидация. Pipes и class-validator
1. Для работы с валидацией необходимо установить 2 NPM пакета - **class-validator** для валидации и **class-transformer** для преобразования данных. `npm install class-validator class-transformer`;
2. Реализуем валидацию для `create-user.dto.ts`. Библиотека **class-validator** предоставляет возможность осуществлять валидацию с помощьюдекораторов (пример: `@IsEmail`, `@IsString` и т.д.):
    ```TypeScript
    //TypeScript
    //📁src/user/dto/create-user.dto.ts
    
    import {ApiProperty} from "@nestjs/swagger";
    import {IsEmail, IsString, Length} from "class-validator";
    
    export class CreateUserDto {
        @ApiProperty({example: 'test666@gmail.com', description: 'Почтовый адрес'})
        @IsString({message: 'Должно быть строкой'})
        @IsEmail({}, {message: 'Некорректный email'})
        readonly email: string;
    
        @ApiProperty({example: 'qwerty', description: 'Пароль'})
        @IsString({message: 'Должно быть строкой'})
        @Length(6, 12, {message: 'Не меньше 6 и не больше 12'} )
        readonly password: string;
    
        @ApiProperty({example: '1', description: 'ID роли'})
        readonly roleId: number;
    }
    
    ```
3. Пайпы имеют 2 предназначения:
   - Преобразование входных данных;
   - Валидация входных данных.
4. Создадим папку `pipes` и файл `validation.pipe.ts`. Это будет `@Injectable` класс, который имплементирует интерфейс `PipeTransform`. Внутри класса есть метод `transform` с 2 аргументами:
   1. `value` - входящее значение непреобразованное значение (допустим `{ email: 'test666', password: 'qwerty', roleId: 'asdasd' }` )
   2. `metadata` - тут находится информации, какое dto нужно использовать для преобразования и где находятся данные в запросе (пример: `{ metatype: [class CreateUserDto], type: 'body', data: undefined }` )
    ```TypeScript
    //TypeScript
    //📁src/user/pipes/validation.pipe.ts
    
    import {ArgumentMetadata, Injectable, PipeTransform} from "@nestjs/common";
    import {plainToClass} from "class-transformer";
    import {validate, ValidationError} from "class-validator";
    import {ValidationException} from "../exceptions/validation.exception";
    
    type FormattedValidationErrorType = {
        field: string;
        message: string;
    }
    
    @Injectable()
    export class ValidationPipe<T> implements PipeTransform<T> {
        async transform<T>(value: T, metadata: ArgumentMetadata): Promise<T | never> {
    				
    				//С помощью plainToClass преобразуем данные с помощью dto из metadata.metatype
    				//Пример значения obj: CreateUserDto { email: 'test666', password: 12, roleId: 'asdasd' }
            const obj: ValidationError = plainToClass(metadata.metatype, value)
            const errors: ValidationError[] = await validate(obj)
    
            if (errors.length) {
    
                const validationErrors: FormattedValidationErrorType[] = errors.reduce((acc: FormattedValidationErrorType[], validationError: ValidationError) => {
                    Object.values(validationError.constraints).forEach(constraint => {
                        const field = validationError.property;
                        const message = constraint;
                        acc.push({field, message})
                    })
    
                    return acc
                }, [])
    
                throw new ValidationException(validationErrors)
            }
            return value;
        }
    }
    ```
5. Создадим свой класс для ошибок при валидации `validation.exception.ts` в папке `exceptions`:
    ```TypeScript
    //TypeScript
    //📁src/exceptions/validation.exception.ts
    
    import {HttpException, HttpStatus} from "@nestjs/common";
    
    export class ValidationException extends HttpException {
        constructor(validationErrors) {
            super({status: HttpStatus.BAD_REQUEST, validationErrors, message: 'Ошибка валидации'}, HttpStatus.BAD_REQUEST);
        }
    }
    ```
6. Используем пайп `ValidationPipe` в контроллере `user.controller.ts` у метода `createUser`. С помощью декоратора `@UsePipe`:
    ```TypeScript
    //TypeScript
    //📁src/user/user.controller.ts
    
    import {Body, Controller, Get, Post, UseGuards, UsePipes} from '@nestjs/common';
    import {UserService} from "./user.service";
    import {CreateUserDto} from "./dto/create-user.dto";
    import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
    import {User} from "./user.model";
    import {JwtAuthGuard} from "../auth/jwt-auth.guard";
    import {Role} from "../auth/roles-auth.decorator";
    import {RolesGuard} from "../auth/roles.guard";
    import {AddRoleDto} from "./dto/add-role.dto";
    import {BanUserDto} from "./dto/ban-user.dto";
    import {ValidationPipe} from "../pipes/validation.pipe";
    
    @ApiTags('Пользователи')
    @Controller('users')
    export class UserController {
        constructor(private readonly userService: UserService) {
        }
    
        @ApiOperation({summary: 'Создание пользователя'})
        @ApiResponse({status: 200, type: User})
        @UsePipes(ValidationPipe)
        @Post()
        createUser(@Body() userDto: CreateUserDto) {
            return this.userService.createUser(userDto)
        }
    
        @ApiOperation({summary: 'Получить список пользователей'})
        @ApiResponse({status: 200, type: [User]})
        @ApiBearerAuth()
        @UseGuards(JwtAuthGuard)
        @Role('ADMIN')
        @UseGuards(RolesGuard)
        @Get()
        getAllUsers() {
            return this.userService.getAllUsers()
        }
    
        @ApiOperation({summary: 'Выдать роль'})
        @ApiResponse({status: 200})
        @ApiBearerAuth()
        @UseGuards(JwtAuthGuard)
        @Role('ADMIN')
        @UseGuards(RolesGuard)
        @Post('/role')
        addRole(@Body() dto: AddRoleDto) {
            return this.userService.addRole(dto)
        }
        @ApiOperation({summary: 'Забанить пользователя'})
        @ApiResponse({status: 200})
        @ApiBearerAuth()
        @UseGuards(JwtAuthGuard)
        @Role('ADMIN')
        @UseGuards(RolesGuard)
        @Post('/ban')
        ban(@Body() dto: BanUserDto) {
            return this.userService.ban(dto)
        }
    }
    ```
Теперь если входящие данные не пройдут валидацию, то мы получим вот такой **ответ**:
    ```json
   //JSON
    {
      "status": 400,
      "validationErrors": [
        {
          "field": "email",
          "message": "Некорректный email"
        },
        {
          "field": "password",
          "message": "Не меньше 6 и не больше 12"
        },
        {
          "field": "password",
          "message": "Должно быть строкой"
        }
      ],
      "message": "Ошибка валидации"
    }
    ```
<hr/>

## Чем отличается pipe от middleware в NestJS
В NestJS middleware и pipes - это два разных механизма, которые используются для обработки запросов HTTP в приложении.

**Middleware** - это функции, которые выполняются перед или после обработки запроса HTTP. Они могут выполнять различные задачи, такие как аутентификация, логирование, обработка ошибок и т.д. Middleware представляет собой функцию, которая получает три параметра: объект запроса, объект ответа и функцию `next()`. Middleware может изменять объект запроса или ответа, а также передавать управление следующему middleware в цепочке вызовов с помощью функции `next()`. Middleware может быть глобальным (для всего приложения) или локальным (для конкретного маршрута).

**Pipes** - это механизм для валидации и трансформации данных, которые приходят в запросе HTTP. Они могут выполнять различные задачи, такие как проверка типов, преобразование данных, валидация и т.д. Pipe представляет собой класс с методом `transform()`, который получает входные данные и возвращает трансформированные данные или выбрасывает исключение в случае ошибки. Pipes могут быть глобальными (для всего приложения) или локальными (для конкретного маршрута).

Главное отличие между middleware и pipes заключается в том, что middleware обрабатывает запросы HTTP в целом, в то время как pipes обрабатывают данные в запросе HTTP. Middleware может использоваться для различных задач, включая обработку ошибок, логирование, аутентификацию и т.д. Pipes, с другой стороны, используются для проверки и преобразования данных, которые приходят в запросе HTTP.

В целом, middleware и pipes - это мощные механизмы, которые позволяют создавать гибкие и масштабируемые приложения на NestJS. Выбор конкретного механизма зависит от конкретных требований и бизнес-логики вашего приложения.
<hr/>

## Создание модулей Posts и Files
1. Создадим модули с помощью команды `nest g resource posts` и `nest g resource files`.
### Модуль Posts
1. Создадим модель `posts.model.ts`:
    ```TypeScript
    //TypeScript
    //📁src/posts/posts.model.ts
    
    import {Table, Column, Model, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
    import {User} from "../user/user.model";
    
    interface PostsCreationAttribute {
        email: string;
        password: string;
        userId: number;
        image: string;
    }
    
    @Table({tableName: 'posts-nest', timestamps: false})
    export class Posts extends Model<Posts, PostsCreationAttribute> {
        @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
        id: number;
        @Column({type: DataType.STRING, unique: true, allowNull: false})
        title: string;
        @Column({type: DataType.STRING, allowNull: false})
        content: string;
        @Column({type: DataType.STRING})
        image: string;
    
        @ForeignKey(() => User, )
        @Column({type: DataType.INTEGER})
        userId: number
    
        @BelongsTo(() => User, { onDelete: 'cascade'})
        users: User
    }
    ```
2. В модели `user.model.ts` укажем `@HasMany(()=>Posts)posts: Posts[]`;
3. В файле модуля `posts.module.ts` в импорте укажем `SequelizeModule.forFeature([Posts])`;
4. В файле модуля `database.module.ts` в импорте модуля подключения **Sequelize** в массив `models` нужно добавить модель `Posts`;
5. Создадим `create-post.dto.ts`:
    ```TypeScript
    //TypeScript
    //📁src/posts/dto/create-post.dto.ts
    
    export class CreatePostDto {
        readonly title: string;
        readonly content: string;
        readonly userId: number;
    }
    ```
6. Создадим метод `createPost` в `posts.controller.ts`. В качестве аргументов он принимает dto и image. Т.к. будем загружать изображения, необходимо использовать декораторы `@UseInterceptors(FileInterceptor('image'))` и `UploadedFile()`:
    ```TypeScript
    //TypeScript
    //📁src/posts/posts.controller.ts
    
    import {Body, Controller, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
    import { PostsService } from './posts.service';
    import {CreatePostDto} from "./dto/create-post.dto";
    import {FileInterceptor} from "@nestjs/platform-express";
    
    @Controller('posts')
    export class PostsController {
      constructor(private readonly postsService: PostsService) {}
    
      @Post()
      @UseInterceptors(FileInterceptor('image'))
      createPost(@Body() dto: CreatePostDto, @UploadedFile() image){
        return this.postsService.create(dto, image)
      }
    }
    ```
7. Создадим метод `create` в `post.service.ts`. В него необходимо заинжектить модель, а также `FilesService`. (Для того, чтобы был доступ к `FilesService` в f`iles.module.ts` его необходимо экспортировать, после чего весь `FilesModule` указать в импорте `posts.module.ts`).
    ```TypeScript
    //TypeScript
    //📁src/posts/posts.service.ts
    
    import { Injectable } from '@nestjs/common';
    import {CreatePostDto} from "./dto/create-post.dto";
    import {InjectModel} from "@nestjs/sequelize";
    import {Posts} from "./posts.model";
    import {FilesService} from "../files/files.service";
    
    @Injectable()
    export class PostsService {
    
        constructor(@InjectModel(Posts) private postRepository: typeof Posts, private filesService: FilesService) {}
        async create(dto: CreatePostDto, image:any) {
            const fileName = await this.filesService.createFile(image)
            const post = await this.postRepository.create({...dto, image: fileName})
            return post;
            
        }
    }
    ```
### Модуль Files
1. В `files.service.ts` создаём метод `createFile`. Для того, чтобы сгенерировать уникальное имя файла будем использовать пакет uuid. `npm install uuid`.
    ```TypeScript
    //TypeScript
    //📁src/files/files.service.ts
    
    import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
    import * as path from 'path'
    import * as fs from 'fs'
    import * as uuid from 'uuid'
    
    @Injectable()
    export class FilesService {
    
        async createFile(file): Promise<string> {
            try {
    			//Создаём имя файла
                const fileName = uuid.v4() + '.jpg';
    			//Помещаем файл в папку static
                const filePath = path.resolve(__dirname, '..', 'static')
    			//Если папки нет, то создаём
                if (!fs.existsSync(filePath)){
                    fs.mkdirSync(filePath, {recursive: true})
                }
                fs.writeFileSync(path.join(filePath, fileName), file.buffer)
                return fileName
            }
            catch (e) {
                throw new HttpException('Произошла ошибка при записи файла', HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }
    ```
   >⚠️ Методы с препиской `sync` (`existsSync`, `mkdirSync`, `writeFileSync`) блокируют поток. Они использованы только в демонстрации, в реальных проектах их использовать нельзя!
### Serve static
1. Мы можем загружать файлы, но не можем просматривать перейдя по ссылке. Для того, чтобы появилась возможность работать со статикой необходимо скачать пакет **serve-static** `npm install --save @nestjs/serve-static`. После чего в модуль `app.module.ts` импортируем модуль `ServeStaticModule` и в аргументах указываем путь к папке `static`.
    ```TypeScript
    //TypeScript
    //📁src/app.module.ts
    
    import { Module } from '@nestjs/common';
    import { DatabaseModule } from './database/database.module';
    import { UserModule } from './user/user.module';
    import { RolesModule } from './roles/roles.module';
    import { AuthModule } from './auth/auth.module';
    import { PostsModule } from './posts/posts.module';
    import { FilesModule } from './files/files.module';
    import * as path from 'path'
    import {ServeStaticModule} from "@nestjs/serve-static";
    
    @Module({
      imports: [
        ServeStaticModule.forRoot({
          rootPath: path.resolve(__dirname,'static'),
        }),
          DatabaseModule,
          UserModule,
          RolesModule,
          AuthModule,
          PostsModule,
          FilesModule
      ],
      controllers: [],
      providers: [],
    })
    export class AppModule {}
    ```
2. Теперь перейдя по пути http://localhost:4001/*название-файла*.jpg мы увидим загруженный файл.
<hr/>

## Начало

1. В корне проекта создадим папку `test`. В ней будут находиться сами тесты и конфиг.

    ```json
    //📁test/jest-e2e.json
    
    {
      "moduleFileExtensions": [
        "js",
        "json",
        "ts"
      ],
      "rootDir": ".",
      "testEnvironment": "node",
      "testRegex": ".e2e-spec.ts$",
      "transform": {
        "^.+\\.(t|j)s$": "ts-jest"
      }
    }
    ```

2. Тесты запускаются командой `test:e2e`. Т.к. используется библиотека **cross-env**, то необходимо в скрипте передать переменную, в которой указан какой тип файла `.env` нужно использовать во время тестов. `"test:e2e": "cross-env NODE_ENV=development jest --config ./test/jest-e2e.json”`

## e2e тесты для контроллера User (Post, Get, Delete)

### Функция describe, подключения и иницализация модуля App

1. Создадим файл `user.e2e-spec.ts` - в нём будут описаны тесты для контроллера.
   1. В функции `describe` будут описаны все тесты для контроллера;
   2. В функции `beforeEach` (выполняется до начала тестирования) происходит тестовое подключение модуля `App` и запуск приложения.
   3. В функции `afterEach` (выполняется после всех тестов) завершаем работу приложения.

    ```tsx
    //📁test/user.e2e-spec.ts
    import { Test, TestingModule } from '@nestjs/testing';
    import { AppModule } from '../src/app.module'
    import { INestApplication } from '@nestjs/common';
    import * as request from 'supertest';
    
    describe('UserController (e2e)', () => {
        let app: INestApplication;
    
        beforeEach(async () => {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [AppModule],
            }).compile();
    
            app = moduleFixture.createNestApplication();
            await app.init();
        });
    
        afterEach(async () => {
            await app.close();
        });
    
    });
    ```


### Объяснение логики создания тестов на примере теста на создание пользователя

1. Выше функции `describe` создадим объект типа `CreateUserDto`, в котором укажем тестовые данные для создания пользователя.

    ```tsx
    //📁test/user.e2e-spec.ts
    
    const testUserDto: CreateUserDto = {
        email: 'testfromjest@mail.ru',
        password: 'qwerty12354'
    }
    ```

2. В теле функции `describe` объявим переменную `createUserId`, в которую будем помещать `id` созданного пользователя. Он будет использоваться вдальнейшем.
3. В теле функции `describe` создадим функции для тестирования `it`. Она принимает 2 параметра: название теста и `callback`, в котором будет проходить тест.

    ```tsx
    //📁test/user.e2e-spec.ts
    import { Test, TestingModule } from '@nestjs/testing';
    import { AppModule } from '../src/app.module'
    import { INestApplication } from '@nestjs/common';
    import * as request from 'supertest';
    import {CreateUserDto} from "../src/user/dto/create-user.dto";
    
    const testUserDto: CreateUserDto = {
        email: 'testfromjest@mail.ru',
        password: 'qwerty12354'
    }
    
    describe('UserController (e2e)', () => {
        let app: INestApplication;
        let createdUserId: number;
    
        beforeEach(async () => {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [AppModule],
            }).compile();
    
            app = moduleFixture.createNestApplication();
            await app.init();
        });
    
        afterEach(async () => {
            await app.close();
        });
    
        it('successful: /users (POST)',   async () => {
            return await request(app.getHttpServer())
                .post('/users')
                .send(testUserDto)
                .expect(201)
                .then(({body}: request.Response)=>{
                    createdUserId = body.id;
                    expect(createdUserId).toBeDefined();
                })
        });
    });
    ```

   В **callback** функции выполняем запрос к серверу.

   1. `post(’/users’)` - `POST` запрос на эндпоинт `/users`;
   2. `send(testUserDto)` - в теле посылаем данные, которые указал в `testUserDto`;
   3. `expect(201)` - ожидаем ответ `201` (Created);
   4. В `then` указываем `callback`, в котором из `body` ответа забираем `id` и присваем его переменной `createdUserId`.
   5. С помощью функции `expect(createUserId).toBeDefined()` указываем, что мы ожидаем, что переменная определена.
4. Запускаем тест с помощью `npm test:e2e`.

### Тесты с проверкой результатов при успехе

1. Остальные тесты делают аналогичным способом. В них будем использовать переменную `createdUserId`, значение для которой получили после теста создания пользователя.

    ```tsx
    //📁test/user.e2e-spec.ts
    import { Test, TestingModule } from '@nestjs/testing';
    import { AppModule } from '../src/app.module'
    import { INestApplication } from '@nestjs/common';
    import * as request from 'supertest';
    import {CreateUserDto} from "../src/user/dto/create-user.dto";
    
    const testUserDto: CreateUserDto = {
        email: 'testfromjest@mail.ru',
        password: 'qwerty12354'
    }
    
    describe('UserController (e2e)', () => {
        let app: INestApplication;
        let createdUserId: number;
    
        beforeEach(async () => {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [AppModule],
            }).compile();
    
            app = moduleFixture.createNestApplication();
            await app.init();
        });
    
        afterEach(async () => {
            await app.close();
        });
    
        it('successful: /users (POST)',   async () => {
            return await request(app.getHttpServer())
                .post('/users')
                .send(testUserDto)
                .expect(201)
                .then(({body}: request.Response)=>{
                    createdUserId = body.id;
                    expect(createdUserId).toBeDefined();
                })
        });
    
        it('successful: /users/:id (GET)', async ()=>{
            return await request(app.getHttpServer())
                .get(`/users/${createdUserId}`)
                .expect(200)
                .then(({body}: request.Response)=>{
                    expect(body).toBeDefined()
                })
        })
    
        it('successful: /users/:id (DELETE)', async ()=>{
            return await request(app.getHttpServer())
                .delete(`/users/${createdUserId}`)
                .expect(204)
                .then(({body}: request.Response)=>{
                    expect(body).toEqual({})
                })
        })
    });
    ```


### Тест с проверкой результата при ошибке

1. В `user.controller.ts` есть `Delete` метод. В случае ошибки он возвращает в случае ошибки он возвращает код `404` с сообщанием `“Пользователь не найден”`.

    ```tsx
    //📁src/user/user.controller.ts
    import {Body,Controller, Delete,Get, HttpCode,NotFoundException,Param,Post} from '@nestjs/common';
    import { UserService } from './user.service';
    import { CreateUserDto } from './dto/create-user.dto';
    import { User } from './user.model';
    
    @Controller('users')
    export class UserController {
      constructor(private readonly userService: UserService) {}
    
      @Get(':id')
      async getUserById(@Param('id') id: number) {
        const user = await this.userService.getUserById(id);
        if(!user){
          throw new NotFoundException('Пользователь не найден')
        }
        return user;
      }
    
      @Post()
      async createUser(@Body() userDto: CreateUserDto) {
        return await this.userService.createUser(userDto);
      }
      @HttpCode(204)
      @Delete(':id')
      async delete(@Param('id') id: number){
        const deletedUser = await this.userService.deleteUser(id);
        if (!deletedUser){
          throw new NotFoundException('Пользователь не найден')
        }
        return
      }
    }
    ```

2. Тест для проверки ошибки

    ```tsx
    //📁test/user.e2e-spec.ts
    import { Test, TestingModule } from '@nestjs/testing';
    import { AppModule } from '../src/app.module'
    import { INestApplication } from '@nestjs/common';
    import * as request from 'supertest';
    
    describe('UserController (e2e)', () => {
        let app: INestApplication;
    
        beforeEach(async () => {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [AppModule],
            }).compile();
    
            app = moduleFixture.createNestApplication();
            await app.init();
        });
    
        afterEach(async () => {
            await app.close();
        });
    
        it('failed: /users/:id (DELETE)',  ()=>{
            return request(app.getHttpServer())
                .delete(`/users/${999}`)
                .expect(404, {
                    statusCode: 404,
                    message: 'Пользователь не найден',
                    error: 'Not Found'
                })
        })
    });
    ```


### Тесты с авторизацией

1. Для инициализации приложения изменим метод с `beforeEach`, на `beforeAll` (чтобы авторизация не происходила перед каждым тестом, а только в момент запуска). Аналогичное изменим `afterEach` на `afterAll`.
   1. Создадим `loginDto` где будут указаны данные для тестовой авторизации;
   2. Импортируем `cookie-parser` для работы с кукам и вызовем его до инициализации приложения;
   3. Создадим переменные `accessToken` и `refreshToken` - в них будут токены;
   4. После инициализации приложения сделаем запрос на авторизацию. Из ответа получаем `access` и `refresh` токены, их записываем в созданные выше переменные;
   5. `GET /users` разрешён только авторизованны пользователям, поэтому в тесте при написании запроса укажем заголовок `Authorization` и поместим туда `access` токен .`set('Authorization', accessToken)`;
   6. После того как все тесты завершены, необходимо выполнить запрос на выход из аккаунта. Запрос выполняется в метода `afterAll`. Помещаем в куки `refresh` токен `.set("cookie", refreshToken[0])`. ⚠️ Для корректной работы нужно использовать **cookie-parser**.

    ```tsx
    import { Test, TestingModule } from '@nestjs/testing';
    import { AppModule } from '../src/app.module'
    import { INestApplication } from '@nestjs/common';
    import * as request from 'supertest';
    import {CreateUserDto} from "../src/user/dto/create-user.dto";
    import * as cookieParser from 'cookie-parser';
    
    const testUserDto: CreateUserDto = {
        email: 'testfromjest@mail.ru',
        password: 'qwerty12354'
    }
    
    const loginDto:CreateUserDto = {
        email: "111bardak@rambler.ru",
        password: "qwerty"
    }
    
    describe('UserController (e2e)', () => {
        let app: INestApplication;
        let createdUserId: number;
        let accessToken: string;
        let refreshToken: string[];
    
        beforeAll(async () => {
            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [AppModule],
            }).compile();
    
            app = moduleFixture.createNestApplication();
            app.use(cookieParser())
            await app.init();
    
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .send(loginDto)
            accessToken = res.body.accessToken;
            refreshToken = res.get('Set-Cookie')
         });
    
        afterAll(async () => {
            await request(app.getHttpServer())
                .delete('/auth/logout')
                .set("cookie", refreshToken[0])
            await app.close();
        });
    
        it('successful authorized: /users (GET)', async ()=>{
            return await request(app.getHttpServer())
                .get(`/users`)
                .set('Authorization', accessToken)
                .expect(200)
                .then(({body}: request.Response)=>{
                    expect(body).toBeDefined()
                })
        })
    });
    ```