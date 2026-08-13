import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  /** "One word, like a nickname or first name" per the design. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^\S+$/, { message: 'username must be a single word' })
  username?: string;
}
