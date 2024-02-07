import app from 'app/app'
import { port } from './config/app.config';
import LoggerService from './services/logger';

const logger = new LoggerService('jwt');

function start(): void {
    try {
        app.listen(port, () => {
            logger.info('Server started on port ' + port);
        });
    } catch (err) {
        logger.error('Start server', err);
        process.exit(1);
    }
};

start();
