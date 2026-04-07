import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MaxLength(180)
  fullName!: string

  @IsString()
  @MaxLength(32)
  dpi!: string

  @IsEmail()
  @MaxLength(180)
  email!: string

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'password must contain upper, lower, and number characters',
  })
  password!: string

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phoneNumber?: string
}
