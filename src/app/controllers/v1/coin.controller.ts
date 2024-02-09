import { Request, Response, NextFunction } from 'express';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode, UserRole } from 'src/utils/type';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';
import CoinRepo, { BaseCoinRepo } from 'src/app/repositories/v1/coin.repo';

class CoinController {
    private static _instance: CoinController;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            new LoggerService('coin.controller'), CoinRepo,
        ));
    }
    private constructor(logger: LoggerService, coinRepo: BaseCoinRepo) {
        this.logger = logger;
        this.coinRepo = coinRepo;
    }

    logger: LoggerService;
    coinRepo: BaseCoinRepo;

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const coin: number = req.body.coin;
            const coins: number[] = req.body.coins;

            if (!coin && !coins) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.BAD_REQUEST,
                    'Nothing to insert', true
                );
            }

            let coinsData: Array<number> = [];

            if (coins) {
                coinsData.push(...coins);
            }

            if (coin && !coinsData.includes(coin)) {
                coinsData.push(coin);
            }

            const duplication = await this.coinRepo.findAll({ where: { value: { $in: coinsData } } });

            if (duplication && duplication.length > 0) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.BAD_REQUEST,
                    'Duplication error, make sure thet entered coins is not already exist',
                    true
                );
            }
            
            const insertedData = [];

            for(let i = 0; i < coinsData.length; i++){
                insertedData.push({ value: coinsData[i] });
            }

            const insertedCoins = await this.coinRepo.createBulk(insertedData);

            if (!insertedCoins) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Coins not added. something wrong happend, try again later', true
                );
            }

            const resData = {
                coins: insertedCoins.map(e => e.value),
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully coins added', null, resData);
        } catch (err) {
            this.logger.error('Coins adding error', err);
            return errorHandler(res, err);
        }
    }
}

export default CoinController.Instance;