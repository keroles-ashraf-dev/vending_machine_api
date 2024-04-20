import { singleton } from 'tsyringe';
import Coin from "app/models/coin.model";

@singleton()
export class UserDeposit {
    /**
    * we need to tell the machine "by sequence" the coins it has to returned
    * so we just loop on available coins (despondingly) 
    * and get how many times of user deposit in current coin amount (say $n)
    * then add coin amount to returned array for ($n) times
    * and set user deposit to the reminder from current iteration
    * and so on
    */
    calcUserDepositAndChange = (coins: Coin[], userDeposit: number): { userDeposit: number, returnedCoins: number[] } => {
        const returnedCoins: number[] = [];

        for (const coin of coins) {
            if (userDeposit >= coin.value) {
                const times = Math.floor(userDeposit / coin.value); // times of coin amount in user deposite ($n)
                const reminder = userDeposit % coin.value; // reminder of modulus user deposite and coin amount

                // add coin amount n times to returned coins
                const arrayOfCoinAmount = Array<number>(times).fill(coin.value);
                returnedCoins.push(...arrayOfCoinAmount);

                // set user deposit to reminder
                userDeposit = reminder;
            }
        }

        return { userDeposit, returnedCoins };
    }

    isDepositionAmountValid = (coins: Coin[], amount: number): boolean => {
        let isValidAmount: boolean = false;

        for (const coin of coins) {
            if (amount == coin.value) {
                isValidAmount = true;
                break;
            }
        }

        return isValidAmount;
    }
}