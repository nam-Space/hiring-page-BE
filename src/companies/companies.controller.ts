import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @User() user: IUser,
  ) {
    return await this.companiesService.create(createCompanyDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage('Get company with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.companiesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: mongoose.Schema.Types.ObjectId,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    return await this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.remove(id, user);
  }
}
