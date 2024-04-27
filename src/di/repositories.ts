import { CoinRepo } from 'app/repositories/v1/coin.repo';
import { ProductRepo } from 'app/repositories/v1/product.repo';
import { UserRefreshTokenRepo } from 'app/repositories/v1/user.refresh.token.repo';
import { UserRepo } from 'app/repositories/v1/user.repo';
import { container } from 'tsyringe';

container.register('BaseUserRepo', { useClass: UserRepo });
container.register('BaseUserRefreshTokenRepo', { useClass: UserRefreshTokenRepo });
container.register('BaseProductRepo', { useClass: ProductRepo });
container.register('BaseCoinRepo', { useClass: CoinRepo });