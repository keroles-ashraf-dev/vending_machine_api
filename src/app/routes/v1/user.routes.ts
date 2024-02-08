import { Router } from 'express';
import userCtrl from 'app/controllers/v1/user.controller'
import validate from 'app/middelwares/validate';
import { createSchema, updateSchema, deleteSchema } from 'app/validations/user.validation';
import authenticate from 'app/middelwares/authenticate';

const router = Router();

router.post('/users/create', validate(createSchema), userCtrl.createUser);
router.get('/users/get', authenticate, userCtrl.getUser);
router.put('/users/update', authenticate, validate(updateSchema), userCtrl.updateUser);
router.delete('/users/delete', authenticate, validate(deleteSchema), userCtrl.deleteUser);

export default router;