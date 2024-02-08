import { Request, Response, NextFunction } from 'express';
import User from 'app/models/user.model';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode, UserRole } from 'src/utils/type';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';
import Product from 'app/models/product.model';

const logger = new LoggerService('product.controller');

async function createProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.body._id;

        const name: string = req.body.name;
        const cost: string = req.body.cost;
        const amountAvailable: string = req.body.amount_available;

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const product = await Product.create({
            sellerId: user.id,
            name: name,
            cost: cost,
            amountAvailable: amountAvailable,
        });

        if (!product) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Product not created. something wrong happend, try again later', true
            );
        }

        const data = {
            id: product.id,
            name: product.name,
            cost: product.cost,
            amount_available: product.amountAvailable,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product created', null, data);
    } catch (err) {
        logger.error('Product creating error', err);
        return errorHandler(res, err);
    }
}

async function getProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const productId = req.body.product_id;

        const product = await Product.findOne({ where: { id: productId } });

        if (!product) {
            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.NOT_FOUND,
                'Product not found',
                true
            );
        }

        const data = {
            id: product.id,
            name: product.name,
            cost: product.cost,
            amount_available: product.amountAvailable,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product fetched', null, data);
    } catch (err) {
        logger.error('Product fetching error', err);
        return errorHandler(res, err);
    }
}

async function updateProduct(req: Request, res: Response, next: NextFunction) {
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

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const product = await Product.findOne({ where: { id: productId } });

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

        if (name) {
            product.name = name;
        }
        if (cost) {
            product.cost = cost;
        }
        if (amountAvailable) {
            product.amountAvailable = amountAvailable;
        }

        const modifiedProduct = await product.save();

        if (!modifiedProduct) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Product not updated. something wrong happend, try again later', true
            );
        }

        const data = {
            id: modifiedProduct.id,
            name: modifiedProduct.name,
            cost: modifiedProduct.cost,
            amount_available: modifiedProduct.amountAvailable,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product updated', null, data);
    } catch (err) {
        logger.error('Product updating error', err);
        return errorHandler(res, err);
    }
}

async function deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.body._id;
        const productId = req.body.product_id;

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const product = await Product.findOne({ where: { id: productId } });

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

        await product.destroy();

        const deletedProduct = await Product.findOne({ where: { id: product.id } });

        if (deletedProduct) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Product not deleted. try again later',
                true
            );
        }

        const data = {
            id: product.id,
            name: product.name,
            cost: product.cost,
            amount_available: product.amountAvailable,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully product deleted', null, data);
    } catch (err) {
        logger.error('Product deleting error', err);
        return errorHandler(res, err);
    }
}

export default {
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
}