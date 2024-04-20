import "reflect-metadata";
import { Request, Response, NextFunction } from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { HttpStatusCode } from 'utils/type';
import apiRes from 'helpers/api.response';
import { Logger } from 'helpers/logger';
import { DepositionService } from 'app/services/v1/deposition.service';

@injectable()
@singleton()
export class DepositionController {
    constructor(
        @inject('DepositionLogger') private logger: Logger,
        @inject(DepositionService) private depositionService: DepositionService,
    ) { }

    deposit = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                // @ts-ignore
                userId: req._user.id,
                amount: req.body.amount,
            }

            const userData = await this.depositionService.deposit(data);

            this.logger.info('Deposition succeeded', { username: userData.username, amount: userData.deposit });

            const resData = {
                username: userData.username,
                deposit_amount: userData.depositAmount,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully deposition', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    reset = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            const userId = req._user.id;

            const data = await this.depositionService.deposit(userId);

            this.logger.info('Deposition resetting succeeded', {
                username: data.username,
                deposit: data.deposit,
                returnedCoins: data.returnedCoins,
            });

            const resData = {
                username: data.username,
                deposit: data.deposit,
                returned_coins: data.returnedCoins,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully deposition reset', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}