import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bankAccount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findActive() {
    return this.prisma.bankAccount.findFirst({ where: { isActive: true } });
  }

  async create(data: {
    bankName: string;
    bankShortName: string;
    accountNumber: string;
    accountName: string;
    isActive?: boolean;
  }) {
    return this.prisma.bankAccount.create({ data });
  }

  async update(id: string, data: any) {
    const account = await this.prisma.bankAccount.findUnique({ where: { id } });
    if (!account) throw new NotFoundException('Tài khoản không tồn tại');
    return this.prisma.bankAccount.update({ where: { id }, data });
  }

  async remove(id: string) {
    const account = await this.prisma.bankAccount.findUnique({ where: { id } });
    if (!account) throw new NotFoundException('Tài khoản không tồn tại');
    return this.prisma.bankAccount.delete({ where: { id } });
  }
}
