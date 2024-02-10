import { Response } from "express";

function apiRes(
    res: Response,
    code: number,
    msg: string | null,
    error: string | null = null,
    data: object | null = null,
) {
    const resData = {};

    if (msg) resData['message'] = msg;
    if (error) resData['error'] = error;
    if (data) resData['data'] = data;

    return res.status(code).send(resData);
}

export default apiRes;