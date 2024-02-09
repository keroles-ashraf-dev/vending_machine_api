import { Router } from 'express';
import coinCtrl from 'src/app/controllers/v1/coin.controller'
import validate from 'src/app/middelwares/validate';
import { createSchema } from 'src/app/validations/coin.validation';

const router = Router();

router.post('/coins/create', validate(createSchema), coinCtrl.create);

export default router;