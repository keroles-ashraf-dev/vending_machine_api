import "reflect-metadata";
import { container } from "tsyringe";
import redis from 'redis';
import { redis_host, redis_port, redis_username, redis_password } from '../config/db.config';
import { Logger } from "helpers/logger";

const logger: Logger = container.resolve('RedisLogger');

const createClient = async () => {
    return await redis.createClient({ url: `redis://${redis_username}:${redis_password}@${redis_host}:${redis_port}` })
        .on('error', err => logger.error('redis server error', err))
        .on('connect', () => logger.info('redis server connecting'))
        .on('ready', () => logger.info('redis server ready'))
        .on('end', () => logger.info('redis server end'))
        .connect();
}

const client = await createClient();

export default client;