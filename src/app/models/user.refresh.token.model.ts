import { Model, DataTypes } from 'sequelize';
import { ulid } from 'ulid';
import conn from '../../db/postgres';
import User from './user.model';
import { jwt_refresh_expires_in_minutes } from 'config/app.config';

export default class UserRefreshToken extends Model {
    declare token: string;
    declare userId: number;
    declare expiryDate: Date;

    static createToken = async (userId: number) => {
        const expiredAt = new Date();

        expiredAt.setMinutes(expiredAt.getMinutes() + jwt_refresh_expires_in_minutes);

        const refreshToken = await UserRefreshToken.create({
            token: ulid(),
            userId: userId,
            expiryDate: expiredAt.getTime(),
        });

        return refreshToken.token;
    }

    static verifyExpiration = (expiryDate: Date) => {
        return expiryDate.getTime() > new Date().getTime();
    }
}

UserRefreshToken.init({
    token: {
        type: DataTypes.UUID,
        unique: true, // i'm pretty sure the new inserted one gonna be unique because its ULID but
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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