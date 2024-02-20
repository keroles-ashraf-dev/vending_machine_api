import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from 'utils/error';
import { ErrorType, HttpStatusCode } from 'utils/type';

function validate(schema: Joi.Schema, property: string = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.validate(req[property]);
    const error = result.error;

    if (error) {
      const details = error.details;
      const errors = details.map(i => i.message).join(', ');
      throw new ApiError(ErrorType.VALIDATION_ERROR, HttpStatusCode.UNPROCESSABLE_CONTENT, errors, true);
    }

    next();
  };
};

export default validate;

