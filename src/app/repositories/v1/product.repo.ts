import { singleton } from 'tsyringe';
import Product from 'app/models/product.model';

export interface BaseProductRepo {
    create(data: any): Promise<Product>;

    findOne(query: any): Promise<Product>;

    findAll(query: any): Promise<Product[]>;

    update(product: Product | number, data: any): Promise<Product>;

    delete(query: any): Promise<boolean>;
}

@singleton()
export class ProductRepo implements BaseProductRepo {
    create = async (data: any): Promise<Product> => {
        const product = await Product.create(data);

        return product;
    }

    findOne = async (query: any): Promise<Product> => {
        const product = await Product.findOne(query);

        return product;
    }

    findAll = async (query: any): Promise<Product[]> => {
        const products = await Product.findAll(query);

        return products;
    }

    update = async (productOrId: Product | number, data: any): Promise<Product> => {
        let product: Product;

        if (productOrId instanceof Number) {
            product = await this.findOne({ where: { id: productOrId } });
        } else {
            product = productOrId as Product;
        }

        const modifiedProduct = await product.update(data);

        return modifiedProduct;
    }

    delete = async (query: any): Promise<boolean> => {
        const deletedNum = await Product.destroy(query);

        return deletedNum > 0;
    }
}