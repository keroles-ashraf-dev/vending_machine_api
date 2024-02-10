import { Model, DataTypes } from 'sequelize';
import conn from '../../db/connection';
import User from './user.model';

export default class Product extends Model {
    declare id: number;
    declare sellerId: number;
    declare name: string;
    declare cost: number;
    declare amountAvailable: number;
}

Product.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sellerId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    name: {
        type: DataTypes.STRING(255),
    },
    cost: {
        type: DataTypes.DOUBLE,
    },
    amountAvailable: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    sequelize: conn,
    tableName: 'products',
    modelName: 'product',
    underscored: true,
    timestamps: false
});

//Product.belongsTo(User, { foreignKey: 'sellerId', targetKey: 'id', foreignKeyConstraint: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' });