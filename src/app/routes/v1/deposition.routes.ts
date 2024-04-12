import { Router } from 'express';
import { container } from 'tsyringe';
import {DepositionController} from 'app/controllers/v1/deposition.controller'
import authenticate from 'app/middelwares/authenticate';
import authorize from 'app/middelwares/authorize';
import { UserRole } from 'utils/type';

const router = Router();
const depositionCtrl = container.resolve(DepositionController);

router.post('/deposit', authenticate, authorize([UserRole.BUYER]), depositionCtrl.deposit);
router.get('/reset', authenticate, authorize([UserRole.BUYER]), depositionCtrl.reset);

export default router;