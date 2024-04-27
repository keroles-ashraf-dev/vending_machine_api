import "reflect-metadata";
import { Request, Response, NextFunction } from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import apiRes from 'utils/api.response';
import { Logger } from 'helpers/logger';
import connection from 'db/connection';
import { calcUserDepositAndChange } from 'helpers/user.deposit';
import { BaseUserRepo } from 'app/repositories/v1/user.repo';
import { BaseProductRepo } from 'app/repositories/v1/product.repo';
import { BaseCoinRepo } from 'app/repositories/v1/coin.repo';

@injectable()
@singleton()
export class PurchaseController {
    constructor(
        @inject('PurchaseLogger') private logger: Logger,
        @inject('BaseCoinRepo') private coinRepo: BaseCoinRepo,
        @inject('BaseUserRepo') private userRepo: BaseUserRepo,
        @inject('BaseProductRepo') private productRepo: BaseProductRepo,
    ) {
        this.logger = logger;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.coinRepo = coinRepo;
    }

    buy = async (req: Request, res: Response, next: NextFunction) => {
        // First, start a transaction
        const trans = await connection.transaction();
        try {
            // @ts-ignore
            const userId = req._user.id;
            const productId = req.body.product_id;
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

            const product = await this.productRepo.findOne({ where: { id: productId } });
            if (!product) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.NOT_FOUND,
                    'Product not found',
                    true
                );
            }

            if (product.amountAvailable < amount) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.BAD_REQUEST,
                    'Product available amount not enough',
                    true
                );
            }

            const totalCost = product.cost * amount;

            if (totalCost > user.deposit) {
                const diff = totalCost - user.deposit;
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.BAD_REQUEST,
                    'Your deposition amount not enough. you need to deposit $' + diff,
                    true
                );
            }

            const userDepositAfterCharge = user.deposit - totalCost;

            const coins = await this.coinRepo.findAll({ order: [['value', 'DESC']] });

            // read function doc
            const { userDeposit, returnedCoins } = calcUserDepositAndChange(coins, userDepositAfterCharge);

            const modifiedUser = await this.userRepo.update(user, { deposit: userDeposit });

            if (!modifiedUser || modifiedUser.deposit != userDeposit) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Purchasing not succeeded. something wrong happend, try again later', true
                );
            }

            const newAmount = product.amountAvailable - amount;

            const modifiedProduct = await this.productRepo.update(product, { amountAvailable: newAmount });

            if (!modifiedProduct || modifiedProduct.amountAvailable != newAmount) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Purchasing not succeeded. something wrong happend, try again later', true
                );
            }

            const resData = {
                username: modifiedUser.username,
                deposit_amount: modifiedUser.deposit,
                change: returnedCoins,
                spent_total: totalCost,
                product_id: product.id,
                product_name: product.name,
                product_amount_purchased: amount,
            }

            this.logger.error('purchasing succeeded', resData);

            // commit the transaction.
            await trans.commit();

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully purchased', null, resData);
        } catch (err) {
            // rollback the transaction.
            await trans.rollback();

            next(err); // Pass error to error-handler middleware
            next(err); // Pass error to error-handler middleware
        }
    }
}