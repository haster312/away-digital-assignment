export class SuccessResponseDto<T> {
    success: true;
    message: string | string[];
    data: T;
}
