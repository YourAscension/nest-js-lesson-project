import {
  AfterCreate,
  AfterUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Op } from 'sequelize';

@Table({ tableName: 'tokens-nest' })
export class Token extends Model<Token> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;
  @Column({ type: DataType.STRING, allowNull: false })
  token: string;
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  refreshCount: number;
  @Column({ type: DataType.DATEONLY, allowNull: false })
  issuedAt: Date;
  @Column({ type: DataType.DATEONLY, allowNull: false })
  expiresIn: Date;
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @BelongsTo(() => User, { onDelete: 'cascade' })
  users: User;

  @AfterCreate
  @AfterUpdate
  static async checkAndDeleteExpiredTokensHook() {
    const currentDate = new Date().toISOString().slice(0, 10);
    const expiredTokens = await Token.findAll({
      where: { expiresIn: { [Op.lte]: currentDate } },
    });
    if (expiredTokens) {
      await Token.destroy({ where: { expiresIn: { [Op.lte]: currentDate } } });
    }
  }
}

/** Вариант с триггером для БД
 * CREATE OR REPLACE TRIGGER delete_expired_tokens
 * AFTER INSERT OR UPDATE ON "tokens-nest"
 * DECLARE
 * v_count number;
 * BEGIN
 *     SELECT COUNT(*) INTO v_count
 *     FROM "tokens-nest"
 *     WHERE "expiresIn" <= SYSDATE;
 *
 *     IF v_count > 0 THEN
 *     DELETE FROM "tokens-nest" WHERE "expiresIn" <SYSDATE;
 *     END IF;
 * END;
 * */
