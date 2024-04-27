import "reflect-metadata";
import { inject, injectable, singleton } from 'tsyringe';
import { BaseCoinRepo } from 'app/repositories/v1/coin.repo';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';

@injectable()
@singleton()
export class CoinService {
    constructor(
        @inject('BaseCoinRepo') private coinRepo: BaseCoinRepo,
    ) { }

    createCoin = async (data: Record<string, any>): Promise<number[]> => {
        const coin: number = data.coin;
        const coins: number[] = data.coins;

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

        const insertedData: Record<string, any>[] = [];

        for (let element of coinsData) {
            insertedData.push({ value: element });
        }

        const insertedCoins = await this.coinRepo.createBulk(insertedData);

        if (!insertedCoins) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Coins not added. something wrong happened, try again later', true
            );
        }

        const coinsArray = insertedCoins.map(e => e.value);

        return coinsArray;
    }
}