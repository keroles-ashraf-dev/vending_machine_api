import winston, { loggers } from "winston";
import { log_file_path, env } from '../config/app.config';
import { envDev } from '../util/constant';

// logging format => date + logger level + message + {obj}

const dateTimeFormat = () => {
    return new Date(Date.now()).toLocaleString;
}

const dateFormat = () => {
    return new Date(Date.now()).toLocaleDateString;
}

class LoggerService {
    logger: winston.Logger;

    constructor(route: string = 'general') {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.printf(info => {
                let msg = dateFormat + ' | ' + info.level.toUpperCase + ' | ' + info.message;
                msg = info.obj ? msg + ' | ' + JSON.stringify(info.obj) : msg;
                return msg;
            }),
            transports: [
                new winston.transports.File({ filename: log_file_path + '/' + dateFormat + '/' + route + '.log' }),
            ],
        });

        if (env !== envDev) {
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }
    }

    async info(msg: string, obj: object = null) {
        if (obj == null) {
            this.logger.log('info', msg);
        }
        else {
            this.logger.log('info', msg, obj);
        }
    }

    async debug(msg: string, obj: object = null) {
        if (obj == null) {
            this.logger.log('debug', msg);
        }
        else {
            this.logger.log('debug', msg, obj);
        }
    }

    async error(msg: string, obj: object = null) {
        if (obj == null) {
            this.logger.log('error', msg);
        }
        else {
            this.logger.log('error', msg, obj);
        }
    }
}

export default LoggerService;