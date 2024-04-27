import { Response } from "express";
import { env } from "../config/app.config";
import { ErrorType, HttpStatusCode } from "../utils/type";
import { envDev } from "../utils/constant";
import apiRes from "./api.response";
import { inject, injectable, singleton } from "tsyringe";
import { Logger } from "helpers/logger";

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
        isOperational: boolean = true,
    ) {
        super(name, code, message, isOperational);
    }
}

@singleton()
@injectable()
export class ErrorHandler {
    constructor(@inject('GeneralLogger') private logger: Logger) {
        process.on('uncaughtException', (error: Error) => this.handle(null, error));

        process.on('unhandledRejection', function (reason: Error, p: Promise<unknown>) {
            throw reason;
        });
    }

    private isTrustedError = (error: Error) => {
        if (error instanceof BaseError) {
            return error.isOperational;
        }

        return false;
    }

    public handle = (res: Response | null, error: Error) => {
        this.logger.error('Error', error);

        if (!this.isTrustedError(error) || res == null) {
            // its not operational error
            return process.exit(1);
        }

        if (env != envDev) {
            error.stack = undefined;

            // its not development environment
            if (error.name == ErrorType.SECURITY_ERROR || error.name == ErrorType.SERVER_ERROR) {
                // maybe this one should be sent to (email, slack, etc)
                error.message = 'Something wrong happened, try again later';
            }
        }

        // @ts-ignore
        return apiRes(res, error.code, 'Failed', error.message, { error_stack: error.stack });
    }
}