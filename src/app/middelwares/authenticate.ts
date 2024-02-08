import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import JWT from '../../services/jwt';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode } from 'src/utils/type';

function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Token required', true);
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Token required', true);
        }

        const payload = JWT.verify(token) as jwt.JwtPayload;
        if (!payload) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid token', true);
        }

        const userId = payload._id;
        const userRole = payload._role;

        if (!userId || !userRole) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid token', true);
        }

        req.body._userId = userId;
        req.body._userRole = userRole;

        next();
    } catch (err) {
        return errorHandler(res, err);
    }
}

export default authenticate;