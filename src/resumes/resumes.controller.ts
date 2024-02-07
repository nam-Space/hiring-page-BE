import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Public, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  create(@Body() createResumeDto: CreateUserCvDto, @User() user: IUser) {
    return this.resumesService.create(createResumeDto, user);
  }

  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Public()
  @Post('/get-total-resumes')
  getAllTotalResume() {
    return this.resumesService.getAllTotalResume();
  }

  @Post('/by-user')
  findByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
