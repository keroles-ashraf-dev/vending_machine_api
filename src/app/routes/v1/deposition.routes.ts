import { Router } from 'express';
import depositionCtrl from 'app/controllers/v1/deposition.controller'
import authenticate from 'app/middelwares/authenticate';
import authorize from 'app/middelwares/authorize';
import { UserRole } from 'src/utils/type';

const router = Router();

router.post('/deposit', authenticate, authorize([UserRole.BUYER]), depositionCtrl.deposit);
router.get('/reset', authenticate, authorize([UserRole.BUYER]), depositionCtrl.reset);

export default router;