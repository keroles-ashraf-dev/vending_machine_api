import { Model, DataTypes } from 'sequelize';
import { ulid } from 'ulid';
import conn from '../../db/connection';
import User from './user.model';
import { jwt_refresh_expires_in_minutes } from 'src/config/app.config';

export default class UserRefreshToken extends Model {
    declare token: string;
    declare userId: number;
    declare expiryDate: Date;

    static async createToken(user: User) {
        const expiredAt = new Date();

        expiredAt.setMinutes(expiredAt.getMinutes() + jwt_refresh_expires_in_minutes);

        const refreshToken = await UserRefreshToken.create({
            token: ulid(),
            userId: user.id,
            expiryDate: expiredAt.getTime(),
        });

        return refreshToken.token;
    }

    static verifyExpiration(token: UserRefreshToken) {
        return token.expiryDate.getTime() < new Date().getTime();
    }
}

UserRefreshToken.init({
    token: {
        type: DataTypes.STRING(64),
        unique: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    expiryDate: {
        type: DataTypes.DATE,
    }
}, {
    sequelize: conn,
    tableName: 'user_refresh_tokens',
    modelName: 'userRefreshToken',
    underscored: true,
    timestamps: false
});

// UserRefreshToken.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', foreignKeyConstraint: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' });