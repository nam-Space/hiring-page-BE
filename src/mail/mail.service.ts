import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { GenerateTokenPasswordDto } from './dto/create-mail.dto';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private mailerService: MailerService,
  ) {}

  async generateTokenPassword(
    generateTokenPasswordDto: GenerateTokenPasswordDto,
  ) {
    try {
      const { email } = generateTokenPasswordDto;

      const tokenPassword = uuidv4();

      const userDb = await this.userModel.findOne({ email });

      if (!userDb) {
        throw new BadRequestException(`Email ${email} không tồn tại!`);
      }

      await this.userModel.updateOne(
        {
          email,
        },
        {
          tokenPassword,
        },
      );

      await this.mailerService.sendMail({
        to: email,
        from: '"Support Team" <support@example.com>', // override default from
        subject: 'Đặt lại mật khẩu',
        template: 'change-password',
        context: {
          url: 'http://localhost:3000',
          email: email,
          tokenPassword: tokenPassword,
        },
      });

      return {
        notification: 'Gửi email thành công!',
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
