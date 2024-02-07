import { Model, DataTypes } from 'sequelize';
import conn from '../../db/connection';
import { UserRole } from '../../util/enums';
import Product from './product.model';

export default class User extends Model {
    public id!: number;
    public username!: string;
    public password!: string;
    public role!: string;
    public deposit!: number;
}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(64),
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
    },
    role: {
        type: DataTypes.ENUM({ values: UserRole }),
    },
    deposit: {
        type: DataTypes.DOUBLE.UNSIGNED,
        defaultValue: 0.0,
    }
}, {
    sequelize: conn,
    tableName: 'users',
    modelName: 'user',
    timestamps: false
});

User.hasMany(Product, {foreignKey: 'sellerId'});