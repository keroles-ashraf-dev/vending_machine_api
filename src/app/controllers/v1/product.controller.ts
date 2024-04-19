import { Request, Response, NextFunction } from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { HttpStatusCode } from 'utils/type';
import apiRes from 'helpers/api.response';
import { Logger } from 'helpers/logger';
import { ProductService } from 'app/services/v1/product.service';

@injectable()
@singleton()
export class ProductController {
    constructor(
        @inject('ProductLogger') private logger: Logger,
        @inject(ProductService) private productService: ProductService,
    ) { }

    createProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                // @ts-ignore
                userId: req._user.id,
                name: req.body.name,
                cost: req.body.cost,
                amountAvailable: req.body.amount_available,
            }

            const productData = await this.productService.createProduct(data);

            const resData = {
                id: productData.id,
                name: productData.name,
                cost: productData.cost,
                amount_available: productData.amountAvailable,
            }

            this.logger.error('Product creating succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully product created', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    getProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId: number = Number(req.params.product_id);

            const productData = await this.productService.getProduct(productId);

            const resData = {
                id: productData.id,
                name: productData.name,
                cost: productData.cost,
                amount_available: productData.amountAvailable,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully product fetched', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                // @ts-ignore
                userId: req._user.id,
                productId: req.body.product_id,
                name: req.body.name,
                cost: req.body.cost,
                amountAvailable: req.body.amount_available,
            }

            const productData = await this.productService.updateProduct(data);

            const resData = {
                id: productData.id,
                name: productData.name,
                cost: productData.cost,
                amount_available: productData.amountAvailable,
            }

            this.logger.error('Product updating succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully product updated', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = {
                // @ts-ignore
                userId: req._user.id,
                productId: req.body.product_id,
            }

            const productData = await this.productService.updateProduct(data);

            const resData = {
                id: productData.id,
                name: productData.name,
                cost: productData.cost,
                amount_available: productData.amountAvailable,
            }

            this.logger.error('Product deleting succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully product deleted', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}