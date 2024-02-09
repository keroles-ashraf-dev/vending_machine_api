import { Request, Response, NextFunction } from 'express';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode } from 'src/utils/type';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';
import connection from '../../../db/connection';
import { calcUserDepositAndChange, isDepositionAmountValid } from 'src/helpers/user.deposit';
import UserRepo, { BaseUserRepo } from 'src/app/repositories/v1/user.repo';
import ProductRepo, { BaseProductRepo } from 'src/app/repositories/v1/product.repo';
import CoinRepo, { BaseCoinRepo } from 'src/app/repositories/v1/coin.repo';

class DepositionController {
    private static _instance: DepositionController;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            new LoggerService('deposition.controller'),
            ProductRepo,
            UserRepo,
            CoinRepo,
        ));
    }
    private constructor(
        logger: LoggerService,
        productRepo: BaseProductRepo,
        userRepo: BaseUserRepo,
        coinRepo: BaseCoinRepo,
    ) {
        this.logger = logger;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.coinRepo = coinRepo;
    }

    logger: LoggerService;
    productRepo: BaseProductRepo;
    userRepo: BaseUserRepo;
    coinRepo: BaseCoinRepo;

    async deposit(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.body._id;
            const amount: number = req.body.amount;

            const user = await this.userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new ApiError(
                    ErrorType.SECURITY_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'User not found in db after authentication succeeded',
                    true
                );
            }

            const coins = await this.coinRepo.findAll({});

            if (!isDepositionAmountValid(coins, amount)) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.UNPROCESSABLE_CONTENT,
                    'Deposition not succeeded. amount is not valid',
                    true
                );
            }

            const newDeposit = user.deposit + amount;

            const modifiedUser = await this.userRepo.update(user, { deposit: newDeposit });

            if (!modifiedUser || modifiedUser.deposit != newDeposit) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Deposition not succeeded. something wrong happend, try again later', true
                );
            }

            const resData = {
                username: modifiedUser.username,
                deposit_amount: modifiedUser.deposit,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully deposition', null, resData);
        } catch (err) {
            this.logger.error('Deposition error', err);
            return errorHandler(res, err);
        }
    }

    async reset(req: Request, res: Response, next: NextFunction) {
        // First, start a transaction
        const trans = await connection.transaction();

        try {
            const userId = req.body._id;

            const user = await this.userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new ApiError(
                    ErrorType.SECURITY_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'User not found in db after authentication succeeded',
                    true
                );
            }

            if (user.deposit <= 0) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.NOT_FOUND,
                    'You do not have anyy deposits to reset',
                    true
                );
            }

            const coins = await this.coinRepo.findAll({ order: ['amount', 'DESC'] });

            // read function doc
            const { userDeposit, returnedCoins } = calcUserDepositAndChange(coins, user.deposit);

            const modifiedUser = await this.userRepo.update(user, { deposit: userDeposit });

            if (!modifiedUser || modifiedUser.deposit != userDeposit) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Deposition resetting not succeeded. something wrong happend, try again later', true
                );
            }

            const resData = {
                username: modifiedUser.username,
                returned_amount: returnedCoins,
                deposit_reminder: user.deposit,
            }

            // commit the transaction.
            await trans.commit();

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully deposition reset', null, resData);
        } catch (err) {
            // rollback the transaction.
            await trans.rollback();

            this.logger.error('Deposition resetting error', err);
            return errorHandler(res, err);
        }
    }
}

export default DepositionController.Instance;