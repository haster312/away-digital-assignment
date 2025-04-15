import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();
export default () => ({
    ENV: process.env.ENVIRONMENT || 'development',
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
    AWS: {
        ACCESS_KEY: process.env.AWS_ACCESS_KEY as string,
        ACCESS_SECRET: process.env.AWS_SECRET_KEY as string,
        REGION: process.env.AWS_REGION as string,
        S3_BUCKET: process.env.S3_BUCKET as string,
        S3_ENABLED: process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY && process.env.AWS_REGION,
    },

    PORT: parseInt(process.env.PORT as string, 10) || 3000,
});
