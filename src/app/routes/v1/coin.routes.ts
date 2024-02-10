import { Router } from 'express';
import coinCtrl from 'app/controllers/v1/coin.controller'
import validate from 'app/middelwares/validate';
import { createSchema } from 'app/validations/coin.validation';

const router = Router();

router.post('/coins/create', validate(createSchema), coinCtrl.create);

export default router;