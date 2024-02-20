import { Response } from "express";
import { env } from "../config/app.config";
import { ErrorType, HttpStatusCode } from "./type";
import { envDev } from "./constant";
import apiRes from "./api.response";
import LoggerService from "services/logger";

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

class ErrorHandler {
    private static _instance: ErrorHandler;
    public static get Instance() {
        return this._instance || (this._instance = new this(new LoggerService()));
    }

    private constructor(logger: LoggerService) {
        this.logger = logger;

        process.on('uncaughtException', (error: Error) => this.handle(null, error));

        process.on('unhandledRejection', function (reason: Error, p: Promise<unknown>) {
            throw reason;
        });
    }

    private logger: LoggerService;

    private isTrustedError = (error: Error) => {
        if (error instanceof BaseError) {
            return error.isOperational;
        }

        return false;
    }

    handle = (res: Response | null, error: Error) => {
        this.logger.error('Error', error);

        if (!this.isTrustedError(error) || res == null) {
            // its not operatioal error
            return process.exit(1);
        }

        if (env != envDev) {
            error.stack = undefined;

            // its not development enviroment
            if (error.name == ErrorType.SECURITY_ERROR) {
                // maybe this one should be send to (email, slack, etc)
                error.message = 'Something wrong happend, try again later';
            }
        }

        // @ts-ignore
        return apiRes(res, error.code, 'Failed', error.message, { error_stack: error.stack });
    }
}

export default ErrorHandler.Instance;