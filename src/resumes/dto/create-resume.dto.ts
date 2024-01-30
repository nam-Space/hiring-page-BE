import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsEmail(
    {},
    {
      message: 'email không đúng định dạng',
    },
  )
  @IsNotEmpty({
    message: 'email không được để trống',
  })
  email: string;

  @IsNotEmpty({
    message: 'userId không được để trống',
  })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'url không được để trống',
  })
  url: string;

  @IsNotEmpty({
    message: 'status không được để trống',
  })
  status: string;

  @IsNotEmpty({
    message: 'companyId không được để trống',
  })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'jobId không được để trống',
  })
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCvDto {
  @IsNotEmpty({
    message: 'url không được để trống',
  })
  url: string;

  @IsNotEmpty({
    message: 'companyId không được để trống',
  })
  @IsMongoId({ message: 'companyId phải là mongo id' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'jobId không được để trống',
  })
  @IsMongoId({ message: 'jobId phải là mongo id' })
  jobId: mongoose.Schema.Types.ObjectId;
}
