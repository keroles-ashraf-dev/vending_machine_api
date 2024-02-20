import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { ApiError } from 'utils/error';
import { ErrorType, HttpStatusCode, UserRole } from 'utils/type';
import apiRes from 'utils/api.response';
import LoggerService from 'services/logger';
import UserRepo, { BaseUserRepo } from 'app/repositories/v1/user.repo';

class UserController {
    private static _instance: UserController;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            new LoggerService('user.controller'), UserRepo,
        ));
    }
    private constructor(logger: LoggerService, userRepo: BaseUserRepo) {
        this.logger = logger;
        this.userRepo = userRepo;
    }

    private logger: LoggerService;
    private userRepo: BaseUserRepo;

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const username: string = req.body.username;
            const password: string = req.body.password;
            const role: string = req.body.role;

            const isUsernameExist = await this.userRepo.findOne({ where: { username: username } });

            if (isUsernameExist) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.OK,
                    'Username is exist', true
                );
            }

            const userData = {
                username: username,
                password: password,
                role: role,
            }

            const user = await this.userRepo.create(userData);

            if (!user) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'User not created. something wrong happend, try again later', true
                );
            }

            const resData = {
                id: user.id,
                username: user.username,
                role: user.role,
            }

            this.logger.error('User creating succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully user created', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    getUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req['_user']['id'];

            const user = await this.userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new ApiError(
                    ErrorType.SECURITY_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'User not found in db after authentication succeeded',
                    true
                );
            }

            const resData = {
                username: user.username,
                role: user.role,
                deposit: user.deposit,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully user fetched', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req['_user']['id'];
            const username = req.body.username;
            const password = req.body.password;

            if (!username && !password) {
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

            const userData = {};

            if (username) {
                const isUsernameExist = await this.userRepo.findOne({ where: { username: username } });

                if (isUsernameExist) {
                    throw new ApiError(
                        ErrorType.GENERAL_ERROR,
                        HttpStatusCode.OK,
                        'Username is exist', true
                    );
                }

                userData['username'] = username;
            }

            if (password) {
                userData['password'] = password;
            }

            const modifiedUser = await this.userRepo.update(user, userData);

            if (!modifiedUser) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'User not updated. something wrong happend, try again later', true
                );
            }

            const resData = {
                id: modifiedUser.id,
                username: modifiedUser.username,
                role: modifiedUser.role,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully user updated', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req['_user']['id'];
            const password = req.body.password;

            const user = await this.userRepo.findOne({ where: { id: userId } });

            if (!user) {
                throw new ApiError(
                    ErrorType.SECURITY_ERROR,
                    HttpStatusCode.FORBIDDEN,
                    'User not found in db after authentication succeeded',
                    true
                );
            }

            if (!(await bcrypt.compare(password, user.password))) {
                throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.FORBIDDEN, 'Invalid password', true);
            }

            const deleted = await this.userRepo.delete({ where: { id: user.id } });

            if (!deleted) {
                throw new ApiError(
                    ErrorType.UNKNOWN_ERROR,
                    HttpStatusCode.INTERNAL_SERVER_ERROR,
                    'User not deleted. try again later',
                    true
                );
            }

            const resData = {
                username: user.username,
            }

            this.logger.error('User deleting succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully user deleted', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}

export default UserController.Instance;