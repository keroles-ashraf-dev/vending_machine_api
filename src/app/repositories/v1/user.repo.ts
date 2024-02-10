import User from 'app/models/user.model';

export interface BaseUserRepo {
    create(data: any): Promise<User>;

    findOne(query: any): Promise<User>;

    findAll(query: any): Promise<User[]>;

    update(user: User | number, data: any): Promise<User>;

    delete(query: any): Promise<boolean>;
}

// singleton class
class UserRepo implements BaseUserRepo {
    private static _instance: UserRepo;
    private constructor() { }
    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    create = async (data: any): Promise<User> => {
        const user = await User.create(data);

        return user;
    }

    findOne = async (query: any): Promise<User> => {
        const user = await User.findOne(query);

        return user;
    }

    findAll = async (query: any): Promise<User[]> => {
        const users = await User.findAll(query);

        return users;
    }

    update = async (userOrId: User | number, data: any): Promise<User> => {
        let user: User;

        if (userOrId instanceof Number) {
            user = await this.findOne({ where: { id: userOrId } });
        } else {
            user = userOrId as User;
        }

        const modifiedUser = await user.update(data);

        return modifiedUser;
    }

    delete = async (query: any): Promise<boolean> => {
        const deletedNum = await User.destroy(query);

        return deletedNum > 0 ? true : false;
    }
}

export default UserRepo.Instance;