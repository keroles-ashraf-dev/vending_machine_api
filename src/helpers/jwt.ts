import { inject, singleton } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { jwt_secret_key, jwt_expires_in_minutes } from 'config/app.config';
import { Logger } from 'helpers/logger';

export interface BaseJWT {
    verify(token: string): Object | null;

    sign(payload: Object): string | null;
}

@singleton()
export class JWT implements BaseJWT {
    constructor(@inject('JWTLogger') private logger: Logger) { }

    verify = (token: string): Object | null => {
        try {
            const decoded = jwt.verify(token, jwt_secret_key!);

            return decoded;
        } catch (err) {
            this.logger.error('jwt verify token', err);
            return null;
        }
    }

    sign = (payload: Object): string | null => {
        try {
            const token = jwt.sign(payload, jwt_secret_key!, { expiresIn: jwt_expires_in_minutes * 60 });

            return token;
        } catch (err) {
            this.logger.error('jwt sign new token', err);
            return null;
        }
    }
}