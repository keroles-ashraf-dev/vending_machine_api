import UserRepo, { BaseUserRepo } from 'app/repositories/v1/user.repo';
import User from 'app/models/user.model';

export default class UserService {
    private static _instance: UserService;
    public static get Instance() {
        return this._instance || (this._instance = new this(
            UserRepo,
        ));
    }
    private constructor(
        userRepo: BaseUserRepo,
    ) {
        this.userRepo = userRepo;
    }

    private userRepo: BaseUserRepo;

    getUserByUsername = async (username: string): Promise<User | null> => {
        const user = await this.userRepo.findOne({ where: { username: username } });

        return user;
    }

    getUserById = async (userId: number): Promise<User | null> => {
        const user = await this.userRepo.findOne({ where: { id: userId } });

        return user;
    }
}