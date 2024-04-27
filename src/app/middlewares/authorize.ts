import { Request, Response, NextFunction } from 'express';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode, UserRole } from 'utils/type';

function authorize(roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        const userRole: string = req._user.role;

        if (!roles.find((role) => role == userRole)) {
            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.FORBIDDEN,
                'You are not authorized to perform this action',
                true
            );
        }

        next();
    };
};

export default authorize;