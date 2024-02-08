import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import apiRes from 'src/utils/api.response';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode } from 'src/utils/type';

function validate(schema: Joi.Schema, property: string = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.validate(req[property]);
      const error = result.error;
      const valid: boolean = error == null;

      if (!valid) {
        const details = error.details;
        const errors = details.map(i => i.message).join(', ');
        throw new ApiError(ErrorType.VALIDATION_ERROR, HttpStatusCode.UNPROCESSABLE_CONTENT, errors, true);
      }

      next();
    } catch (err) {
      return errorHandler(res, err);
    }
  };
};

export default validate;

