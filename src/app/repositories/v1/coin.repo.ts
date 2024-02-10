import Coin from 'src/app/models/coin.model';

export interface BaseCoinRepo {
    create(data: any): Promise<Coin>;

    createBulk(data: Array<any>): Promise<Coin[]>;

    findAll(query: any): Promise<Coin[]>;
}

// singleton class
class CoinRepo implements BaseCoinRepo {
    private static _instance: CoinRepo;
    private constructor() { }
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

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

export default CoinRepo.Instance;