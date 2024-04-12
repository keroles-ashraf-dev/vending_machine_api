import { JWT } from 'helpers/jwt';
import { container } from 'tsyringe';

container.register('BaseJWT', { useClass: JWT });