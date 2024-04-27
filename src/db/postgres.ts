import { Sequelize } from 'sequelize';
import { db_host, db_port, db_name, db_user, db_password } from '../config/db.config';

const conn = new Sequelize({
    dialect: "postgres",
    host: db_host,
    port: db_port,
    database: db_name,
    username: db_user,
    password: db_password,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000, // 30 seconds
        idle: 60000, // one minute
    },
});

export default conn;