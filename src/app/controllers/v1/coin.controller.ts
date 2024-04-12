import { Request, Response, NextFunction } from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import apiRes from 'helpers/api.response';
import { Logger } from 'helpers/logger';
import { BaseCoinRepo } from 'app/repositories/v1/coin.repo';

@injectable()
@singleton()
export class CoinController {
    constructor(
        @inject('CoinLogger') private logger: Logger,
        @inject('BaseCoinRepo') private coinRepo: BaseCoinRepo,
    ) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const coin: number = req.body.coin;
            const coins: number[] = req.body.coins;

            if (!coin && !coins) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.BAD_REQUEST,
                    'Nothing to insert',
                );
            }

            let coinsData: Array<number> = [];

            if (coins) {
                coinsData.push(...coins);
            }

            if (coin && !coinsData.includes(coin)) {
                coinsData.push(coin);
            }

            const duplication = await this.coinRepo.findAll({ where: { value: coinsData } });

            if (duplication && duplication.length > 0) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.BAD_REQUEST,
                    'Duplication error, make sure thet entered coins is not already exist',
                    true
                );
            }

            const insertedData: any = [];

            for (let element of coinsData) {
                insertedData.push({ value: element });
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