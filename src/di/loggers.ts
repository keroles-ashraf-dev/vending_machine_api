import { container } from 'tsyringe';
import { Logger } from 'helpers/logger';

container.register('GeneralLogger', { useValue: new Logger('general') });
container.register('JWTLogger', { useValue: new Logger('jwt') });
container.register('AuthLogger', { useValue: new Logger('auth.controller') });
container.register('coinLogger', { useValue: new Logger('coin.controller') });
container.register('DepositionLogger', { useValue: new Logger('deposition.controller') });
container.register('ProductLogger', { useValue: new Logger('product.controller') });
container.register('PurchaseLogger', { useValue: new Logger('purchase.controller') });
container.register('UserLogger', { useValue: new Logger('user.controller') });