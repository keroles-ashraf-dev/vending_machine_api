import "reflect-metadata";
import { container } from "tsyringe";
import 'di/register';
import app from './app/app';
import { port } from 'config/app.config';
import { Logger } from "helpers/logger";
import Sequelize from "sequelize/types/sequelize";

const logger: Logger = container.resolve('GeneralLogger');
const postgres: Sequelize = container.resolve('Postgres');

function start(): void {
    try {
        app.listen(port, async (): Promise<void> => {
            await postgres.sync();

            logger.info('Server started on port ' + port);
        });
    } catch (err) {
        logger.error('Start server', err);
        process.exit(1);
    }
};

start();
