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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage('Create a new job')
  create(@Body() createJobDto: CreateJobDto, @User() user) {
    return this.jobsService.create(createJobDto, user);
  }

  @Public()
  @Post('/get-all')
  @ResponseMessage('Get all job with pagination for homepage')
  findAllJob(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.jobsService.findAllJob(+currentPage, +limit, qs);
  }

  @Public()
  @Post('/get-jobs-with-user-apply')
  getJobWithUserApply(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.jobsService.getJobWithUserApply(+currentPage, +limit, qs);
  }

  @Public()
  @Post('/get-total-jobs')
  getAllTotalResume() {
    return this.jobsService.getAllTotalJob();
  }

  @Get()
  @ResponseMessage('Get job with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs, user);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Get job by id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update job')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user,
  ) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete job')
  remove(@Param('id') id: string, @User() user) {
    return this.jobsService.remove(id, user);
  }
}
