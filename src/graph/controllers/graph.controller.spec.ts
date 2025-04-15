import { Test, TestingModule } from '@nestjs/testing';
import { GraphController } from './graph.controller';
import { GraphService } from '../services/graph.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { GraphType } from '../types/graph.type';

const mockGraphService = {
    getGraphDataByUrl: jest.fn().mockResolvedValue('http://localhost:3000/graph.png'),
};

describe('GraphController', () => {
    let controller: GraphController;
    let mockResponse: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GraphController],
            providers: [{ provide: GraphService, useValue: mockGraphService }],
        }).compile();

        controller = module.get<GraphController>(GraphController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return a graph image', async () => {
        const result = await controller.convertGraphData(
            {
                url: 'https://en.wikipedia.org/wiki/Women%27s_high_jump_world_record_progression',
                type: GraphType.WIKI,
            },
            mockResponse as any,
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
          data: {
            url: 'http://localhost:3000/graph.png'
          },
          message: "",
          success: true
        });
    });

    it('should throw NotFoundException if no table is found', async () => {
        jest.spyOn(mockGraphService, 'getGraphDataByUrl').mockImplementation(() => {
            throw new NotFoundException('No table found');
        });

        await controller.convertGraphData(
            { url: 'invalid-url', type: GraphType.WIKI },
            mockResponse as any,
        );
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: true, message: 'No table found' });
    });

    it('should throw BadRequestException for invalid URL', async () => {
        jest.spyOn(mockGraphService, 'getGraphDataByUrl').mockImplementation(() => {
            throw new BadRequestException('Invalid URL: WIKI');
        });

        await controller.convertGraphData(
            { url: 'invalid-url', type: GraphType.WIKI },
            mockResponse as any,
        );
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: true,message: 'Invalid URL: WIKI' });
    });
});
