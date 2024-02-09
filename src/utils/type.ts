export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    UNPROCESSABLE_CONTENT = 422,
    INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorType {
    GENERAL_ERROR = 'GENERAL_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    SECURITY_ERROR = 'SECURITY_ERROR',
}

export enum UserRole {
    SELLER = 'seller',
    BUYER = 'buyer',
}