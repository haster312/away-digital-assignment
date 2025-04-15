import { Injectable } from '@nestjs/common';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChartService {
    private chart: ChartJSNodeCanvas;
    private width = 800;
    private height = 600;
    private isS3Enabled: boolean;
    private UPLOAD_FOLDER = 'uploads';

    constructor(private configService: ConfigService, private s3Service: S3Service) {
        this.isS3Enabled = this.configService.get('AWS.S3_ENABLED') ?? false;        
    }

    /**
     * Initialize chart if not exists
     * @param width 
     * @param height 
     * @returns 
     */
    initChart(width: number = this.width, height: number = this.height) {
        if (!this.chart) {
            this.chart = new ChartJSNodeCanvas({
                width,
                height,
            });
        }

        return this.chart;
    }

    /**
     * Render chart from data and save into image file
     * @param data 
     * @param label 
     * @returns 
     */
    async generateChartIntoImage(data: number[], label = 'Chart'): Promise<string> {
        this.initChart();
        const cleanData = data.filter((val) => typeof val === 'number' && val < 1000);

        const config: ChartConfiguration = {
            type: 'line',
            data: {
                labels: cleanData.map((_, i) => `#${i + 1}`),
                datasets: [
                    {
                        label: label,
                        data: cleanData,
                        borderColor: 'rgb(98, 150, 150)',
                        tension: 0.1,
                    },
                ],
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: label,
                    },
                },
            },
        };

        const buffer = await this.chart.renderToBuffer(config); 
        // If s3 is enabled, upload file to s3 (must have config)  
        if (this.isS3Enabled) {
            return await this.s3Service.uploadFile(buffer);
        } else {
            // Save file to local
            return await this.saveToLocal(buffer, label);
        }
    }

    /**
     * Save chart into local file
     * @param buffer 
     * @param label 
     * @param folder 
     * @returns 
     */
    async saveToLocal(buffer: Buffer, label: string, folder?: string): Promise<string> {
        const uploadFolder = this.UPLOAD_FOLDER + "/" + (folder || '');
        if (!fs.existsSync(this.UPLOAD_FOLDER)) { 
            fs.mkdirSync(this.UPLOAD_FOLDER, { recursive: true });
        }
        
        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder, { recursive: true });
        }

        const date = new Date().toISOString().split('T')[0];
        const filename = `${label}-${date}.png`;

        const filePath = path.join(uploadFolder, filename);
        fs.writeFileSync(filePath, buffer);
        
        // Return file url with current server url
        return `${this.configService.get('SERVER_URL')}/${filePath}`;
    }
}
