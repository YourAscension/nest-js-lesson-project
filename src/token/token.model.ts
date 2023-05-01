import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {User} from "../user/user.model";

@Table({tableName: 'tokens-nest'})
export class Token extends Model<Token>{
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
    id: number;
    @Column({type: DataType.STRING, allowNull: false})
    token: string;
    @ForeignKey(()=>User)
    @Column({type: DataType.INTEGER, allowNull: false})
    userId: number;

    @BelongsTo(()=>User, {onDelete: 'cascade'})
    users: User
}