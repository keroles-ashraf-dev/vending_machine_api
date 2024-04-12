import { BaseUserRepo } from 'app/repositories/v1/user.repo';
import { BaseUserRefreshTokenRepo } from 'app/repositories/v1/user.refresh.token.repo';
import { AuthService } from './auth.service';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode, UserRole } from 'utils/type';
import User from 'app/models/user.model';
import { BaseJWT } from 'helpers/jwt';

// jest.mock('app/repositories/v1/user.repo', () => {
//     return {
//         BaseUserRepo: jest.fn().mockImplementation(() => {
//             return {
//                 findOne: findOne
//             };
//         })
//     };
// });
// jest.mock('app/repositories/v1/user.refresh.token.repo');
// jest.mock('helpers/jwt');

const findOne = jest.fn().mockImplementation(() => {
    return null;
});

const mockedUserRepo: jest.Mocked<BaseUserRepo> = {
    findOne: findOne,
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const mockedUserRefreshTokenRepo: jest.Mocked<BaseUserRefreshTokenRepo> = {
    create: jest.fn(),
    findOne: jest.fn(),
    verifyExpiration: jest.fn(),
    delete: jest.fn(),
};

const mockedJWT: jest.Mocked<BaseJWT> = {
    sign: jest.fn(),
    verify: jest.fn(),
};

// beforeEach(() => {
//     mockedUserRepo.mockClear();
//     mockedUserRefreshTokenRepo.mockClear();
//     mockedJWT.mockClear();
// });

describe('login', () => {
    let authServie = new AuthService(mockedUserRepo, mockedUserRefreshTokenRepo, mockedJWT);

    it('it should throw error if user not found', async () => {
        await expect(authServie.login('john', '123456')).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'User not found', true)
        );
    });

    authServie = new AuthService(mockedUserRepo, mockedUserRefreshTokenRepo, mockedJWT);
    authServie.isUserPasswordValid = jest.fn().mockResolvedValue(false);
    it('it should throw error if user password not valid', async () => {
        await expect(authServie.login('john', '123456')).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid username or password')
        );
    });

    authServie.isUserPasswordValid = jest.fn().mockResolvedValue(false);
    it('it should throw error if user password not valid', async () => {
        await expect(authServie.login('john', '123456')).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid username or password')
        );
    });

    authServie.generateAccessToken = jest.fn().mockResolvedValue(null);
    it('it should throw error if could not generate access token', async () => {
        await expect(authServie.login('john', '123456')).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, 'something wrong happend, try again later')
        );
    });

    authServie.createRefreshToken = jest.fn().mockResolvedValue(null);
    it('it should throw error if could not create refresh token', async () => {
        await expect(authServie.login('john', '123456')).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, 'something wrong happend, try again later')
        );
    });

    const user = User.build({
        id: 1,
        username: 'john',
        password: '123456',
        role: UserRole.BUYER,
        deposit: 0.0,
    });
    const accessToken = 'abcdefghjklmnopq';
    const refreshToken = 'wcvedwfcwcfvewrfw';

    //mockedUserRepo.findOne = jest.fn().mockResolvedValue(user);
    // @ts-ignore
    authServie = new AuthService(mockedUserRepo, mockedUserRefreshTokenRepo, mockedJWT);
    authServie.isUserPasswordValid = jest.fn().mockResolvedValue(true);
    authServie.generateAccessToken = jest.fn().mockResolvedValue(accessToken);
    authServie.createRefreshToken = jest.fn().mockResolvedValue(refreshToken);
    it('it should return object of user, access token and refresh token', async () => {
        await expect(authServie.login('john', '123456')).resolves.toEqual({
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    });
});