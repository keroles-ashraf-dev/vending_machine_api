import "reflect-metadata";
import { inject, injectable, singleton } from 'tsyringe';
import { BaseUserRepo } from 'app/repositories/v1/user.repo';
import { BaseProductRepo } from 'app/repositories/v1/product.repo';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import User from 'app/models/user.model';
import Product from "app/models/product.model";

@injectable()
@singleton()
export class ProductService {
    constructor(
        @inject('BaseProductRepo') private productRepo: BaseProductRepo,
        @inject('BaseUserRepo') private userRepo: BaseUserRepo,
    ) { }

    createProduct = async (data: Record<string, any>): Promise<Record<string, any>> => {
        const userId: number = data.userId;
        const name: string = data.name;
        const cost: string = data.cost;
        const amountAvailable: string = data.amountAvailable;

        const user = await this.getUserById(userId);

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
                'Product not created. something wrong happened, try again later'
            );
        }

        const createdProductData = {
            id: product.id,
            name: product.name,
            cost: product.cost,
            amount_available: product.amountAvailable,
        }

        return createdProductData;
    }

    getProduct = async (productId: number): Promise<Record<string, any>> => {
        const product = await this.getProductById(productId);

        if (!product) {
            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.NOT_FOUND,
                'Product not found',
                true
            );
        }

        const productData = {
            id: product.id,
            name: product.name,
            cost: product.cost,
            amountAvailable: product.amountAvailable,
        }

        return productData;
    }

    updateProduct = async (data: Record<string, any>): Promise<Record<string, any>> => {
        const userId = data.userId;
        const productId = data.productId;
        const name: string = data.name;
        const cost: number = data.cost;
        const amountAvailable: number = data.amountAvailable;

        if (!name && !cost && !amountAvailable) {
            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.OK,
                'Nothing to update', true
            );
        }

        const user = await this.getUserById(userId);

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const product = await this.getProductById(productId);

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

        const productData: Record<string, any> = {};

        if (name) {
            productData.name = name;
        }
        if (cost) {
            productData.cost = cost;
        }
        if (amountAvailable) {
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

        const updatedProductData = {
            id: modifiedProduct.id,
            name: modifiedProduct.name,
            cost: modifiedProduct.cost,
            amountAvailable: modifiedProduct.amountAvailable,
        }

        return updatedProductData;
    }

    deleteProduct = async (data: Record<string, any>): Promise<Record<string, any>> => {
        const userId = data.userId;
        const productId = data.productId;

        const user = await this.getUserById(userId);

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const product = await this.getProductById(productId);

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

        if (!deleted) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'Product not deleted. try again later',
            );
        }

        const deletedProductData = {
            id: product.id,
            name: product.name,
            cost: product.cost,
            amountAvailable: product.amountAvailable,
        }
        return deletedProductData;
    }

    getUserById = async (userId: number): Promise<User | null> => {
        const user = await this.userRepo.findOne({ where: { id: userId } });

        return user;
    }

    getProductById = async (productId: number): Promise<Product | null> => {
        const product = await this.productRepo.findOne({ where: { id: productId } });

        return product;
    }
}