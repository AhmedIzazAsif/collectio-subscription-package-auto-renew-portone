import { format } from 'date-fns';
import pino from 'pino';

const customLevels: { [key: string]: string } = {
    info: 'INFO',
    error: 'ERROR',
};

export const logger = pino(
    {
        level: 'info',
        timestamp: () => `,"time":"${format(new Date(), 'dd-MM-yyyy HH:mm:ss')}"`,
        formatters: {
            level(label: string, number: number) {
                return { level: customLevels[label] || number };
            },
        },
        redact: ['pid', 'hostname'],
    },
    pino.destination('log.log')
);
