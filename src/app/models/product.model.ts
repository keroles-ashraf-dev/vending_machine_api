import { Model, DataTypes } from 'sequelize';
import conn from '../../db/connection';
import User from './user.model';

export default class Product extends Model {
    public id!: number;
    public sellerId!: number;
    public name!: string;
    public amountAvailable!: number;
}

Product.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    sellerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
            model: User,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(255),
    },
    amountAvailable: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
    }
}, {
    sequelize: conn,
    tableName: 'products',
    modelName: 'product',
    timestamps: false
});

Product.belongsTo(User, { foreignKey: 'id', foreignKeyConstraint: true, onUpdate: 'CASCADE', onDelete: 'CASCADE' });