import winston from "winston";
import { log_file_path, env } from 'config/app.config';
import { envDev } from 'utils/constant';

// logging format => date + logger level + message + {data}

const dateTimeFormat = () => {
    return new Date(Date.now()).toLocaleString;
}

const dateFormat = () => {
    return new Date(Date.now()).toLocaleDateString;
}

class LoggerService {
    private logger: winston.Logger;

    constructor(route: string = 'general') {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.printf(info => {
                let msg = dateTimeFormat + ' | ' + info.level.toUpperCase + ' | ' + info.message;
                msg = info.data ? msg + ' | ' + JSON.stringify(info.data) : msg;
                return msg;
            }),
            transports: [
                new winston.transports.File({ filename: log_file_path + '/' + dateFormat + '/' + route + '.log' }),
            ],
        });

        if (env == envDev) {
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }
    }

    info = async (msg: string, data: any = null) => {
        this.logger.log('info', msg, data);
    }

    debug = async (msg: string, data: any = null) => {
        this.logger.log('debug', msg, data);
    }

    warning = async (msg: string, data: any = null) => {
        this.logger.log('warning', msg, data);
    }

    error = async (msg: string, data: any = null) => {
        this.logger.log('error', msg, data);
    }
}

export default LoggerService;