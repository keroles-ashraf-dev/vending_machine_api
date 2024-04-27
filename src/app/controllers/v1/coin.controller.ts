import "reflect-metadata";
import { Request, Response, NextFunction } from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { HttpStatusCode } from 'utils/type';
import apiRes from 'helpers/api.response';
import { Logger } from 'helpers/logger';
import { CoinService } from 'app/services/v1/coin.service';

@injectable()
@singleton()
export class CoinController {
    constructor(
        @inject('CoinLogger') private logger: Logger,
        @inject(CoinService) private coinService: CoinService,
    ) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                coin: req.body.coin,
                coins: req.body.coins,
            }

            const coins = await this.coinService.createCoin(data);

            this.logger.error('Coins created', coins);

            const resData = {
                coins: coins,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully coins added', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}