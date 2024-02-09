import { Request, Response, NextFunction } from 'express';
import User from 'app/models/user.model';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode } from 'src/utils/type';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';
import Coin from 'app/models/coin.model';
import connection from '../../../db/connection';

const logger = new LoggerService('purchase.controller');

async function buy(req: Request, res: Response, next: NextFunction) {
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

        const coins = await Coin.findAll();

        let isValidAmount: boolean = false;
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];

            if (amount == coin.amount) {
                isValidAmount = true;
                break;
            }
        }

        if (!isValidAmount) {
            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.UNPROCESSABLE_CONTENT,
                'Deposition not succeeded. amount is not valid',
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
            deposit_amount: modifiedUser.deposit,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully deposition', null, data);
    } catch (err) {
        logger.error('Deposition error', err);
        return errorHandler(res, err);
    }
}

async function reset(req: Request, res: Response, next: NextFunction) {
    // First, start a transaction
    const trans = await connection.transaction();

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

        let userDeposit = user.deposit;

        if (userDeposit == 0) {
            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.NOT_FOUND,
                'You do not have anyy deposits to reset',
                true
            );
        }

        const coins = await Coin.findAll({ order: ['amount', 'DESC'] });

        const returnedCoins: number[] = [];

        /**
         * we need to tell the machine by sequance the coins it has to returned
         * so we just loop on available coins (descendingly) 
         * and get how many times of user deposit in current coin amount (say $n)
         * then add coin amount to returned array for ($n) times
         * and set user deposit to the reminder from current itration
         */
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];

            if (userDeposit >= coin.amount) {
                const times = userDeposit / coin.amount; // times of coin amount in user deposite ($n)
                const reminder = userDeposit % coin.amount; // reminder of modulus user deposite and coin amount

                // add coin amount n times to returned coins
                const arrayOfCoinAmount = Array<number>(times).fill(coin.amount);
                returnedCoins.push(...arrayOfCoinAmount);

                // set user deposit to reminder
                userDeposit = reminder;
            }
        }

        user.deposit = userDeposit;

        const modifiedUser = await user.save();

        if (!modifiedUser || modifiedUser.deposit != userDeposit) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Deposition resetting not succeeded. something wrong happend, try again later', true
            );
        }

        const data = {
            username: modifiedUser.username,
            returned_amount: returnedCoins,
            deposit_reminder: user.deposit,
        }

        // commit the transaction.
        await trans.commit();

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully deposition reset', null, data);
    } catch (err) {
        // rollback the transaction.
        await trans.rollback();

        logger.error('Deposition resetting error', err);
        return errorHandler(res, err);
    }
}

export default {
    buy,
}