import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { MoreThan, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { createReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report, ReportStatus } from './report.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
    ) {}

    async getAllReportWithCount() {
        const year = dayjs().year;
        return this.reportRepository.findAndCount();
    }

    async create(createReportDto: createReportDto, user: User) {
        const report = await this.reportRepository.create({
            uniqueId: uuidv4(),
            content: createReportDto.content,
            target: createReportDto.target,
            reportType: createReportDto.reportType,
            type: createReportDto.type,
            reporter: user,
        });

        return this.reportRepository.save(report);
    }

    async findAll() {
        return this.reportRepository.find({
            relations: ['reporter'],
        });
    }

    async getSingle(uniqueId: string) {
        return this.reportRepository.findOne({
            where: {
                uniqueId,
            },
            relations: ['reporter'],
        })
    }

    async updateReport(uniqueId: string, updateReportDto: UpdateReportDto) {
        const report = await this.reportRepository.findOne({
            uniqueId,
        });
        if(updateReportDto.status.toLowerCase() === ReportStatus.ACCEPT) {
            report.status  = ReportStatus.ACCEPT;
        } else if (updateReportDto.status.toLowerCase() === ReportStatus.PENDING) {
            report.status  = ReportStatus.PENDING;
        } else if (updateReportDto.status.toLowerCase() === ReportStatus.COMPLETED) {
            report.status  = ReportStatus.COMPLETED;
        } else {
            report.status  = ReportStatus.REJECT;
        }
        this.reportRepository.update(report.id, report);
    }
}
