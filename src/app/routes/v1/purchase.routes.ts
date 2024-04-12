import { Router } from 'express';
import { container } from 'tsyringe';
import { PurchaseController } from 'app/controllers/v1/purchase.controller'
import validate from 'app/middelwares/validate';
import { buySchema } from 'app/validations/purchase.validation';
import authenticate from 'app/middelwares/authenticate';
import authorize from 'app/middelwares/authorize';
import { UserRole } from 'utils/type';

const router = Router();
const purchaseCtrl = container.resolve(PurchaseController);

router.post('/buy', authenticate, authorize([UserRole.BUYER]), validate(buySchema), purchaseCtrl.buy);

export default router;