import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({
    message: 'name không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'description không được để trống',
  })
  description: string;

  @IsNotEmpty({
    message: 'isActive không được để trống',
  })
  @IsBoolean({
    message: 'isActive phải có giá trị là boolean',
  })
  isActive: boolean;

  @IsNotEmpty({
    message: 'permissions không được để trống',
  })
  @IsMongoId({
    each: true,
    message: 'each permission phải là mongo id',
  })
  @IsArray({ message: 'permissions có định dạng là array' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
