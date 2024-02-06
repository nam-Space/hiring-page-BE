import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobDocument } from './schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Resume, ResumeDocument } from 'src/resumes/schemas/resume.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  checkDate = (timeStart, timeEnd) => {
    if (timeStart >= timeEnd) {
      throw new BadRequestException('startDate phải trước endDate');
    }
  };

  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name,
      skills,
      company,
      location,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
    } = createJobDto;

    this.checkDate(new Date(startDate).getTime(), new Date(endDate).getTime());
    const newJob = await this.jobModel.create({
      name,
      skills,
      company,
      location,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newJob._id,
      createAt: newJob.createdAt,
    };
  }

  async findAllJob(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    const offset = (currentPage - 1) * +limit;
    const defaultLimit = limit ? limit : 10;
    const totalItems = (await this.jobModel.find({ ...filter })).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
      .find({ ...filter })
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

  async getJobWithUserApply(currentPage: number, limit: number, qs: string) {
    const resumes = await this.resumeModel.find({});
    const mp = new Map();
    resumes.forEach((resume) => {
      mp.set(
        resume.jobId.toString(),
        mp.get(resume.jobId.toString())
          ? mp.get(resume.jobId.toString()) + 1
          : 1,
      );
    });
    const arr = Array.from(mp).sort((a, b) => b[1] - a[1]);

    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    const offset = currentPage && limit ? (currentPage - 1) * +limit : 0;
    const defaultLimit = limit ? limit : 10;

    const jobs = await this.jobModel.find({ ...filter });

    const res = [];
    arr.forEach((item) => {
      for (let i = 0; i < jobs.length; i++) {
        if (item[0] === jobs[i]._id.toString()) {
          res.push({
            ...jobs[i].toObject(),
            userApply: item[1],
          });
          break;
        }
      }
    });

    const result = res.slice(offset, offset + defaultLimit);

    const totalItems = res.length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result: result, //kết quả query
    };
  }

  async getAllTotalJob() {
    return await this.jobModel.find({});
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    const currentUser = await this.userModel.findById(user._id);

    const offset = (currentPage - 1) * +limit;
    const defaultLimit = limit ? limit : 10;
    let totalItems = (await this.jobModel.find({ ...filter })).length;
    if (user.role.name === 'HR') {
      totalItems = (
        await this.jobModel.find({
          ...filter,
          'company._id': currentUser.company._id,
        })
      ).length;
    }
    const totalPages = Math.ceil(totalItems / defaultLimit);

    let result = await this.jobModel
      .find({ ...filter })
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    if (user.role.name === 'HR') {
      result = await this.jobModel
        .find({
          ...filter,
          'company._id': currentUser.company._id,
        })
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate(population)
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

    return await this.jobModel.findOne({ _id: id });
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Id is invalid!';
    }

    const {
      name,
      skills,
      company,
      location,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
    } = updateJobDto;

    this.checkDate(new Date(startDate).getTime(), new Date(endDate).getTime());

    const currentUser = await this.userModel.findById(user._id);
    const job = await this.jobModel.findById(id);

    if (user.role.name === 'HR') {
      if (job.company._id.toString() === currentUser.company._id.toString()) {
        return await this.jobModel.updateOne(
          { _id: id },
          {
            name,
            skills,
            company,
            location,
            salary,
            quantity,
            level,
            description,
            startDate,
            endDate,
            isActive,
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        );
      } else {
        throw new BadRequestException(
          'HR không để cập nhật Job cho công ty khác!',
        );
      }
    }

    return await this.jobModel.updateOne(
      { _id: id },
      {
        name,
        skills,
        company,
        location,
        salary,
        quantity,
        level,
        description,
        startDate,
        endDate,
        isActive,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Id is invalid!';
    }

    const currentUser = await this.userModel.findById(user._id);
    const job = await this.jobModel.findById(id);

    if (user.role.name === 'HR') {
      if (job.company._id.toString() === currentUser.company._id.toString()) {
        await this.jobModel.updateOne(
          { _id: id },
          {
            deletedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        );
        return await this.jobModel.softDelete({ _id: id });
      } else {
        throw new BadRequestException('HR không để xóa Job cho công ty khác!');
      }
    }
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.jobModel.softDelete({ _id: id });
  }
}
