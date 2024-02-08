import { Router } from 'express';
import productCtrl from 'app/controllers/v1/product.controller'
import validate from 'app/middelwares/validate';
import { createSchema, getSchema, updateSchema, deleteSchema } from 'app/validations/product.validation';
import authenticate from 'app/middelwares/authenticate';
import authorize from 'app/middelwares/authorize';
import { UserRole } from 'src/utils/type';

const router = Router();

router.post('/products/create', authenticate, authorize([UserRole.SELLER]), validate(createSchema), productCtrl.createProduct);
router.get('/products/get', validate(getSchema), productCtrl.getProduct);
router.put('/products/update', authenticate, authorize([UserRole.SELLER]), validate(updateSchema), productCtrl.updateProduct);
router.delete('/products/delete', authenticate, authorize([UserRole.SELLER]), validate(deleteSchema), productCtrl.deleteProduct);

export default router;