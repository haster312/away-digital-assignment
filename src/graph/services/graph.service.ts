import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GraphType, URL_PATTERN, GRAPH_TABLE_IDENTIFIER } from '../types/graph.type';
import * as cheerio from 'cheerio';
import { ChartService } from '@/common/services/chart.service';

@Injectable()
export class GraphService {
    constructor(private chartService: ChartService) {}

    async getGraphDataByUrl(url: string, type: GraphType): Promise<string | null> {
        if (!this.validateUrlByType(url, type)) {
            throw new BadRequestException(`Invalid URL: ${type}`);
        }

        switch (type) {
            case GraphType.WIKI:
                return this.getWikiGraphData(url, type);
            default:
                // TODO: Implement other graph types in future
                break;
        }

        return null;
    }

    /**
     * Get Wiki table data and convert to graph data
     * @param url
     */
    async getWikiGraphData(url: string, type: GraphType): Promise<string> {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        const table = $(GRAPH_TABLE_IDENTIFIER[type]).first();
        if (!table.length) throw new NotFoundException('No table found');

        const rows: string[][] = [];

        // get all column data from found table
        table.find('tr').each((_, row) => {
            const cells = $(row)
                .find('th, td')
                .map((_, cell) => $(cell).text().trim())
                .get();

            if (cells.length) rows.push(cells);
        });

        // In case have table but no row
        if (rows.length === 0) throw new NotFoundException('No rows found');

        // In case only header row
        if (rows.length < 2) throw new NotFoundException('No data to convert');

        const headerRow = rows[0]; // Get header row for data title
        const rowData = rows.slice(1); // Get first row data to check for numeric column

        const columnIndexWithNumericData = headerRow.findIndex((_, colIndex) =>
            rowData.some((row) => !isNaN(parseFloat(row[colIndex]?.replace(/[^\d.]/g, '')))),
        );

        // No valid numeric column found
        if (columnIndexWithNumericData === -1) throw new Error('No numeric column found');

        // Get all numeric data from found column and remove invalid data
        const numericData = rowData
            .map((row) => parseFloat(row[columnIndexWithNumericData]?.replace(/[^\d.]/g, '')))
            .filter((val) => !isNaN(val));

        const label = headerRow[columnIndexWithNumericData];

        return this.chartService.generateChartIntoImage(numericData, label);
    }

    /**
     * Validate URL by type to get correct graph data
     * @param url
     * @param type
     * @return boolean
     */
    validateUrlByType(url: string, type: GraphType): boolean {
        return URL_PATTERN[type].test(url);
    }
}
