import { singleton } from 'tsyringe';
import Coin from 'app/models/coin.model';

export interface BaseCoinRepo {
    create(data: any): Promise<Coin>;

    createBulk(data: Array<any>): Promise<Coin[]>;

    findAll(query: any): Promise<Coin[]>;
}

@singleton()
export class CoinRepo implements BaseCoinRepo {
    create = async (data: any): Promise<Coin> => {
        const coin = await Coin.create(data);

        return coin;
    }

    createBulk = async (data: Array<any>): Promise<Coin[]> => {
        const coins = await Coin.bulkCreate(data);

        return coins;
    }

    findAll = async (query: any): Promise<Coin[]> => {
        const coins = await Coin.findAll(query);

        return coins;
    }
}