import axios from 'axios';
import { startProcess } from '../src/process';
import { EXTERNAL_API_BASE, EXTERNAL_API_VERSION } from '../src/server';
import { logger } from './logger';
import { isTokenExpired } from './verifyToken';

// auth.js
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
    authToken = token;
};

export const getAuthToken = () => {
    return authToken;
};

export const checkAuthentication = async (fromProcess: boolean = false): Promise<boolean | any> => {
    let authenticated = false;
    if (getAuthToken() && !fromProcess) {
        const tokenExpired: boolean = await isTokenExpired(getAuthToken() || '');
        if (tokenExpired) {
            authenticated = await authentication();
        } else {
            authenticated = true;
        }
    } else {
        authenticated = await authentication();
    }

    if (fromProcess && authenticated) {
        setTimeout(() => {
            startProcess()
                .then((message) => console.log(message))
                .catch((error) => console.log(error));
        }, 1000);
    } else {
        return authenticated;
    }
};

export const authentication = async () => {
    let authenticated = false;
    try {
        const authPayload = {
            email: process.env.AUTH_EMAIL,
            password: process.env.AUTH_PASSWORD,
        };
        const authResponse = await axios.post(`${EXTERNAL_API_BASE}/${EXTERNAL_API_VERSION}/users/auth/password-login`, authPayload);

        const jwtToken = authResponse?.data?.output?.jwtToken;
        setAuthToken(jwtToken);
        axios.defaults.headers['x-access-token'] = jwtToken;
        authenticated = true;
    } catch (error) {
        logger.error(error, 'Auth TS: Error occured during authentication');
    }

    return authenticated;
};
