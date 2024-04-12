import ProductRepo, { BaseProductRepo } from 'app/repositories/v1/product.repo';
import Product from 'app/models/product.model';

export default class ProductService {
    private static _instance: ProductService;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            ProductRepo,
        ));
    }
    private constructor(
        productRepo: BaseProductRepo,
    ) {
        this.productRepo = productRepo;
    }

    private productRepo: BaseProductRepo;

    getProductByProductname = async (productname: string): Promise<Product | null> => {
        const product = await this.productRepo.findOne({ where: { productname: productname } });

        return product;
    }

    getProductById = async (productId: number): Promise<Product | null> => {
        const product = await this.productRepo.findOne({ where: { id: productId } });

        return product;
    }
}