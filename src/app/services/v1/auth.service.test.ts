import { faker } from '@faker-js/faker';
import { BaseUserRepo } from 'app/repositories/v1/user.repo';
import { BaseUserRefreshTokenRepo } from 'app/repositories/v1/user.refresh.token.repo';
import { AuthService } from './auth.service';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode, UserRole } from 'utils/type';
import User from 'app/models/user.model';
import { BaseJWT } from 'helpers/jwt';

describe('login', () => {
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
    
    const username = faker.internet.userName();
    const password = faker.internet.password();
    const accessToken = faker.string.uuid();
    const refreshToken = faker.string.uuid();
    
    const user = User.build({
        id: 1,
        username: username,
        password: password,
        role: UserRole.BUYER,
        deposit: 0.0,
    });

    it('it should throw error if user not found', async () => {
        const mockedUserRepo: jest.Mocked<BaseUserRepo> = {
            findOne: jest.fn().mockResolvedValue(null),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const authServie = new AuthService(mockedUserRepo, mockedUserRefreshTokenRepo, mockedJWT);

        await expect(authServie.login(username, password)).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.NOT_FOUND, 'User not found', true)
        );
    });

    it('it should throw error if user password not valid', async () => {
        const mockedUserRepo: jest.Mocked<BaseUserRepo> = {
            findOne: jest.fn().mockResolvedValue(user),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const authServie = new AuthService(mockedUserRepo, mockedUserRefreshTokenRepo, mockedJWT);
        authServie.isUserPasswordValid = jest.fn().mockResolvedValue(false);

        await expect(authServie.login(username, password)).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.UNAUTHORIZED, 'Invalid username or password')
        );
    });

    it('it should throw error if could not generate access token', async () => {
        const mockedUserRepo: jest.Mocked<BaseUserRepo> = {
            findOne: jest.fn().mockResolvedValue(user),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const authServie = new AuthService(mockedUserRepo, mockedUserRefreshTokenRepo, mockedJWT);
        authServie.isUserPasswordValid = jest.fn().mockResolvedValue(true);
        authServie.generateAccessToken = jest.fn().mockReturnValue(null);

        await expect(authServie.login(username, password)).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, 'something wrong happend, try again later')
        );
    });

    it('it should throw error if could not create refresh token', async () => {
        const mockedUserRepo: jest.Mocked<BaseUserRepo> = {
            findOne: jest.fn().mockResolvedValue(user),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const authServie = new AuthService(mockedUserRepo, mockedUserRefreshTokenRepo, mockedJWT);
        authServie.isUserPasswordValid = jest.fn().mockResolvedValue(true);
        authServie.generateAccessToken = jest.fn().mockReturnValue(accessToken);
        authServie.createRefreshToken = jest.fn().mockResolvedValue(null);

        await expect(authServie.login(username, password)).rejects.toThrow(
            new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, 'something wrong happend, try again later')
        );
    });

    it('it should return object of user, access token and refresh token', async () => {
        const mockedUserRepo: jest.Mocked<BaseUserRepo> = {
            findOne: jest.fn().mockResolvedValue(user),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        const authServie = new AuthService(mockedUserRepo, mockedUserRefreshTokenRepo, mockedJWT);
        authServie.isUserPasswordValid = jest.fn().mockResolvedValue(true);
        authServie.generateAccessToken = jest.fn().mockReturnValue(accessToken);
        authServie.createRefreshToken = jest.fn().mockResolvedValue(refreshToken);

        await expect(authServie.login(username, password)).resolves.toEqual({
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    });
});