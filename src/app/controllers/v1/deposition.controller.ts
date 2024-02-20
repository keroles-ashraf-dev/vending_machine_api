import { Request, Response, NextFunction } from 'express';
import { ApiError } from 'utils/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import apiRes from 'utils/api.response';
import LoggerService from 'services/logger';
import connection from 'db/connection';
import { calcUserDepositAndChange, isDepositionAmountValid } from 'helpers/user.deposit';
import UserRepo, { BaseUserRepo } from 'app/repositories/v1/user.repo';
import ProductRepo, { BaseProductRepo } from 'app/repositories/v1/product.repo';
import CoinRepo, { BaseCoinRepo } from 'app/repositories/v1/coin.repo';

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

    private logger: LoggerService;
    private productRepo: BaseProductRepo;
    private userRepo: BaseUserRepo;
    private coinRepo: BaseCoinRepo;

    deposit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req['_user']['id'];
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

            this.logger.error('Deposition succeeded', { username: modifiedUser.username, amount: modifiedUser.deposit });

            const resData = {
                username: modifiedUser.username,
                deposit_amount: modifiedUser.deposit,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully deposition', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    reset = async (req: Request, res: Response, next: NextFunction) => {
        // First, start a transaction
        const trans = await connection.transaction();

        try {
            const userId = req['_user']['id'];

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

            const coins = await this.coinRepo.findAll({ order: [['value', 'DESC']] });

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

            this.logger.error('Deposition resetting succeeded', {
                username: modifiedUser.username,
                deposit: modifiedUser.deposit,
                returned_coins: returnedCoins,
            });

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

            next(err); // Pass error to error-handler middleware
        }
    }
}

export default DepositionController.Instance;