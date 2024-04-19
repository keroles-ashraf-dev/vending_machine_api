import { Request, Response, NextFunction } from 'express';
import { inject, injectable, singleton } from 'tsyringe';
import { HttpStatusCode } from 'utils/type';
import apiRes from 'helpers/api.response';
import { Logger } from 'helpers/logger';
import { UserService } from 'app/services/v1/user.service';

@injectable()
@singleton()
export class UserController {
    constructor(
        @inject('UserLogger') private logger: Logger,
        @inject(UserService) private userService: UserService,
    ) { }

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await this.userService.createUser(req.body);

            const resData: Record<string, any> = {
                id: data.id,
                username: data.username,
                role: data.role,
            }

            this.logger.error('User creating succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully user created', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    getUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            const userId = req._user.id;

            const data = await this.userService.getUser(userId);

            const resData = {
                username: data.username,
                role: data.role,
                deposit: data.deposit,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully user fetched', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = {
                // @ts-ignore
                id: req._user.id,
                username: req.body.username,
                password: req.body.password,
            }

            const data = await this.userService.updateUser(userData);

            const resData = {
                id: data.id,
                username: data.username,
                role: data.role,
            }

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully user updated', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData = {
                // @ts-ignore
                id: req._user.id,
                password: req.body.password,
            }

            const data = await this.userService.deleteUser(userData);

            const resData = {
                username: data.username,
            }

            this.logger.error('User deleting succeeded', resData);

            return apiRes(res, HttpStatusCode.CREATED, 'Successfully user deleted', null, resData);
        } catch (err) {
            next(err); // Pass error to error-handler middleware
        }
    }
}