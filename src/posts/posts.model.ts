import {Table, Column, Model, PrimaryKey, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
import {ApiProperty} from "@nestjs/swagger";
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