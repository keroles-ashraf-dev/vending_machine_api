import { Request, Response, NextFunction } from 'express';
import { ApiError } from 'utils/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import apiRes from 'utils/api.response';
import LoggerService from 'services/logger';
import CoinRepo, { BaseCoinRepo } from 'app/repositories/v1/coin.repo';

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

    private logger: LoggerService;
    private coinRepo: BaseCoinRepo;

    create = async (req: Request, res: Response, next: NextFunction) => {
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

            const duplication = await this.coinRepo.findAll({ where: { value: coinsData  } });

            if (duplication && duplication.length > 0) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.BAD_REQUEST,
                    'Duplication error, make sure thet entered coins is not already exist',
                    true
                );
            }

            const insertedData: any = [];

            for (let i = 0; i < coinsData.length; i++) {
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

            const coinsArray = insertedCoins.map(e => e.value);

            this.logger.error('Coins created', coinsArray);

            const resData = {
                coins: coinsArray,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully coins added', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}

export default CoinController.Instance;