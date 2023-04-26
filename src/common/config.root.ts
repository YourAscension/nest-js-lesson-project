import {ConfigModule} from "@nestjs/config";
import * as process from "process";

export const configModule =  ConfigModule.forRoot({envFilePath: `.env.${process.env.NODE_ENV}`,
isGlobal: true})