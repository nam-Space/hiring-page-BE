import { IsEmail, IsNotEmpty } from 'class-validator';

export class GetUserByEmailAndTokenPasswordDto {
  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng',
    },
  )
  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  email: string;

  @IsNotEmpty({
    message: 'tokenPassword không được để trống',
  })
  tokenPassword: string;
}
