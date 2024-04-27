import { Router } from 'express';
import { container } from 'tsyringe';
import {CoinController} from 'app/controllers/v1/coin.controller'
import validate from 'app/middlewares/validate';
import { createSchema } from 'app/validations/coin.validation';

const router = Router();
const coinCtrl = container.resolve(CoinController);

router.post('/coins/create', validate(createSchema), coinCtrl.create);

export default router;