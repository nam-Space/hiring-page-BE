import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import {
  UpdateUserDto,
  UpdateUserPasswordDto,
  UpdateUserPasswordLoginDto,
  UpdateUserProfileHomepageDto,
} from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';
import { GetUserByEmailAndTokenPasswordDto } from './dto/get-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  hashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto, user: IUser) {
    const {
      name,
      avatar,
      email,
      password,
      age,
      gender,
      address,
      role,
      company,
    } = createUserDto;

    const checkUser = await this.userModel.findOne({ email: email });
    if (checkUser) {
      throw new BadRequestException(`Email ${email} đã tồn tại!`);
    }

    const roleDb = await this.roleModel.findById(createUserDto.role);

    if (roleDb.name !== 'NORMAL_USER') {
      if (!createUserDto?.company?._id || !createUserDto?.company?.name) {
        throw new BadRequestException(
          'Đối với người có chức vụ phải có company!',
        );
      }
    }

    const newUser = await this.userModel.create({
      name,
      avatar,
      email,
      password: this.hashPassword(password),
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newUser._id,
      createAt: newUser.createdAt,
    };
  }

  async getUserEmailAndTokenPassword(
    getUserByEmailAndTokenPasswordDto: GetUserByEmailAndTokenPasswordDto,
  ) {
    const { email, tokenPassword } = getUserByEmailAndTokenPasswordDto;
    const userDb = await this.userModel
      .findOne({ email, tokenPassword })
      .select('-password');
    if (!userDb) {
      throw new BadRequestException(
        'Link đã không còn hiệu lực! Xin vui lòng thử lại sau.',
      );
    }
    return userDb;
  }

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password, age, gender, address } = registerUserDto;
    const checkUser = await this.userModel.findOne({ email: email });
    if (checkUser) {
      throw new BadRequestException(`Email ${email} đã tồn tại!`);
    }

    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const newUser = await this.userModel.create({
      name,
      email,
      password: this.hashPassword(password),
      age,
      gender,
      address,
      role: userRole?._id,
    });
    return newUser;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * +limit;
    const defaultLimit = limit ? limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'User not found';
    }

    return await this.userModel
      .findOne({ _id: id })
      .select('-password')
      .populate({
        path: 'role',
        select: {
          _id: 1,
          name: 1,
        },
      });
  }

  async findOneByUsername(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({
        path: 'role',
        select: {
          name: 1,
        },
      });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(updateUserDto._id)) {
      throw new BadRequestException('User not found');
    }

    const roleDb = await this.roleModel.findById(updateUserDto.role);

    if (roleDb.name !== 'NORMAL_USER') {
      if (!updateUserDto?.company?._id || !updateUserDto?.company?.name) {
        throw new BadRequestException(
          'Đối với người có chức vụ phải có company!',
        );
      }
    }

    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async updateUserProfileHomepage(
    updateUserProfileHomepageDto: UpdateUserProfileHomepageDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(updateUserProfileHomepageDto._id)) {
      throw new BadRequestException('User not found');
    }
    return await this.userModel.updateOne(
      { _id: updateUserProfileHomepageDto._id },
      {
        ...updateUserProfileHomepageDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async updateUserPassword(
    updateUserPasswordDto: UpdateUserPasswordDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(updateUserPasswordDto._id)) {
      throw new BadRequestException('User not found');
    }
    const { _id, password, new_password, renew_password } =
      updateUserPasswordDto;

    const userDb = await this.userModel.findById(_id);

    if (!this.isValidPassword(password, userDb.password)) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    if (password === new_password) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng mật khẩu cũ',
      );
    }
    if (new_password !== renew_password) {
      throw new BadRequestException(
        'Mật khẩu nhập lại phải giống mật khẩu mới',
      );
    }

    return await this.userModel.updateOne(
      { _id },
      {
        password: this.hashPassword(new_password),
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        $unset: { tokenPassword: 1 },
      },
    );
  }

  async updateUserPasswordForLogin(
    updateUserPasswordLoginDto: UpdateUserPasswordDto,
  ) {
    const { _id, new_password, renew_password } = updateUserPasswordLoginDto;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('User not found');
    }

    const userDb = await this.userModel.findById(_id);

    if (this.isValidPassword(new_password, userDb.password)) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng mật khẩu cũ',
      );
    }

    if (new_password !== renew_password) {
      throw new BadRequestException(
        'Mật khẩu nhập lại phải giống mật khẩu mới',
      );
    }

    return await this.userModel.updateOne(
      { _id },
      {
        password: this.hashPassword(new_password),
        updatedBy: {
          _id: userDb._id,
          email: userDb.email,
        },
        $unset: { tokenPassword: 1 },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('User not found');
    }
    const foundUser = await this.userModel.findById(id);
    if (foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException(
        `Không thể xóa tài khoản ${foundUser.email}`,
      );
    }
    await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.userModel.softDelete({ _id: id });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      {
        _id,
      },
      {
        refreshToken,
      },
    );
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel
      .findOne({
        refreshToken,
      })
      .populate({
        path: 'role',
        select: { name: 1 },
      });
  };
}
