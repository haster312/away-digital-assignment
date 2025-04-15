import { Controller } from '@nestjs/common';
import { ResponseUtil } from './common/utils/response.util';
import { join } from 'path';

@Controller()
export class BaseController {
    protected responseUtil: ResponseUtil;
    constructor() {
        this.responseUtil = new ResponseUtil();
    }

    successResponse<T>(res, data: T, message: string = '', statusCode: number = 200) {
        return this.responseUtil.success(res, data, message, statusCode);
    }

    errorResponse(res, error: any, statusCode: number = 500) {
        return this.responseUtil.error(res, error, statusCode);
    }

    renderHtml(res, name: string) {
        return res.sendFile(this.getViewPath(name));
    }

    getViewPath(name: string) {
        return join(process.cwd(), 'views', `${name}.html`);
    }
}
