import { Controller, Get, Query, Res } from '@nestjs/common';
import { GraphService } from '../services/graph.service';
import { GraphType } from '../types/graph.type';
import { BaseController } from '../../base.controller';
import { GetGraphDto } from '../dto/get-graph.dto';

@Controller('graph')
export class GraphController extends BaseController {
    constructor(private readonly graphService: GraphService) {
        super();
    }

    @Get('/convert')
    async convertGraphData(@Query() getGraphDto: GetGraphDto, @Res() res: Response) {
        try {
            // If type is not provided, default to WIKI
            if (!getGraphDto.type) {
                getGraphDto.type = GraphType.WIKI;
            }

            const imageUrl = await this.graphService.getGraphDataByUrl(
                getGraphDto.url,
                getGraphDto.type,
            );

            if (!imageUrl) {
                return this.errorResponse(res, 'Failed to generate graph');
            }

            return this.successResponse(res, { url: imageUrl });
        } catch (error) {
            return this.errorResponse(res, error);
        }
    }
}
