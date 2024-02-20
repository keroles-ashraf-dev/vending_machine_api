import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import JWT from 'services/jwt';
import { ApiError } from 'utils/error';
import { ErrorType, HttpStatusCode } from 'utils/type';

function authenticate(req: Request, res: Response, next: NextFunction) {
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

        req['_user'] = { id: userId, role: userRole};

        next();
}

export default authenticate;