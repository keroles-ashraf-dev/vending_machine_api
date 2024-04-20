import "reflect-metadata";
import { inject, injectable, singleton } from 'tsyringe';
import { BaseCoinRepo } from 'app/repositories/v1/coin.repo';
import { BaseUserRepo } from 'app/repositories/v1/user.repo';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import User from "app/models/user.model";
import { UserDeposit } from "helpers/user.deposit";
import runInTransaction from "helpers/run.in.transaction";

@injectable()
@singleton()
export class DepositionService {
    constructor(
        @inject('BaseCoinRepo') private coinRepo: BaseCoinRepo,
        @inject('BaseUserRepo') private userRepo: BaseUserRepo,
        @inject(UserDeposit) private userDeposit: UserDeposit,
    ) { }

    deposit = async (data: Record<string, any>): Promise<Record<string, any>> => {
        const userId = data.useId;
        const amount: number = data.amount;

        const user = await this.getUserById(userId);

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
            );
        }

        const coins = await this.coinRepo.findAll({});

        if (!this.userDeposit.isDepositionAmountValid(coins, amount)) {
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
                'Deposition not succeeded. something wrong happened, try again later', true
            );
        }

        const userData = {
            username: modifiedUser.username,
            depositAmount: modifiedUser.deposit,
        }

        return userData;
    }

    reset = async (userId: number): Promise<Record<string, any>> => {
        return await runInTransaction(async () => {
            const user = await this.getUserById(userId);

            if (!user) {
                throw new ApiError(
                    ErrorType.SECURITY_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'User not found in db after authentication succeeded',
                );
            }

            if (user.deposit <= 0) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.NOT_FOUND,
                    'You do not have any deposits to reset',
                    true
                );
            }

            const coins = await this.coinRepo.findAll({ order: [['value', 'DESC']] });

            // read function doc
            const { userDeposit, returnedCoins } = this.userDeposit.calcUserDepositAndChange(coins, user.deposit);

            const modifiedUser = await this.userRepo.update(user, { deposit: userDeposit });

            if (!modifiedUser || modifiedUser.deposit != userDeposit) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Deposition resetting not succeeded. something wrong happend, try again later', true
                );
            }

            const data = {
                username: modifiedUser.username,
                deposit: user.deposit,
                returnedCoins: returnedCoins,
            }

            return data;
        });
    }

    getUserById = async (userId: number): Promise<User | null> => {
        const user = await this.userRepo.findOne({ where: { id: userId } });

        return user;
    }
}