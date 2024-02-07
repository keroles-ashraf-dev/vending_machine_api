import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from 'app/models/user.model';

async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username: username } });

        if (!(await bcrypt.compare(password, user.password))) {

        }

        let newUser = req.body as User;
        UserMap(database);
        const result = await User.create(newUser);
        newUser = result.dataValues as User;
        res.status(201).json({ user: newUser });
    } catch (err) {

    }
};

export default {
    login,
}