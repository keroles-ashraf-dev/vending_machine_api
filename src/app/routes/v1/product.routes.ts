import { Router } from 'express';
import { container } from 'tsyringe';
import {ProductController} from 'app/controllers/v1/product.controller'
import validate from 'app/middlewares/validate';
import { createSchema, getSchema, updateSchema, deleteSchema } from 'app/validations/product.validation';
import authenticate from 'app/middlewares/authenticate';
import authorize from 'app/middlewares/authorize';
import { UserRole } from 'utils/type';

const router = Router();
const productCtrl = container.resolve(ProductController);

router.post('/products/create', authenticate, authorize([UserRole.SELLER]), validate(createSchema), productCtrl.createProduct);
router.get('/products/:product_id', validate(getSchema, 'params'), productCtrl.getProduct);
router.put('/products/update', authenticate, authorize([UserRole.SELLER]), validate(updateSchema), productCtrl.updateProduct);
router.delete('/products/delete', authenticate, authorize([UserRole.SELLER]), validate(deleteSchema), productCtrl.deleteProduct);

export default router;