import { faker } from '@faker-js/faker';
import { UserRepo } from 'app/repositories/v1/user.repo';
import { UserRole } from 'utils/type';
import connection from 'db/connection';

beforeAll(async () => {
    await connection.sync({ force: true });
});

beforeEach(async () => {
    await connection.truncate();
});

afterAll(async () => {
    await connection.drop();
    await connection.close();
});

describe('create', () => {
    it('it should return null after failing to insert in db', async () => {
        // Arrange
        const userRepo = new UserRepo();

        // Act
        const res = await userRepo.create({});

        // Assert
        expect(res).toBeNull();
    });

    it('it should return user object after successfully inserted in db', async () => {
        // Arrange
        const username = faker.internet.userName();
        const password = faker.internet.password();
        const role = UserRole.BUYER;
        const userData = {
            username: username,
            password: password,
            role: role,
        }
        const userRepo = new UserRepo();

        // Act
        const res = await userRepo.create(userData);

        // Assert
        expect(res).toMatchObject(userData);
    });
});