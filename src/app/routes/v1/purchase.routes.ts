import { Router } from 'express';
import purchaseCtrl from 'src/app/controllers/v1/purchase.controller'
import validate from 'src/app/middelwares/validate';
import { buySchema } from 'src/app/validations/purchase.validation';
import authenticate from 'src/app/middelwares/authenticate';
import authorize from 'src/app/middelwares/authorize';
import { UserRole } from 'src/utils/type';

const router = Router();

router.post('/buy', authenticate, authorize([UserRole.BUYER]), validate(buySchema), purchaseCtrl.buy);

export default router;