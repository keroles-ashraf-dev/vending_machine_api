import { Request, Response, NextFunction } from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { AuthService } from 'app/services/v1/auth.service';
import { HttpStatusCode } from 'utils/type';
import apiRes from 'utils/api.response';
import { Logger } from 'helpers/logger';

@injectable()
@singleton()
export class AuthController {
    constructor(
        @inject('AuthLogger') private logger: Logger,
        @inject(AuthService) private authServie: AuthService,
    ) { }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const username = req.body.username;
            const password = req.body.password;

            const data = await this.authServie.login(username, password);

            const resData = {
                id: data.user.id,
                username: data.user.username,
                access_token: data.accessToken,
                refresh_token: data.refreshToken,
            }

            this.logger.error('Login succeeded', data.user.username);

            return apiRes(res, HttpStatusCode.OK, 'Sucessfully logged in', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.body.refresh_token;

            const data = await this.authServie.refreshToken(refreshToken);

            const resData = {
                id: data.user.id,
                username: data.user.username,
                access_token: data.accessToken,
                refresh_token: data.refreshToken,
            }

            this.logger.error('Refresh token succeeded', data.user.username);

            return apiRes(res, HttpStatusCode.OK, 'Sucessfully new token generated', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}