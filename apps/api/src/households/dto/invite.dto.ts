import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateInviteDto {
  @IsEmail()
  @MaxLength(160)
  email!: string;
}

export class AcceptInviteDto {
  @IsString()
  @MinLength(10)
  @MaxLength(80)
  token!: string;
}
