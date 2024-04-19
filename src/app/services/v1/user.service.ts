import "reflect-metadata";
import { inject, injectable, singleton } from 'tsyringe';
import bcrypt from 'bcryptjs';
import { BaseUserRepo } from 'app/repositories/v1/user.repo';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import User from 'app/models/user.model';

@injectable()
@singleton()
export class UserService {
    constructor(
        @inject('BaseUserRepo') private userRepo: BaseUserRepo,
    ) { }

    createUser = async (data: Record<string, any>): Promise<Record<string, any>> => {
        const username: string = data.username;
        const password: string = data.password;
        const role: string = data.role;

        const isUsernameTaken = await this.isUsernameTaken(username);

        if (isUsernameTaken) {
            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.OK,
                'Username is exist', true
            );
        }

        const userData: Record<string, any> = {
            username: username,
            password: password,
            role: role,
        }

        const user = await this.userRepo.create(userData);

        if (!user) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'User not created. something wrong happened, try again later',
            );
        }

        const userCreatedData: Record<string, any> = {
            id: user.id,
            username: user.username,
            role: user.role,
        }

        return userCreatedData;
    }

    getUser = async (userId: number): Promise<Record<string, any>> => {
        const user = await this.getUserById(userId);

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const userData = {
            username: user.username,
            role: user.role,
            deposit: user.deposit,
        }

        return userData;
    }

    updateUser = async (data: Record<string, any>): Promise<Record<string, any>> => {
        const userId = data.id;
        const username = data.username;
        const password = data.password;

        if (!username && !password) {
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

        const userData: Record<string, any> = {};

        if (username) {
            const isUsernameTaken = await this.isUsernameTaken(username);

            if (isUsernameTaken) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.OK,
                    'Username is exist', true
                );
            }


            userData.username = username;
        }

        if (password) {

            userData.password = password;
        }

        const modifiedUser = await this.userRepo.update(user, userData);

        if (!modifiedUser) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'User not updated. something wrong happened, try again later',
            );
        }

        const updatedUserData = {
            id: modifiedUser.id,
            username: modifiedUser.username,
            role: modifiedUser.role,
        }

        return updatedUserData;
    }

    deleteUser = async (data: Record<string, any>): Promise<Record<string, any>> => {
        const userId = data.id;
        const password = data.password;

        const user = await this.getUserById(userId);

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        if (!(await bcrypt.compare(password, user.password))) {
            throw new ApiError(ErrorType.GENERAL_ERROR, HttpStatusCode.FORBIDDEN, 'Invalid password');
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

        const deletedUserData = {
            username: user.username,
        }

        return deletedUserData;
    }

    getUserById = async (userId: number): Promise<User | null> => {
        const user = await this.userRepo.findOne({ where: { id: userId } });

        return user;
    }

    isUsernameTaken = async (username: string): Promise<User | null> => {
        const isUsernameExist = await this.userRepo.findOne({ where: { username: username } });

        return isUsernameExist;
    }
}