import { Model, DataTypes } from 'sequelize';
import conn from 'db/connection';

export default class Coin extends Model {
    declare value: number;
}

Coin.init({
    value: {
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