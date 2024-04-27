import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { RedisClientType } from 'redis';
import moment from 'moment';
import { ApiError } from 'helpers/error';
import { ErrorType, HttpStatusCode } from 'utils/type';
import { window_size_in_hours, max_window_request_count, window_log_interval_in_hours } from 'config/app.config';

const redis: RedisClientType = container.resolve('Redis');

async function rateLimiting(req: Request, res: Response, next: NextFunction) {
    if (!redis.isReady) {
        throw new ApiError(ErrorType.UNKNOWN_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR, 'Redis client does not ready!', false);
    }

    const userIp = req.ip;
    if (!userIp) {
        throw new ApiError(ErrorType.UNKNOWN_ERROR, HttpStatusCode.UNPROCESSABLE_CONTENT, 'User ip not detected!');
    }

    // fetch records of current user using IP address, returns null when no record is found
    const record = await redis.get(userIp);
    const currentRequestTime = moment();

    //  if no record is found , create a new record for user and store to redis
    if (!record) {
        const newRecord = [];
        newRecord.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1,
        });

        await redis.set(userIp, JSON.stringify(newRecord));
        return next();
    }

    // if record is found, parse it's value and calculate number of requests users has made within the last window
    const data: Record<string, any>[] = JSON.parse(record!);
    const windowStartTimestamp = moment().subtract(window_size_in_hours, 'hours').unix();

    const requestsWithinWindow = data.filter((entry) => {
        return entry.requestTimeStamp > windowStartTimestamp;
    });

    const totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
        return accumulator + entry.requestCount;
    }, 0);

    // if number of requests made is greater than or equal to the desired maximum, return error
    if (totalWindowRequestsCount >= max_window_request_count) {
        throw new ApiError(
            ErrorType.UNKNOWN_ERROR,
            HttpStatusCode.TOO_MANY_REQUESTS,
            'You have exceeded requests limit, try again later.',
        );
    }

    // if number of requests made is less than allowed maximum, log new entry
    const lastRequestLog = data[data.length - 1];
    const potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime.subtract(window_log_interval_in_hours, 'hours').unix();

    //  if interval has not passed since last request log, increment counter
    if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
        lastRequestLog.requestCount++;
        data[data.length - 1] = lastRequestLog;
    } else {
        //  if interval has passed, log new entry for current user and timestamp
        data.push({
            requestTimeStamp: currentRequestTime.unix(),
            requestCount: 1,
        });
    }

    await redis.set(userIp, JSON.stringify(data));

    next();
}

export default rateLimiting;