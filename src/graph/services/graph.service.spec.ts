import { Test, TestingModule } from '@nestjs/testing';
import { GraphService } from './graph.service';
import { ChartService } from '../../common/services/chart.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GraphType } from '../types/graph.type';
// Mock dependencies
const mockDependency = {
    generateChartIntoImage: jest.fn().mockReturnValue(Promise.resolve('http://localhost:3000/graph.png')),
};

describe('GraphService', () => {
    let service: GraphService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GraphService, { provide: ChartService, useValue: mockDependency }],
        }).compile();

        service = module.get<GraphService>(GraphService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should throw BadRequestException for invalid URL', async () => {
        await expect(service.getGraphDataByUrl('invalid-url', GraphType.WIKI)).rejects.toThrow(
            BadRequestException,
        );
    });

    it('should throw NotFoundException if no table is found', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            text: jest.fn().mockResolvedValue('<html></html>'),
        } as any);

        await expect(service.getWikiGraphData('http://valid.url', GraphType.WIKI)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should throw NotFoundException if no rows are found', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            text: jest.fn().mockResolvedValue('<table id="valid"><tr></tr></table>'),
        } as any);

        await expect(service.getWikiGraphData('http://valid.url', GraphType.WIKI)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should throw NotFoundException if only header row is present', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            text: jest.fn().mockResolvedValue('<table id="valid"><tr><th>Header</th></tr></table>'),
        } as any);

        await expect(service.getWikiGraphData('http://valid.url', GraphType.WIKI)).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should throw Error if no numeric column is found', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            text: jest
                .fn()
                .mockResolvedValue(
                    '<table id="valid"><tr><th>Header</th></tr><tr><td>Non-numeric</td></tr></table>',
                ),
        } as any);

        await expect(service.getWikiGraphData('http://valid.url', GraphType.WIKI)).rejects.toThrow(
            Error,
        );
    });

    it('should return http://localhost:3000/graph.png for valid data from Wikipedia', async () => {        
        jest.spyOn(global, 'fetch').mockResolvedValue({
            text: jest.fn().mockResolvedValue(`
                <table class="wikitable sortable">
                    <tr><th>Name</th><th>Height</th></tr>
                    <tr><td>John</td><td>2.05</td></tr>
                    <tr><td>Jane</td><td>2.10</td></tr>
                </table>
            `),
        } as any);

        const url = 'https://en.wikipedia.org/wiki/Women%27s_high_jump_world_record_progression';
        const result = await service.getWikiGraphData(url, GraphType.WIKI);
        expect(result).toBe('http://localhost:3000/graph.png');
        expect(service['chartService'].generateChartIntoImage).toHaveBeenCalledWith(
            [2.05, 2.10],
            'Height'
        );
    });
});
