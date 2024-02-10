import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({
    message: 'Name không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'Address không được để trống',
  })
  address: string;

  @IsNotEmpty({
    message: 'Location không được để trống',
  })
  location: string;

  @IsNotEmpty({
    message: 'Description không được để trống',
  })
  description: string;

  @IsNotEmpty({
    message: 'logo không được để trống',
  })
  logo: string;
}
