import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,

    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  @Cron('30 * * * * *')
  testCron() {
    console.log('alo');
  }

  @Get()
  @Public()
  @ResponseMessage('Test email')
  @Cron('0 0 0 * * 0')
  async handleTestEmail() {
    let jobs = [
      {
        name: 'Công việc FullStack',
        company: 'Công ty abc',
        salary: '30000000đ',
        skills: ['REACT.JS', 'NODE.JS', 'SWIFT', 'UNITY'],
      },
      {
        name: 'Công việc BackEnd',
        company: 'Công ty xyz',
        salary: '20000000đ',
        skills: ['NEST.JS', 'NODE.JS', 'JAVA', 'PYTHON'],
      },
    ];

    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills },
      });

      if (jobWithMatchingSkills.length) {
        jobs = jobWithMatchingSkills.map((item) => {
          return {
            name: item.name,
            company: item.company.name,
            salary:
              `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: item.skills,
          };
        });

        await this.mailerService.sendMail({
          to: 'namhello2003@gmail.com',
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          template: 'new-job',
          context: {
            receiver: 'Nguyễn Viết Nam',
            jobs,
          },
        });
      }
    }
  }
}
