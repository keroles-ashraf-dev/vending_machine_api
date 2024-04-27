import "reflect-metadata";
import { inject, injectable, singleton } from 'tsyringe';
import UserRefreshToken from 'app/models/user.refresh.token.model';
import { BaseUserRepo } from 'app/repositories/v1/user.repo';
import { BaseUserRefreshTokenRepo } from 'app/repositories/v1/user.refresh.token.repo';
import bcrypt from 'bcryptjs';
import { ApiError } from 'helpers/error';
import { BaseJWT } from 'helpers/jwt';
import { ErrorType, HttpStatusCode } from 'utils/type';
import User from 'app/models/user.model';

@injectable()
@singleton()
export class AuthService {
    constructor(
        @inject('BaseUserRepo') private userRepo: BaseUserRepo,
        @inject('BaseUserRefreshTokenRepo') private userRefreshTokenRepo: BaseUserRefreshTokenRepo,
        @inject('BaseJWT') private jwt: BaseJWT,
    ) { }

    login = async (username: string, password: string) => {
        const user = await this.userRepo.findOne({ where: { username: username } });

        if (!user) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'User not found', true);
        }

        const isPasswordValid = await this.isUserPasswordValid(user.password, password);

        if (!isPasswordValid) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid username or password');
        }

        const accessToken = this.generateAccessToken({ _id: user.id, _role: user.role });

        if (!accessToken) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, 'something wrong happend, try again later');
        }

        const refreshToken = await this.createRefreshToken(user.id);

        if (!refreshToken) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, 'something wrong happend, try again later');
        }

        const data = {
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        }

        return data;
    }

    refreshToken = async (refreshToken: string) => {
        const token = await this.getRefreshTokenByToken(refreshToken);

        if (!token) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'Refresh token not found');
        }

        const isRefreshTokenValid = this.verifyRefreshTokenExpiration(token.expiryDate);

        if (!isRefreshTokenValid) {
            await this.deleteRefreshToken({ where: { token: token.token } });

            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.FORBIDDEN,
                'Refresh token has expired. Please make a new login request',
            );
        }

        const user = await this.getUserById(token.userId);

        if (!user) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'User not found');
        }

        const accessToken = this.generateAccessToken({ _id: user.id, _role: user.role });

        if (!accessToken) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, 'something wrong happend, try again later');
        }

        const data = {
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        }

        return data;
    }

    getUserById = async (userId: number): Promise<User | null> => {
        const user = await this.userRepo.findOne({ where: { id: userId } });

        return user;
    }

    isUserPasswordValid = async (userPassword: string, password: string): Promise<boolean> => {
        const isValid = await bcrypt.compare(password, userPassword);

        return isValid;
    }

    generateAccessToken = (data: object): string | null => {
        const accessToken = this.jwt.sign(data);

        return accessToken;
    }

    createRefreshToken = async (userId: number): Promise<string | null> => {
        const refreshToken = await this.userRefreshTokenRepo.create(userId);

        return refreshToken;
    }

    getRefreshTokenByToken = async (refreshToken: string): Promise<UserRefreshToken | null> => {
        const token = await this.userRefreshTokenRepo.findOne({ where: { token: refreshToken } });

        return token;
    }

    verifyRefreshTokenExpiration = (expirationDate: Date): boolean => {
        const isValid = this.userRefreshTokenRepo.verifyExpiration(expirationDate);

        return isValid;
    }

    deleteRefreshToken = async (query: object): Promise<boolean> => {
        const deleted = await this.userRefreshTokenRepo.delete(query);

        return deleted;
    }
}