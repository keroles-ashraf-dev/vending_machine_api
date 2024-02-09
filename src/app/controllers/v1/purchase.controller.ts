import { Request, Response, NextFunction } from 'express';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode } from 'src/utils/type';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';
import connection from '../../../db/connection';
import { calcUserDepositAndChange } from 'src/helpers/user.deposit';
import UserRepo, { BaseUserRepo } from 'src/app/repositories/v1/user.repo';
import ProductRepo, { BaseProductRepo } from 'src/app/repositories/v1/product.repo';
import CoinRepo, { BaseCoinRepo } from 'src/app/repositories/v1/coin.repo';

class PurchaseController {
    private static _instance: PurchaseController;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            new LoggerService('purchase.controller'),
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

    async buy(req: Request, res: Response, next: NextFunction) {
        // First, start a transaction
        const trans = await connection.transaction();
        try {
            const userId = req.body._id;
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

            const coins = await this.coinRepo.findAll({ order: ['amount', 'DESC'] });

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

            const data = {
                username: modifiedUser.username,
                deposit_amount: modifiedUser.deposit,
                change: returnedCoins,
                spent_total: totalCost,
                product_id: product.id,
                product_name: product.name,
                product_amount_purchased: amount,
            }

            // commit the transaction.
            await trans.commit();

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully purchased', null, data);
        } catch (err) {
            // rollback the transaction.
            await trans.rollback();

            this.logger.error('purchasing error', err);
            return errorHandler(res, err);
        }
    }
}

export default PurchaseController.Instance;