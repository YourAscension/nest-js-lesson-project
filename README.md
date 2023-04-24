# Тестовый проект Nest JS

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
5. [Создание модуля Roles](#создание-модуля-roles)
   1) [Создание модели Roles](#создание-модели-roles)
   2) [Создание связи моделей (Roles (1) → (∞) User)](#создание-связи-моделей-roles-1---user)
   3) [Создание сервиса для Roles](#создание-сервиса-для-roles)
   4) [Создание контроллера для Roles](#создание-контроллера-для-roles)
   5) [Взаимодействие сервисов Roles и User](#взаимодействие-сервисов-roles-и-user)
<hr>

## Создание проекта
1.  Создаём проект с помощью __NEST CLI__ `nest new .` или `nest new *название проекта*`;
2. Устанавливаем __Sequelize__ и __oracledb__ (библиотека для нужной БД)<br>`npm install --save @nestjs/sequelize sequelize sequelize-typescript oracledb`<br>`npm install --save-dev @types/sequelize`
3. Устанавливаем библиотеку для работы с конфигами `npm install @nestjs/config` и создаём файл `.env`  
    ```
    //📁.env
    PORT=4001  
    DB_DATABASE="XE"  
    DB_HOST="localhost"
    DB_USERNAME="yourascension"
    DB_PASSWORD="123456"
    DB_PORT=1521
    ```
<hr/>

## Подключение к БД (создание модуля для БД)
1. С помощью __Nest CLI__ создадим модуль для БД. `nest generate module database`;
2. В модуль `database` импортируем модуль для работы с конфигами и указываем путь к `.env` файлу 
    ```TypeScript
   //TypeScript
   //📁src/database/database.module.ts
   
    import { Module } from '@nestjs/common';
    import {ConfigModule} from "@nestjs/config";
    import * as process from "process";

    @Module({
        imports: [ConfigModule.forRoot({envFilePath: '.env'})]
    })
    export class DatabaseModule {}
    
    console.log(process.env.PORT);
    ```
3. Также импортируем модуль `Sequelize` для настройки подключения к БД
    ```TypeScript
   //TypeScript
   //📁src/database/database.module.ts
   
    import { Module } from '@nestjs/common';
    import {ConfigModule} from "@nestjs/config";
    import {SequelizeModule} from "@nestjs/sequelize";
    
    @Module({
        imports: [ConfigModule.forRoot({envFilePath: '.env'}),
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
4. Для того чтобы можно было работать с БД в других модулях, в модуль `app.module.ts` импортируем `database.module.ts`
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
   💡 Т.к. модуль для работы с конфигом `.env` был импортирован в `database.module.ts`, то его функционал также доступен в `app.module.ts`
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
   💡 При создании модуля с помощью __NEST CLI__ он автоматически импортируется в главный модуль `app.module.ts`.
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
    import {ConfigModule} from "@nestjs/config";
    import {SequelizeModule} from "@nestjs/sequelize";
    import {User} from "../user/user.model";
    import {UserModule} from "../user/user.module";
    
    @Module({
        imports: [ConfigModule.forRoot({envFilePath: '.env'}),
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
6. Вернёмся к `user.service.ts` чтобы создать метод для создания юзеров. Метод называется `createUser`, в качестве аргументов он принимает dto (__Data-Transfer-Object__):
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
   💡 dto - преобразование данные к необходимому виду.<br> В папке user создадим папку __dto__, а в ней файл `user-create.dto.ts` (преобразование данных юзера для создания):
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
   ⚠️Чтобы увидеть ответ от сервера, необходимо также задокументировать модели.
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
<hr/>

## Создание модуля Roles
Создадим модуль, контроллер, сервис с помощью __Nest CLI__. `nest generate module roles`, `nest generate controller roles`, `nest generate service roles`. 
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
   import {ConfigModule} from "@nestjs/config";
   import {SequelizeModule} from "@nestjs/sequelize";
   import {User} from "../user/user.model";
   import {UserModule} from "../user/user.module";
   import {Roles} from "../roles/roles.model";
   
   @Module({
        imports: [ConfigModule.forRoot({envFilePath: '.env'}),
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
           return user;
       }
   }
   ```
      