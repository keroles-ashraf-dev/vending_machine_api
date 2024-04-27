import { container } from 'tsyringe';
import postgres from 'db/postgres';
import redis from 'db/redis';

container.register('Postgres', { useValue: postgres });
container.register('Redis', { useValue: redis });