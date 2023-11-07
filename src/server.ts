import 'dotenv/config';
import { checkAuthentication } from '../utils/auth';
import { logger } from '../utils/logger';
import { startProcess } from './process';

export const EXTERNAL_API_BASE = process.env.EXTERNAL_API_BASE;
export const EXTERNAL_API_VERSION = process.env.EXTERNAL_API_VERSION;

let intervalTime = 1;

const start = async () => {
    logger.info(`Server TS: Process Starting at: ${Date()}`);
    const authenticated = await checkAuthentication();
    if (authenticated) {
        startProcess()
            .then(() => {
                logger.info(`Server TS: Process completed successfully at: ${Date()}`);
                intervalTime = 24 * 60 * 60 * 1000;
                setTimeout(start, intervalTime);
            })
            .catch((error) => {
                logger.error(error, 'Server TS: Process failed');
                setTimeout(start, intervalTime);
            });
    } else {
        logger.error('Server TS: Authentication failed, provide proper credentials in env file');
        setTimeout(start, intervalTime);
    }
};

// Initial call to start the process
start();
