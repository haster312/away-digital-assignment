import { GraphType } from '../types/graph.type';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class GetGraphDto {
    @IsUrl()
    @IsNotEmpty()
    url: string;

    type?: GraphType;
}

