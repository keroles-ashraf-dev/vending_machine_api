import { Response } from "express";

function apiRes(
    res: Response,
    code: number,
    msg: string | null,
    error: string | null = null,
    data: object | null = null,
) {
    const resData = {};

    // @ts-ignore
    if (msg) resData.message = msg;
    // @ts-ignore
    if (error) resData.error = error;
    // @ts-ignore
    if (data) resData.data = data;

    return res.status(code).send(resData);
}

export default apiRes;