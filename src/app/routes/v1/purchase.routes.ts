import { Router } from 'express';
import { container } from 'tsyringe';
import { PurchaseController } from 'app/controllers/v1/purchase.controller'
import validate from 'app/middlewares/validate';
import { buySchema } from 'app/validations/purchase.validation';
import authenticate from 'app/middlewares/authenticate';
import authorize from 'app/middlewares/authorize';
import { UserRole } from 'utils/type';

const router = Router();
const purchaseCtrl = container.resolve(PurchaseController);

router.post('/buy', authenticate, authorize([UserRole.BUYER]), validate(buySchema), purchaseCtrl.buy);

export default router;