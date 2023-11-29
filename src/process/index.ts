import axios from 'axios';
import { checkAuthentication } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { EXTERNAL_API_BASE, EXTERNAL_API_VERSION } from '../server';

export const startProcess = async () => {
    logger.info(`Process/Index TS: Fetching renew list at - ${Date()}`);
    let multiDeviceDetected = false;
    let page = 1;
    const days = 6;
    const limit = 30;
    let gotEmptyArray = false;
    while (!gotEmptyArray && !multiDeviceDetected) {
        try {
            const response = await axios.get(
                `${EXTERNAL_API_BASE}/${EXTERNAL_API_VERSION}/cms/subscription/auto-renew/portone?limit=${limit}&days=${days}&page=${page}`
            );

            const data = response.data?.output?.data;
            if (!data || data?.length <= 0) {
                logger.info(`Process/Index TS: Got empty array from renew list api for page ${page}.`);
                gotEmptyArray = true;
                break;
            }

            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                const subscription = {
                    userId: item?.userId,
                    subscriptionRequestId: item?.subscriptionRequestId,
                    subscriptionPackageId: item?.subscriptionPackageId,
                };

                const url = `${EXTERNAL_API_BASE}/${EXTERNAL_API_VERSION}/cms/subscription/auto-renew/portone/single`;
                try {
                    const postResponse = await axios.post(url, subscription);
                    logger.info(subscription, `Process/Index TS: Processing payment for - ${subscription.subscriptionRequestId}`);
                    logger.info(postResponse?.data, `Process/Index TS: Got Payment response for - ${subscription.subscriptionRequestId}`);
                } catch (err) {
                    logger.error(err, `Process/Index TS: Got error during payment for - ${subscription.subscriptionRequestId}`);
                }
            }
            page++;
        } catch (error: any) {
            if (error?.response?.data?.errorCode === 'MULTI_DEVICE_LOGIN_DETECTED') {
                multiDeviceDetected = true;
                break;
            } else {
                console.error(error);
                gotEmptyArray = true;
                break;
            }
        }
    }

    if (multiDeviceDetected) {
        logger.info('Process/Index TS: Multi device detected! Now authenticating again for start the process');
        checkAuthentication(multiDeviceDetected)
            .then((_) => console.log('Authentication successfull'))
            .catch((_) => console.log('Authentication error during multi device detection'));
    }
};
