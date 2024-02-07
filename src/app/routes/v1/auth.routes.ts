import { Router } from 'express';
import authCtrl from 'app/controllers/v1/auth.controller'

const router = Router();

router.post('/login', authCtrl.login);

export default router;