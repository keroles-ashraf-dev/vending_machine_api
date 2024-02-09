import Coin from 'app/models/coin.model';

export interface BaseCoinRepo {
    create(data: any): Promise<Coin>;

    findAll(query: any): Promise<Coin[]>;
}

// singleton class
class CoinRepo implements BaseCoinRepo {
    private static _instance: CoinRepo;
    private constructor() { }
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    async create(data: any): Promise<Coin> {
        const coin = await Coin.create(data);

        return coin;
    }

    async findAll(query: any): Promise<Coin[]> {
        const coins = await Coin.findAll(query);

        return coins;
    }
}

export default CoinRepo.Instance;