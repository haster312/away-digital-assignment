import { Module, Global } from "@nestjs/common";
import { ChartService } from "./services/chart.service";
import { S3Service } from "./services/s3.service";

@Global()
@Module({
    providers: [S3Service, ChartService],
    exports: [S3Service, ChartService],
})
export class CommonModule {}