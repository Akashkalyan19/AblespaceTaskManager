import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '../../common/enums';

export class QueryTasksDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
