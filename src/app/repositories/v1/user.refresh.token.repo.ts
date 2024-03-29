import User from 'app/models/user.model';
import UserRefreshToken from 'app/models/user.refresh.token.model';

export interface BaseUserRefreshTokenRepo {
    create(user: User): Promise<string>;

    findOne(query: any): Promise<UserRefreshToken>;

    verifyExpiration(userrefreshtoken: UserRefreshToken): boolean;
}

// singleton class
class UserRefreshTokenRepo implements BaseUserRefreshTokenRepo {
    private static _instance: UserRefreshTokenRepo;
    private constructor() { }
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    create = async (user: User): Promise<string> => {
        const token = await UserRefreshToken.createToken(user);

        return token;
    }

    findOne = async (query: any): Promise<UserRefreshToken> => {
        const userrefreshtoken = await UserRefreshToken.findOne(query);

        return userrefreshtoken;
    }

    verifyExpiration = (token: UserRefreshToken): boolean => {
        const valid = UserRefreshToken.verifyExpiration(token);

        return valid;
    }
}

export default UserRefreshTokenRepo.Instance;