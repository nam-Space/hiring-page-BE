import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import {
  CreateUserDto,
  RegisterUserDto,
  UserLoginDto,
} from 'src/users/dto/create-user.dto';
import { Request as RequestExpress, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 60)
  @ApiBody({ type: UserLoginDto })
  @Post('/login')
  @ResponseMessage('User login')
  async handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @Post('/register')
  async handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Get('/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('/account')
  @ResponseMessage('Get user information')
  async handleGetAccount(@User() user: IUser) {
    const temp = (await this.rolesService.findOne(user.role._id)) as any;
    user.permissions = temp.permissions;
    return { user };
  }

  @Public()
  @Get('/refresh')
  @ResponseMessage('Get user by refresh token')
  handleRefreshToken(
    @Req() request: RequestExpress,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @Post('/logout')
  @ResponseMessage('Logout user')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }
}
