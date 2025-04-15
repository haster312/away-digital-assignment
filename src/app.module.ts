import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphModule } from './graph/graph.module';
import { BaseController } from './base.controller';
import { ConfigModule } from '@nestjs/config';
import configuration from './configs/configuration';
import { CommonModule } from '@/common/common.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),
        ConfigModule.forRoot({
            load: [configuration],
            isGlobal: true,
        }),
        GraphModule,
        CommonModule,
    ],
    controllers: [AppController, BaseController],
    providers: [AppService],
})
export class AppModule {}
