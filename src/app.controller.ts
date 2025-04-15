import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { BaseController } from './base.controller';

@Controller()
export class AppController extends BaseController {
    constructor() {
        super();
    }

    /**
     * Render html page
     * @returns
     */
    @Get()
    getIndex(@Res() res): string {
        return this.renderHtml(res, 'index');
    }
}
