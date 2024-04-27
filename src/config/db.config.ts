import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const db_host = String(process.env.DB_HOST);
export const db_port = Number(process.env.DB_PORT);
export const db_name = String(process.env.DB_NAME);
export const db_user = String(process.env.DB_USER);
export const db_password = String(process.env.DB_PASSWORD);
export const redis_host = String(process.env.REDIS_HOST);
export const redis_port = String(process.env.REDIS_PORT);
export const redis_username = String(process.env.REDIS_USERNAME);
export const redis_password = String(process.env.REDIS_PASSWORD);