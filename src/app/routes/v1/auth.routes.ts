import { Router } from 'express';
import authCtrl from 'app/controllers/v1/auth.controller'
import validate from 'app/middelwares/validate';
import { loginSchema, refreshTokenSchema } from 'app/validations/auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), authCtrl.login);
router.post('/token/refresh', validate(refreshTokenSchema), authCtrl.refreshToken);

export default router;