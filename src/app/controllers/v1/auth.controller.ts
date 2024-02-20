import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { ApiError } from 'utils/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import JWT from 'services/jwt';
import apiRes from 'utils/api.response';
import LoggerService from 'services/logger';
import UserRepo, { BaseUserRepo } from 'app/repositories/v1/user.repo';
import UserRefreshTokenRepo, { BaseUserRefreshTokenRepo } from 'app/repositories/v1/user.refresh.token.repo';

class AuthController {
    private static _instance: AuthController;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            new LoggerService('auth.controller'),
            UserRepo,
            UserRefreshTokenRepo,
        ));
    }
    private constructor(
        logger: LoggerService,
        userRepo: BaseUserRepo,
        userRefreshTokenRepo: BaseUserRefreshTokenRepo
    ) {
        this.logger = logger;
        this.userRepo = userRepo;
        this.userRefreshTokenRepo = userRefreshTokenRepo;
    }

    private logger: LoggerService;
    private userRepo: BaseUserRepo;
    private userRefreshTokenRepo: BaseUserRefreshTokenRepo;

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const username = req.body.username;
            const password = req.body.password;

            const user = await this.userRepo.findOne({ where: { username: username } });

            if (!user) {
                throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'User not found', true);
            }

            if (!(await bcrypt.compare(password, user.password))) {
                throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid username or password', true);
            }

            const accessToken = JWT.sign({ _id: user.id, _role: user.role });
            const refreshToken = await this.userRefreshTokenRepo.create(user);

            this.logger.error('Login succeeded', user.username);

            const resData = {
                id: user.id,
                username: user.username,
                access_token: accessToken,
                refresh_token: refreshToken,
            }

            return apiRes(res, HttpStatusCode.OK, 'Sucessfully logged in', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.body.refresh_token;

            const token = await this.userRefreshTokenRepo.findOne({ where: { token: refreshToken } });

            if (!token) {
                throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'Refresh token not found', true);
            }

            if (!this.userRefreshTokenRepo.verifyExpiration(token)) {
                await token.destroy();

                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'Refresh token has expired. Please make a new login request',
                    true
                );
            }

            const user = await this.userRepo.findOne({ where: { id: token.userId } });

            const accessToken = JWT.sign({ _id: user.id, _role: user.role });

            this.logger.error('Refresh token succeeded', user.username);

            const resData = {
                access_token: accessToken,
                refresh_token: refreshToken,
            }

            return apiRes(res, HttpStatusCode.OK, 'Sucessfully new token generated', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}

export default AuthController.Instance;