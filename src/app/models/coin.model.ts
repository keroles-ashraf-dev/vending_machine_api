import { Model, DataTypes } from 'sequelize';
import conn from '../../db/connection';

export default class Coin extends Model {
    declare name: string;
    declare amount: number;
}

Coin.init({
    name: {
        type: DataTypes.STRING(24),
        unique: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        unique: true,
    },
}, {
    sequelize: conn,
    tableName: 'coins',
    modelName: 'coin',
    underscored: true,
    timestamps: false
});