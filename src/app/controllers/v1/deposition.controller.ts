import { Request, Response, NextFunction } from 'express';
import User from 'app/models/user.model';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode } from 'src/utils/type';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';

const logger = new LoggerService('deposition.controller');

async function deposit(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.body._id;
        const amount: number = req.body.amount;

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const newDeposit = user.deposit + amount;

        user.deposit = newDeposit;

        const modifiedUser = await user.save();

        if (!modifiedUser || modifiedUser.deposit != newDeposit) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Deposition not succeeded. something wrong happend, try again later', true
            );
        }

        const data = {
            username: modifiedUser.username,
            wallet_amount: modifiedUser.deposit,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully deposition', null, data);
    } catch (err) {
        logger.error('Deposition error', err);
        return errorHandler(res, err);
    }
}

async function reset(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.body._id;

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const userDeposit = user.deposit;
        const newDeposit = 0.0;

        if (userDeposit < 1) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Deposition resetting not succeeded. something wrong happend, try again later', true
            );
        }

        user.deposit = newDeposit;

        const modifiedUser = await user.save();

        if (!modifiedUser || modifiedUser.deposit != newDeposit) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Deposition resetting not succeeded. something wrong happend, try again later', true
            );
        }

        const data = {
            username: modifiedUser.username,
            returned_amount: userDeposit,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully deposition reset', null, data);
    } catch (err) {
        logger.error('Deposition resetting error', err);
        return errorHandler(res, err);
    }
}

export default {
    deposit,
    reset,
}