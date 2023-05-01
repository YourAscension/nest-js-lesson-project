import * as process from "process";

export class CreateTokenDto {
    readonly userId: number;
    readonly token: string;
    readonly issuedAt: Date;
    readonly expiresIn: Date;

    constructor(userId, token) {
        this.userId = userId;
        this.token = token;
        this.issuedAt = new Date()
        this.expiresIn = new Date(new Date().setDate(new Date().getDate()+Number(process.env.REFRESH_TOKEN_DAYS)))
    }
}