import { Module } from '@nestjs/common';
import { GraphController } from './controllers/graph.controller';
import { GraphService } from './services/graph.service';
import { ChartService } from '@/common/services/chart.service'; 

@Module({
    controllers: [GraphController],
    providers: [GraphService, ChartService],
})
export class GraphModule {}
