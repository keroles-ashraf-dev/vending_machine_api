import "reflect-metadata";
import { singleton } from 'tsyringe';
import UserRefreshToken from 'app/models/user.refresh.token.model';

export interface BaseUserRefreshTokenRepo {
    create(userId: number): Promise<string>;

    findOne(query: any): Promise<UserRefreshToken>;

    verifyExpiration(expiryDate: Date): boolean;

    delete(query: any): Promise<boolean>;
}

@singleton() 
export class UserRefreshTokenRepo implements BaseUserRefreshTokenRepo {
    create = async (userId: number): Promise<string> => {
        const token = await UserRefreshToken.createToken(userId);

        return token;
    }

    findOne = async (query: any): Promise<UserRefreshToken> => {
        const userrefreshtoken = await UserRefreshToken.findOne(query);

        return userrefreshtoken;
    }

    verifyExpiration = (expiryDate: Date): boolean => {
        const valid = UserRefreshToken.verifyExpiration(expiryDate);

        return valid;
    }

    delete = async (query: any): Promise<boolean> => {
        const deletedNum = await UserRefreshToken.destroy(query);

        return deletedNum > 0;
    }
}