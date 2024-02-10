import Coin from "app/models/coin.model";

/**
    * we need to tell the machine "by sequance" the coins it has to returned
    * so we just loop on available coins (descendingly) 
    * and get how many times of user deposit in current coin amount (say $n)
    * then add coin amount to returned array for ($n) times
    * and set user deposit to the reminder from current itration
    * and so on
    */
export function calcUserDepositAndChange(coins: Coin[], userDeposit: number): { userDeposit: number, returnedCoins: number[] } {
    const returnedCoins: number[] = [];

    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];

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

export function isDepositionAmountValid(coins: Coin[], amount: number): boolean {
    let isValidAmount: boolean = false;

    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];

        if (amount == coin.value) {
            isValidAmount = true;
            break;
        }
    }

    return isValidAmount;
}