import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({
    message: 'email không được để trống',
  })
  @IsEmail({
    message: 'email không đúng định dạng',
  })
  email: string;

  @IsNotEmpty({
    message: 'skills không được để trống',
  })
  @IsArray({ message: 'skills có định dạng là array' })
  @IsString({ each: true, message: 'skills có định dạng là string' })
  skills: string[];
}
