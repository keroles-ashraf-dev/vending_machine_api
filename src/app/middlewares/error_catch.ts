import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ErrorHandler } from 'helpers/error';

const errorHandler = container.resolve(ErrorHandler);

async function errorCatch(err: Error, req: Request, res: Response, next: NextFunction) {
    return errorHandler.handle(res, err);
}

export default errorCatch;