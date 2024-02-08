import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import JWT from '../../services/jwt';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode, UserRole } from 'src/utils/type';

function authorize(roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole: string = req.body._role;

            if (!roles.find((role) => role == userRole)) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'You are not authorized to perform this action',
                    true
                );
            }

            next();
        } catch (err) {
            return errorHandler(res, err);
        }
    };
};

export default authorize;