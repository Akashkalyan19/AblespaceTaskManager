import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/**
 * All fields optional. Nullable fields (dueDate, startDate, assigneeId,
 * projectId) may also be sent as null to clear them — @IsOptional() skips
 * validation for both undefined and null.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
