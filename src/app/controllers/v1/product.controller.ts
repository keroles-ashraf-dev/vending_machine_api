import { Request, Response, NextFunction } from 'express';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode, UserRole } from 'src/utils/type';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';
import ProductRepo, { BaseProductRepo } from 'app/repositories/v1/product.repo';
import userRepo, { BaseUserRepo } from 'app/repositories/v1/user.repo';

class ProductController {
    private static _instance: ProductController;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            new LoggerService('product.controller'),
            ProductRepo, userRepo,
        ));
    }
    private constructor(logger: LoggerService, productRepo: BaseProductRepo, userRepo: BaseUserRepo) {
        this.logger = logger;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    logger: LoggerService;
    productRepo: BaseProductRepo;
    userRepo: BaseUserRepo;

    async createProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.body._id;

            const name: string = req.body.name;
            const cost: string = req.body.cost;
            const amountAvailable: string = req.body.amount_available;

            const user = await this.userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new ApiError(
                    ErrorType.SECURITY_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'User not found in db after authentication succeeded',
                    true
                );
            }

            const productData = {
                sellerId: user.id,
                name: name,
                cost: cost,
                amountAvailable: amountAvailable,
            }

            const product = await this.productRepo.create(productData);

            if (!product) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Product not created. something wrong happend, try again later', true
                );
            }

            const resData = {
                id: product.id,
                name: product.name,
                cost: product.cost,
                amount_available: product.amountAvailable,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product created', null, resData);
        } catch (err) {
            this.logger.error('Product creating error', err);
            return errorHandler(res, err);
        }
    }

    async getProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const productId = req.body.product_id;

            const product = await this.productRepo.findOne({ where: { id: productId } });

            if (!product) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.NOT_FOUND,
                    'Product not found',
                    true
                );
            }

            const resData = {
                id: product.id,
                name: product.name,
                cost: product.cost,
                amount_available: product.amountAvailable,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product fetched', null, resData);
        } catch (err) {
            this.logger.error('Product fetching error', err);
            return errorHandler(res, err);
        }
    }

    async updateProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.body._id;

            const productId = req.body.product_id;
            const name: string = req.body.name;
            const cost: number = req.body.cost;
            const amountAvailable: number = req.body.amount_available;

            if (!name && !cost && !amountAvailable) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.OK,
                    'Nothing to update', true
                );
            }

            const user = await this.userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new ApiError(
                    ErrorType.SECURITY_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'User not found in db after authentication succeeded',
                    true
                );
            }

            const product = await this.productRepo.findOne({ where: { id: productId } });

            if (!product) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.NOT_FOUND,
                    'Product not found',
                    true
                );
            }

            if (product.sellerId != user.id) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'You are not authorized to perform this action',
                    true
                );
            }

            const productData = {};

            if (name) {
                productData['name'] = name;
            }
            if (cost) {
                productData['cost'] = cost;
            }
            if (amountAvailable) {
                productData['amountAvailable'] = amountAvailable;
            }

            const modifiedProduct = await this.productRepo.update(product, productData);

            if (!modifiedProduct) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Product not updated. something wrong happend, try again later', true
                );
            }

            const resData = {
                id: modifiedProduct.id,
                name: modifiedProduct.name,
                cost: modifiedProduct.cost,
                amount_available: modifiedProduct.amountAvailable,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product updated', null, resData);
        } catch (err) {
            this.logger.error('Product updating error', err);
            return errorHandler(res, err);
        }
    }

    async deleteProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.body._id;
            const productId = req.body.product_id;

            const user = await this.userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new ApiError(
                    ErrorType.SECURITY_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'User not found in db after authentication succeeded',
                    true
                );
            }

            const product = await this.productRepo.findOne({ where: { id: productId } });

            if (!product) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.NOT_FOUND,
                    'Product not found',
                    true
                );
            }

            if (product.sellerId != user.id) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'You are not authorized to perform this action', true
                );
            }

            const deleted = await this.productRepo.delete({ where: { id: product.id } });

            if (deleted) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'Product not deleted. try again later',
                    true
                );
            }

            const resData = {
                id: product.id,
                name: product.name,
                cost: product.cost,
                amount_available: product.amountAvailable,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product deleted', null, resData);
        } catch (err) {
            this.logger.error('Product deleting error', err);
            return errorHandler(res, err);
        }
    }
}

export default ProductController.Instance;