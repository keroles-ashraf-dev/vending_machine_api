import { Response } from "express";
import { env } from "../config/app.config";
import { ErrorType, HttpStatusCode } from "./type";
import { envDev } from "./constant";
import apiRes from "./api.response";

class BaseError extends Error {
    name: string;
    code: HttpStatusCode;
    message: string;
    isOperational: boolean;

    constructor(
        name: string,
        code: HttpStatusCode,
        message: string,
        isOperational: boolean,
    ) {
        super(message);
        this.name = name;
        this.code = code;
        this.message = message;
        this.isOperational = isOperational;

        Error.captureStackTrace(this);
    }
}

export class ApiError extends BaseError {
    constructor(
        name: string,
        code: HttpStatusCode,
        message: string,
        isOperational: boolean,
    ) {
        super(name, code, message, isOperational);
    }
}

export function errorHandler(res: Response, error: Error): Response {
    if (env != envDev) {
        // its not development enviroment
        if (error.name == ErrorType.SECURITY_ERROR) {
            // maybe this one should be send to (email, slack, etc)
            error.message = 'Something wrong happend, try again later';
        } else {
            error.stack = undefined;
        }
    }

    if (error instanceof ApiError) {
        return apiRes(res, error.code, 'Failed', error.message, { error_stack: error.stack });
    } else {
        return apiRes(res, HttpStatusCode.INTERNAL_SERVER_ERROR, 'Failed', error.message, { error_stack: error.stack });
    }
}