import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  householdName?: string;

  /** Se presente, entra direto na household do convite (não cria a própria). */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  inviteToken?: string;
}
