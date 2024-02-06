import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,

    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async create(createResumeDto: CreateUserCvDto, user: IUser) {
    const newResume = await this.resumeModel.create({
      ...createResumeDto,
      email: user.email,
      userId: user._id,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      ],
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      _id: newResume.id,
      createdAt: newResume.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    const currentUser = await this.userModel.findById(user._id);

    const offset = (currentPage - 1) * +limit;
    const defaultLimit = limit ? limit : 10;
    let totalItems = (
      await this.resumeModel.find({
        ...filter,
      })
    ).length;
    if (user.role.name === 'HR') {
      totalItems = (
        await this.resumeModel.find({
          ...filter,
          companyId: currentUser.company._id,
        })
      ).length;
    }
    const totalPages = Math.ceil(totalItems / defaultLimit);

    let result = await this.resumeModel
      .find({
        ...filter,
      })
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection)
      .exec();

    if (user.role.name === 'HR') {
      result = await this.resumeModel
        .find({
          ...filter,
          companyId: currentUser.company._id,
        })
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate(population)
        .select(projection)
        .exec();
    }

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
      throw new BadRequestException('Id is invalid!');
    }
    return await this.resumeModel.findOne({ _id: id });
  }

  async getAllTotalResume() {
    return await this.resumeModel.find({});
  }

  async findByUsers(user: IUser) {
    return await this.resumeModel
      .find({
        userId: user._id,
      })
      .sort('-createdAt')
      .populate([
        {
          path: 'companyId',
          select: { name: 1 },
        },
        {
          path: 'jobId',
          select: { name: 1 },
        },
      ]);
  }

  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id is invalid!');
    }
    const currentUser = await this.userModel.findById(user._id);
    const resume = await this.resumeModel.findById(id);
    if (user.role.name === 'HR') {
      if (resume.companyId.toString() === currentUser.company._id.toString()) {
        return await this.resumeModel.updateOne(
          {
            _id: id,
          },
          {
            status,
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
            $push: {
              history: {
                status,
                updatedAt: new Date(),
                updatedBy: {
                  _id: user._id,
                  email: user.email,
                },
              },
            },
          },
        );
      } else {
        throw new BadRequestException(
          'HR không để cập nhật CV cho công ty khác!',
        );
      }
    }
    return await this.resumeModel.updateOne(
      {
        _id: id,
      },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        $push: {
          history: {
            status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id is invalid!');
    }
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.resumeModel.softDelete({ _id: id });
  }
}
