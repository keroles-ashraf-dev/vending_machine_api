import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const env = process.env.ENV;
export const port = Number(process.env.API_PORT);
export const client_origin_url = process.env.CLIENT_ORIGIN_URL;
export const jwt_secret_key = process.env.JWT_SECRET_KEY;
export const jwt_expires_in_minutes = Number(process.env.JWT_EXPIRES_IN_MINUTES);
export const jwt_refresh_expires_in_minutes = Number(process.env.JWT_REFRESH_EXPIRES_IN_MINUTES);
export const log_file_path = process.env.LOG_FILE_PATH;