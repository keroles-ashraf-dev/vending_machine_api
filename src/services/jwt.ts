import jwt from 'jsonwebtoken';
import { jwt_secret_key, jwt_expires_in_minutes } from 'config/app.config';
import LoggerService from './logger';

const logger = new LoggerService('jwt');

class JWT {
    static verify = (token: string): string | jwt.JwtPayload | null => {
        try {
            const decoded = jwt.verify(token, jwt_secret_key!);

            return decoded;
        } catch (err) {
            logger.error('jwt verify token', err);
            return null;
        }
    }

    static sign = (payload: string | object | Buffer): string | null => {
        try {
            const token = jwt.sign(payload, jwt_secret_key!, { expiresIn: jwt_expires_in_minutes * 60 });

            return token;
        } catch (err) {
            logger.error('jwt sign new token', err);
            return null;
        }
    }
}

export default JWT;