import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from 'app/models/user.model';
import { ApiError, errorHandler } from 'src/utils/error';
import { ErrorType, HttpStatusCode } from 'src/utils/type';
import apiRes from 'src/utils/api.response';
import LoggerService from 'src/services/logger';

const logger = new LoggerService('user.controller');

async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const username: string = req.body.username;
        const password: string = req.body.password;
        const role: string = req.body.role;

        const isUsernameExist = await User.findOne({ where: { username: username } });

        if (isUsernameExist) {
            throw new ApiError(
                ErrorType.GENERAL_ERROR,
                HttpStatusCode.OK,
                'Username is exist', true
            );
        }

        const user = await User.create({
            username: username,
            password: password,
            role: role,
        });

        if (!user) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'User not created. something wrong happend, try again later', true
            );
        }

        const data = {
            id: user.id,
            username: user.username,
            role: user.role,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully user created', null, data);
    } catch (err) {
        logger.error('User creating error', err);
        return errorHandler(res, err);
    }
}

async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.body._id;

        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            throw new ApiError(
                ErrorType.SECURITY_ERROR,
                HttpStatusCode.FORBIDDEN,
                'User not found in db after authentication succeeded',
                true
            );
        }

        const data = {
            username: user.username,
            role: user.role,
            deposit: user.deposit,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully user fetched', null, data);
    } catch (err) {
        logger.error('User fetching error', err);
        return errorHandler(res, err);
    }
}

async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.body._id;
        const username = req.body.username;
        const password = req.body.password;

        if (!username && !password) {
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

        if (username) {
            const isUsernameExist = await User.findOne({ where: { username: username } });

            if (isUsernameExist) {
                throw new ApiError(
                    ErrorType.GENERAL_ERROR,
                    HttpStatusCode.OK,
                    'Username is exist', true
                );
            }

            user.username = username;
        }

        if (password) {
            user.password = password;
        }

        const modifiedUser = await user.save();

        if (!modifiedUser) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'User not updated. something wrong happend, try again later', true
            );
        }

        const data = {
            id: modifiedUser.id,
            username: modifiedUser.username,
            role: modifiedUser.role,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully user updated', null, data);
    } catch (err) {
        logger.error('User updating error', err);
        return errorHandler(res, err);
    }
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.body._id;
        const password = req.body.password;

        const user = await User.findOne({ where: { id: userId } });

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

        await user.destroy();

        const deletedUser = await User.findOne({ where: { id: user.id } });

        if (deletedUser) {
            throw new ApiError(
                ErrorType.UNKNOWN_ERROR,
                HttpStatusCode.INTERNAL_SERVER_ERROR,
                'User not deleted. try again later',
                true
            );
        }

        const data = {
            username: user.username,
        }

        return apiRes(res, HttpStatusCode.CREATED, 'Sucessfully user deleted', null, data);
    } catch (err) {
        logger.error('User deleting error', err);
        return errorHandler(res, err);
    }
}

export default {
    createUser,
    getUser,
    updateUser,
    deleteUser,
}