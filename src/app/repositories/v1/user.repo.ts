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

    async create(data: any): Promise<User> {
        const user = await User.create(data);

        return user;
    }

    async findOne(query: any): Promise<User> {
        const user = await User.findOne(query);

        return user;
    }

    async findAll(query: any): Promise<User[]> {
        const users = await User.findAll(query);

        return users;
    }

    async update(userOrId: User | number, data: any): Promise<User> {
        let user: User;

        if (userOrId instanceof Number) {
            user = await this.findOne({ where: { id: user } });
        } else {
            user = userOrId as User;
        }

        const modifiedUser = await user.update(data);

        return modifiedUser;
    }

    async delete(query: any): Promise<boolean> {
        await User.destroy(query);

        const users = await this.findAll(query);

        return !users;
    }
}

export default UserRepo.Instance;