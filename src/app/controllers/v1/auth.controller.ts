import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from 'app/models/user.model';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode } from 'src/utils/type';
import JWT from 'src/services/jwt';
import UserRefreshToken from 'app/models/user.refresh.token.model';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';

const logger = new LoggerService('auth.controller');

async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const user = await User.findOne({ where: { username: username } });

        if (!user) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'User not found', true);
        }

        if (!(await bcrypt.compare(password, user.password))) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid username or password', true);
        }

        const accessToken = JWT.sign({ _id: user.id, _role: user.role });
        const refreshToken = await UserRefreshToken.createToken(user);

        const data = {
            id: user.id,
            username: user.username,
            access_token: accessToken,
            refresh_token: refreshToken,
        }

        return apiRes(res, HttpStatusCode.OK, 'Sucessfully logged in', null, data);
    } catch (err) {
        logger.error('Login error', err);
        return errorHandler(res, err);
    }
}

async function refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshToken = req.body.refresh_token;

        const token = await UserRefreshToken.findOne({ where: { token: refreshToken } });

        if (!token) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'Refresh token not found', true);
        }

        if (!UserRefreshToken.verifyExpiration(token)) {
            await token.destroy();

            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.FORBIDDEN,
                'Refresh token has expired. Please make a new login request',
                true
            );
        }

        const user = await User.findOne({ where: { id: token.userId } });

        const accessToken = JWT.sign({ _id: user.id, _role: user.role });

        const data = {
            access_token: accessToken,
            refresh_token: refreshToken,
        }

        return apiRes(res, HttpStatusCode.OK, 'Sucessfully new token generated', null, data);
    } catch (err) {
        logger.error('Refresh token error', err);
        return errorHandler(res, err);
    }
};

export default {
    login,
    refreshToken,
}