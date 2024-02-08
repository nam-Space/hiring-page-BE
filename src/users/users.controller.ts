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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserPasswordLoginDto,
  UpdateUserProfileHomepageDto,
} from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { ApiTags } from '@nestjs/swagger';
import { GetUserByEmailAndTokenPasswordDto } from './dto/get-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Create user with')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Public()
  @Post('/get-user-by-email-and-token-password')
  @ResponseMessage('Create user with')
  getUserEmailAndTokenPassword(
    @Body()
    getUserByEmailAndTokenPasswordDto: GetUserByEmailAndTokenPasswordDto,
  ) {
    return this.usersService.getUserEmailAndTokenPassword(
      getUserByEmailAndTokenPasswordDto,
    );
  }

  @Public()
  @Get()
  @ResponseMessage('Get user with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Get user by id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @ResponseMessage('Update user')
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Patch('/update-profile-homepage')
  @ResponseMessage('Update user profile for homepage')
  updateUserProfileHomepage(
    @Body() updateUserProfileHomepageDto: UpdateUserProfileHomepageDto,
    @User() user: IUser,
  ) {
    return this.usersService.updateUserProfileHomepage(
      updateUserProfileHomepageDto,
      user,
    );
  }

  @Patch('/change-password')
  @ResponseMessage('Update user password')
  updateUserPassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @User() user: IUser,
  ) {
    return this.usersService.updateUserPassword(updateUserPasswordDto, user);
  }

  @Public()
  @Patch('/change-password-for-login')
  @ResponseMessage('Update user password')
  updateUserPasswordForLogin(
    @Body() updateUserPasswordLoginDto: UpdateUserPasswordDto,
  ) {
    return this.usersService.updateUserPasswordForLogin(
      updateUserPasswordLoginDto,
    );
  }

  @Delete(':id')
  @ResponseMessage('Delete user')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
