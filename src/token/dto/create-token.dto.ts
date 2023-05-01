import * as process from "process";

export class CreateTokenDto {
    readonly userId: number;
    readonly token: string;
    readonly issuedAt: Date = new Date();
    readonly expiresIn: Date = new Date(new Date().setDate(new Date().getDate()+Number(process.env.REFRESH_TOKEN_DAYS)));
}