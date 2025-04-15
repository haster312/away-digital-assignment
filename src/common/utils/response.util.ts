import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { SuccessResponseDto } from '@/common/dto/success-response.dto';
import { HttpStatus } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

export class ResponseUtil {
    success<T>(
        res: Response,
        data: T,
        message: string | string[] = '',
        statusCode: number = HttpStatus.OK,
    ): Response {
        const payload: SuccessResponseDto<T> = {
            success: true,
            message,
            data,
        };

        return res.status(statusCode).json(payload);
    }

    error(res: Response, error: string | string[] | Error, statusCode: number = 500): Response {
        if (error instanceof NotFoundException) {
            return this.notFound(res, error.message);
        } else if (error instanceof BadRequestException) {
            return this.badRequest(res, error.message);
        } else {
            let message: string;
            if (typeof error === 'object' && error !== null && 'message' in error) {
                message = error.message;
            } else {
                message = 'An unknown error occurred';
            }

            const payload: ErrorResponseDto = {
                error: true,
                message: message,
            };

            return res.status(statusCode).json(payload);
        }
    }

    badRequest(res: Response, error: string | string[]): Response {
        const payload: ErrorResponseDto = {
            error: true,
            message: error,
        };

        return res.status(HttpStatus.BAD_REQUEST).json(payload);
    }

    notFound(res: Response, error: string | string[]): Response {
        const payload: ErrorResponseDto = {
            error: true,
            message: error,
        };

        return res.status(HttpStatus.NOT_FOUND).json(payload);
    }
}
