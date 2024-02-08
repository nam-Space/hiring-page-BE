import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @IsNotEmpty({ message: 'Id không được để trống' })
  _id: string;
}

export class UpdateUserProfileHomepageDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  _id: string;

  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Avatar không được để trống' })
  avatar: string;

  @IsNotEmpty({
    message: 'Age không được để trống',
  })
  age: number;

  @IsNotEmpty({
    message: 'Gender không được để trống',
  })
  gender: string;

  @IsNotEmpty({
    message: 'Address không được để trống',
  })
  address: string;
}

export class UpdateUserPasswordDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  _id: string;

  @IsOptional()
  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  password: string;

  @IsNotEmpty({
    message: 'Mật khẩu mới không được để trống',
  })
  new_password: string;

  @IsNotEmpty({
    message: 'Mật khẩu nhập lại không được để trống',
  })
  renew_password: string;
}

export class UpdateUserPasswordLoginDto {
  @IsNotEmpty({ message: 'Id không được để trống' })
  _id: string;

  @IsNotEmpty({
    message: 'Mật khẩu mới không được để trống',
  })
  new_password: string;

  @IsNotEmpty({
    message: 'Mật khẩu nhập lại không được để trống',
  })
  renew_password: string;
}
