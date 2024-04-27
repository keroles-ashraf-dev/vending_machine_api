import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from 'app/controllers/v1/user.controller'
import validate from 'app/middlewares/validate';
import { createSchema, updateSchema, deleteSchema } from 'app/validations/user.validation';
import authenticate from 'app/middlewares/authenticate';

const router = Router();
const userCtrl = container.resolve(UserController);

router.post('/users/create', validate(createSchema), userCtrl.createUser);
router.get('/users/get', authenticate, userCtrl.getUser);
router.put('/users/update', authenticate, validate(updateSchema), userCtrl.updateUser);
router.delete('/users/delete', authenticate, validate(deleteSchema), userCtrl.deleteUser);

export default router;