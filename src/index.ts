import app from './app/app'
import { port } from 'config/app.config';
import LoggerService from 'services/logger';
import connection from 'db/connection';

const logger = new LoggerService('index');

function start(): void {
    try {
        app.listen(port, async () => { 
            await connection.sync();
            
            logger.info('Server started on port ' + port);
        });
    } catch (err) { 
        logger.error('Start server', err); 
        process.exit(1);
    }
};

start();
