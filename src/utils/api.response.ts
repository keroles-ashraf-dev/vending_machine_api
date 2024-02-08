import { Response } from "express";

function apiRes(
    res: Response,
    code: number,
    msg: string,
    error: string | null = null,
    data: object | null = null,
) {
    this.res = res;
    this.code = code;
    this.msg = msg;
    this.error = error;
    this.data = data;

    return res.status(code).send({
        message: msg,
        error: error,
        data: data,
    });
}

export default apiRes;