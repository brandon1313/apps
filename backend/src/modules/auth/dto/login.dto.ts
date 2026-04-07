import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class LoginDto {
  @IsEmail()
  @MaxLength(180)
  email!: string

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  password!: string
}
