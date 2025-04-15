import { Injectable } from '@nestjs/common';
import {
    PutObjectCommand,
    S3Client,
    HeadObjectCommand,
    HeadObjectCommandOutput,
    NotFound,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
export interface UploadFileOptions {
    folder?: string;
    filename?: string;
    contentType?: string;
    bucket?: string;
}

export const CONTENT_TYPES = {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
};

@Injectable()
export class S3Service {
    private client: S3Client;

    constructor(private configService: ConfigService) {}

    async initS3() {
        const accessKeyId = this.configService.get<string>('AWS.ACCESS_KEY');
        const secretAccessKey = this.configService.get<string>('AWS.ACCESS_SECRET');

        if (!accessKeyId || !secretAccessKey) {
            throw new Error('AWS credentials are not set in the configuration.');
        }

        this.client = new S3Client({
            region: this.configService.get<string>('AWS.REGION')!,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    /**
     * Upload file to s3 with file buffer
     * @param fileBuffer
     * @param options
     * @returns
     */
    async uploadFile(fileBuffer: Buffer, options: UploadFileOptions = {}): Promise<string> {
        const {
            folder = '',
            filename,
            contentType = CONTENT_TYPES.PNG,
            bucket = this.configService.get('AWS.S3_BUCKET'),
        } = options;

        if (!this.client) {
            await this.initS3();
        }

        const key = folder ? `${folder.replace(/^\/+|\/+$/g, '')}/${filename}` : filename;

        const params = {
            Bucket: bucket,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        };

        await this.client.send(new PutObjectCommand(params));

        return this.getS3ProductUrl(bucket, key);
    }

    /**
     * Return reuse url for s3 product
     */
    getS3ProductUrl(bucketName, key) {
        return `https://${bucketName}.s3.${this.configService.get('AWS.REGION')}.amazonaws.com/${key}`;
    }
}
