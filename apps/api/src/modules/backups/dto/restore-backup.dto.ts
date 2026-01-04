import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RestoreBackupDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'targetDbName must be alphanumeric with dashes or underscores',
  })
  targetDbName: string;
}
