import UserRefreshTokenRepo, { BaseUserRefreshTokenRepo } from 'app/repositories/v1/user.refresh.token.repo';
import UserRefreshToken from 'app/models/user.refresh.token.model';

export default class UserRefreshTokenService {
    private static _instance: UserRefreshTokenService;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            UserRefreshTokenRepo,
        ));
    }
    private constructor(
        userRefreshTokenRepo: BaseUserRefreshTokenRepo
    ) {
        this.userRefreshTokenRepo = userRefreshTokenRepo;
    }

    private userRefreshTokenRepo: BaseUserRefreshTokenRepo;

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