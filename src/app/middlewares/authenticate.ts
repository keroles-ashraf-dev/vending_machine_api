import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { BaseJWT } from 'helpers/jwt';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import { string } from 'joi';

const jwt: BaseJWT = container.resolve('BaseJWT');

function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Token required', true);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Token required', true);
    }

    const payload = jwt.verify(token);
    if (!payload || payload instanceof string) {
        throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid token', true);
    }

    // @ts-ignore
    const userId = payload._id;
    // @ts-ignore
    const userRole = payload._role;

    if (!userId || !userRole) {
        throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid token', true);
    }

    // @ts-ignore
    req._user = { id: userId, role: userRole };

    next();
}

export default authenticate;