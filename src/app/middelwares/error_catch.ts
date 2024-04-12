import { Request, Response, NextFunction } from 'express';
import ErrorHandler from 'helpers/error';

async function errorCatch(err: Error, req: Request, res: Response, next: NextFunction) {
    return ErrorHandler.handle(res, err);
}

export default errorCatch;