import { Request, Response, NextFunction } from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import apiRes from 'utils/api.response';
import { Logger } from 'helpers/logger';
import { BaseProductRepo } from 'app/repositories/v1/product.repo';
import { BaseUserRepo } from 'app/repositories/v1/user.repo';

@injectable()
@singleton()
export class ProductController {
    constructor(
        @inject('ProductLogger') private logger: Logger,
        @inject('BaseProductRepo') private productRepo: BaseProductRepo,
        @inject('BaseUserRepo') private userRepo: BaseUserRepo,
    ) { }

    createProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            const userId = req._user.id;

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

            this.logger.error('Product creating succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product created', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    getProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = req.params.product_id;

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
            next(err); // Pass error to error-handler middleware
        }
    }

    updateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            const userId = req._user.id;

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
                // @ts-ignore
                productData.name = name;
            }
            if (cost) {
                // @ts-ignore
                productData.cost = cost;
            }
            if (amountAvailable) {
                // @ts-ignore
                productData.amountAvailable = amountAvailable;
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

            this.logger.error('Product updating succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product updated', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            const userId = req._user.id;
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

            this.logger.error('Product deleting succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product deleted', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}