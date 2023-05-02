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

    it('failed: /users/:id (DELETE)',  ()=>{
        return request(app.getHttpServer())
            .delete(`/users/${999}`)
            .expect(404, {
                statusCode: 404,
                message: 'Пользователь не найден',
                error: 'Not Found'
            })
    })

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